import { Locator, UniDriverList, UniDriver, MapFn } from '..';
import { ElementHandle, Page } from 'puppeteer';
import {waitFor} from '../../utils';
// import {element} from 'prop-types';
// import { waitFor } from '../../utils';

type ElementContainer = {element: ElementHandle | null, page: Page, selector: string}
type ElementsContainer = {elements: ElementHandle[], page: Page, selector: string}

type ElementGetter = () => Promise<ElementContainer>;
type ElementsGetter = () => Promise<ElementsContainer>;

export const pupUniDriverList = (elems: ElementsGetter): UniDriverList<ElementContainer> => {

	const map = async <T>(fn: MapFn<T>) => {
		const {elements, ...rest} = await elems();
		const promises = elements.map((element, i) => {
			const bd = pupUniDriver(() => 
				Promise.resolve({element, ...rest})
			);
			return fn(bd, i);
		});
		return Promise.all(promises);
	};

	return {
		get: (idx: number) => {
			const elem = async () => {
				const {elements, ...rest} =  await elems();
				return {
					element: elements[idx],
					...rest,
				};
			};
			return pupUniDriver(elem);
		},
		text: async () => {
			return map((d) => d.text());
		},
		count: async () => {
			const {elements} = await elems();
			return elements.length;
		},
		map,
		filter: (fn) => {
			return pupUniDriverList(async () => {
				const {elements, ...rest} = await elems();
				const results = await map(fn);
				const filteredElements = elements.filter((_, i) => {
					return results[i];
				});
				return {
					elements: filteredElements,
					...rest
				}

			});
		}
	};
};

export const pupUniDriver = (el: ElementGetter): UniDriver<ElementContainer> => {

	const elem = async() => {
		const {element, ...rest} = await el();
		if (!element) {
			throw new Error(`Cannot find element`);
		}
		return {
			...rest,
			element
		};
	}

	const exists = async () => {
		try {
			await elem();
			return true;
		} catch (e) {
			return false;
		}
	};

	return {
		$: (newLoc: Locator) => {
			return pupUniDriver(async () => {
				const {element, ...rest} = await elem();
				return {
					...rest,
					element: await element.$(newLoc),
					selector: newLoc
				}
			});
		},
		$$: (newLoc: Locator) => pupUniDriverList(async () => {
			const {element, selector, ...rest} = await elem();
			return {
				...rest,
				elements: await element.$$(newLoc),
				selector: newLoc
			}
		}),
		text: async () => {
			const {element} = await elem();
			const textHandle = await element.getProperty('textContent');
			const text = await textHandle.jsonValue();
			return text || '';
		},
		click: async () => {
			return (await elem()).element.click();
		},
		hover: async () => {
			return (await elem()).element.hover();
		},
		hasClass: async (className: string) => {
			const {element} = await elem();
			const cm: any = await element.getProperty('classList');
			return cm.indexOf(className) !== -1;
		},
		enterValue: async (value: string) => {
			const {element} = await elem();
			await element.focus();
			await element.type(value);
		},
		exists,
		isDisplayed: async () => {
			const {element} = await elem();
			return element.isIntersectingViewport();
		},
		value: async () => {
			const {element} = await elem();
			
			const valueHandle = await element.getProperty('value');
			const value = await valueHandle.jsonValue();
			return value || '';
		},
    attr: async name => {
			const {page, selector} = await elem();
			return page.$eval(selector, (elem, name) => {
				return elem.getAttribute(name);
			}, name);
    },
		wait: async () => {
			return waitFor(exists);
		},
		type: 'puppeteer',
		scrollIntoView: async () => {
			const {element} = await elem();
			await element.hover();

			return {};
		},
		getNative: elem
	};
};
