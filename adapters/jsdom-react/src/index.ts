import { UniDriverList, Locator, UniDriver, waitFor, getDefinitionForKeyType } from '@unidriver/core';
import { Simulate } from 'react-dom/test-utils';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ElementOrElementFinder = (() => Element) | Element | (() => Promise<Element>);
type ElementsOrElementsFinder = (() => Element[]) | Element[] | (() => Promise<Element[]>);

const isPromise = (a: Promise<any> | any ): a is Promise<any> => {
	return !!((a as any).then);
};

export const jsdomReactUniDriverList = (containerOrFn: ElementsOrElementsFinder): UniDriverList<Element> => {
	const elem = async () => {
		const elements = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
		return isPromise(elements) ? await elements : elements;
	};

	return {
		get: (idx: number) => jsdomReactUniDriver(() => {
			return elem().then((cont) => cont[idx]);
		}),
		text: async () => (await elem()).map((e) => e.textContent || ''),
		count: async () => (await elem()).length,
		map: async (fn) => {
			const children = Array.from(await elem());
			return Promise.all(children.map((e, idx) => {
				return fn(jsdomReactUniDriver(e), idx);
			}));
		},
		filter: (fn) => {
			return jsdomReactUniDriverList(async () => {
				const elems = await elem();

				const results = await Promise.all(elems.map((e, i) => {
					const bd = jsdomReactUniDriver(e);
					return fn(bd, i);
				}));

				return elems.filter((_, i) => {
					return results[i];
				});
			});
		}
	};
};

export const jsdomReactUniDriver = (containerOrFn: ElementOrElementFinder): UniDriver<Element> => {

	const elem = async () => {
		const container = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
		if (!container) {
			throw new Error('React base driver - element was not found');
		}
		return container;
	};

	const exists = async () => {
		try {
			await elem();
			return true;
		} catch (e) {
			return false;
		}
	};

	return {
		$: (loc: Locator) => {
			const getElement = async () => {
				const container = await elem();
				const elements = container.querySelectorAll(loc);
				if (!elements.length) {
					throw new Error(`Cannot find element with locator: ${loc}`);
				} else if (elements.length > 1) {
					throw new Error(`Found ${elements.length} elements with ${loc}. Only 1 is expected. This is either a bug or not-specific-enough locator`);
				}
				return elements[0];
			};
			return jsdomReactUniDriver(getElement);
		},
		$$: (selector: Locator) => jsdomReactUniDriverList(async () => {
			const e = await elem();
			return Array.from(e.querySelectorAll(selector));
		}),
		text: async () => elem().then((e) => e.textContent || ''),
		value: async () => {
			const e = (await elem()) as HTMLInputElement;
			return e.value;
		},
		click: async () => {
			const el = await elem();
			// setting button 0 is now needed in React 16+ as it's not set by react anymore
			// 15 - https://github.com/facebook/react/blob/v15.6.1/src/renderers/dom/client/syntheticEvents/SyntheticMouseEvent.js#L45
			// 16 - https://github.com/facebook/react/blob/master/packages/react-dom/src/events/SyntheticMouseEvent.js#L33

			// native events are preferred, but they will only work in React if the element is part of the DOM
			if (document.body.contains(el)) {
				const event: any  = document.createEvent('HTMLEvents');
				event.button = 0;
				event.initEvent('click', true, false);
				el.dispatchEvent(event);
			} else {
				Simulate.click(el, {button: 0});
			}
		},
		mouse: {
			press: async() => {
				const el = await elem();

				if (document.body.contains(el)) {
					const mouseup = new MouseEvent('mousedown');
					mouseup.initEvent(mouseup.type, true, false);
					el.dispatchEvent(mouseup);
				} else {
					Simulate.mouseDown(el);
				}
			},
			release: async () => {
				const el = await elem();

				if (document.body.contains(el)) {
					const mouseup = new MouseEvent('mouseup');
					mouseup.initEvent(mouseup.type, true, false);
					el.dispatchEvent(mouseup);
				} else {
					Simulate.mouseUp(el);
				}
			},
			moveTo: async (to) => {
				const el = await elem();
				const {left, top} = (await to.getNative()).getBoundingClientRect();

				if (document.body.contains(el)) {
					const mousemove = new MouseEvent('mousemove', {clientX: left, clientY: top});;
					mousemove.initEvent(mousemove.type, true, false);
					el.dispatchEvent(mousemove);
				} else {
					Simulate.mouseMove(el, {clientX: left, clientY: top});
				}
			}
		},
		hover: async () => {
			const el = await elem();

			if (document.body.contains(el)) {
				const mouseenter: any = document.createEvent('HTMLEvents');
				const mouseover: any = document.createEvent('HTMLEvents');

 				mouseover.initEvent('mouseover', true, false);
 				mouseenter.initEvent('mouseenter', true, false);

 				el.dispatchEvent(mouseenter);
 				el.dispatchEvent(mouseover)
			} else {
				Simulate.mouseOver(el);
				Simulate.mouseEnter(el);
			}
		},
		pressKey: async (key) => {
			const el = await elem();
			const def = getDefinitionForKeyType(key);


			// enabling this throws an error with JSDOM. Thuss, pesskey will only use Simulate
			/*
			 if (document.body.contains(el)) {
			// 	const keydown = new KeyboardEvent('keydown', {...def});
			// 	const keyup = new KeyboardEvent('keyup', {...def});


 			// 	keydown.initEvent(keydown.type, true, false);
			// 	el.dispatchEvent(keydown);
			// 	await (Promise.resolve());
 			// 	keyup.initEvent(keyup.type, true, false);
			// 	el.dispatchEvent(keyup)

			// } else {
				
			// }
			*/
			Simulate.keyDown(el, def);
			Simulate.keyUp(el, def);
		},
		hasClass: async (className: string) => (await elem()).classList.contains(className),
		enterValue: async (value: string) => {
			const el = (await elem()) as HTMLInputElement;
			el.value = value;
			Simulate.change(el);
		},
		attr: async (name: string) => {
		const el = await elem();
		return el.getAttribute(name);
		},
		exists,
		isDisplayed: async () => {
			return true;
		},
		wait: async () => {
			return waitFor(exists);
		},
		type: 'react',
		scrollIntoView: async () => { return {} },
		getNative: () => elem()
	};
};
