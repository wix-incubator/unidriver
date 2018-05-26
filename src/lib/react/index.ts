import { UniDriverList, Locator, UniDriver } from '..';
import { Simulate } from 'react-dom/test-utils';
import { waitFor } from '../../utils';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ElementOrElementFinder = (() => Element) | Element | (() => Promise<Element>);
type ElementsOrElementsFinder = (() => Element[]) | Element[] | (() => Promise<Element[]>);

const isPromise = (a: Promise<any> | any ): a is Promise<any> => {
	return !!((a as any).then);
};

export const reactUniDriverList = (containerOrFn: ElementsOrElementsFinder): UniDriverList<Element> => {
	const elem = async () => {
		const elements = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
		return isPromise(elements) ? await elements : elements;
	};

	return {
		get: (idx: number) => reactUniDriver(() => {
			return elem().then((cont) => cont[idx]);
		}),
		text: async () => (await elem()).map((e) => e.textContent || ''),
		count: async () => (await elem()).length,
		map: async (fn) => {
			const children = Array.from(await elem());
			return Promise.all(children.map((e, idx) => {
				return fn(reactUniDriver(e), idx);
			}));
		},
		filter: (fn) => {
			return reactUniDriverList(async () => {
				const elems = await elem();

				const results = await Promise.all(elems.map((e, i) => {
					const bd = reactUniDriver(e);
					return fn(bd, i);
				}));

				return elems.filter((_, i) => {
					return results[i];
				});
			});
		}
	};
};

export const reactUniDriver = (containerOrFn: ElementOrElementFinder): UniDriver<Element> => {

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
			return reactUniDriver(getElement);
		},
		$$: (selector: Locator) => reactUniDriverList(async () => {
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

			// this won't work if the element is not
			if (document.body.contains(el)) {
				const event = document.createEvent('HTMLEvents');
				event.initEvent('click', true, false);
				el.dispatchEvent(event);
			} else {
				Simulate.click(el);
			}
		},
		hasClass: async (className: string) => (await elem()).classList.contains(className),
		enterValue: async (value: string) => {
			await wait(0);
			const el = (await elem()) as HTMLInputElement;
			el.value = value;
			Simulate.change(el);
		},
		attr: async (name: string) => {
			return (await elem()).getAttribute(name) || '';
		},
		exists,
		wait: async () => {
			return waitFor(exists);
		},
		type: 'react',
		getNative: () => elem()
	};
};
