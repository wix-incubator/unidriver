import { UniDriverList, Locator, UniDriver, waitFor, getDefinitionForKeyType } from '@unidriver/core';
import { Simulate } from 'react-dom/test-utils';
import { NoElementWithLocatorError } from '@unidriver/core';
import { isMultipleElementsWithLocatorError, MultipleElementsWithLocatorError } from '@unidriver/core';

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
			return elem().then((cont) => {
				const elem = cont[idx];
				if (!elem) {
					throw new Error('React base driver - element was not found');
				} else {
					return elem;
				}
			});
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
			if (isMultipleElementsWithLocatorError(e)) {
				throw e;
			} else {
				return false;
			}
		}
	};

	return {
		$: (loc: Locator) => {
			const getElement = async () => {
				const container = await elem();
				const elements = container.querySelectorAll(loc);
				if (!elements.length) {
					throw new NoElementWithLocatorError(loc);
				} else if (elements.length > 1) {
					throw new MultipleElementsWithLocatorError(elements.length, loc);
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
			Simulate.click(el, {button: 0});
		},
		mouse: {
			press: async() => {
				const el = await elem();

				Simulate.mouseDown(el);
			},
			release: async () => {
				const el = await elem();

				Simulate.mouseUp(el);
			},
			moveTo: async (to) => {
				const el = await elem();
				const {left, top} = (await to.getNative()).getBoundingClientRect();

				Simulate.mouseMove(el, {clientX: left, clientY: top});
			}
		},
		hover: async () => {
			const el = await elem();

			Simulate.mouseOver(el);
			Simulate.mouseEnter(el);
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
