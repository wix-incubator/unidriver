import { Locator, UniDriverList, UniDriver, MapFn } from '..';
import { ElementFinder } from 'protractor';
import { waitFor } from '../../utils';

type ElementGetter = () => Promise<ElementFinder | null>;
type ElementsGetter = () => Promise<ElementFinder []>;

export const protrUniDriverList = (elems: ElementsGetter): UniDriverList<ElementFinder > => {

	const map = async <T>(fn: MapFn<T>) => {
		const els = await elems();
		const promises = els.map((e, i) => {
			const bd = protrUniDriver(() => Promise.resolve(e));
			return fn(bd, i);
		});
		return Promise.all(promises);
	};

	return {
		get: (idx: number) => {
			const elem = async () => {
				const els =  await elems();
				return els[idx];
			};
			return protrUniDriver(elem);
		},
		text: async () => {
			return map((d) => d.text());
		},
		count: async () => {
			const els = await elems();
			return els.length;
		},
		map,
		filter: (fn) => {
			return protrUniDriverList(async () => {
				const els = await elems();

				const results = await Promise.all(els.map((e, i) => {
					const bd = protrUniDriver(() => Promise.resolve(e));
					return fn(bd, i);
				}));

				return els.filter((_, i) => {
					return results[i];
				});
			});
		}
	};
};

export const protrUniDriver = (el: ElementGetter): UniDriver<ElementFinder> => {


	const elem = async () => {
		const e = await el();
		if (!e) {
			throw new Error(`Cannot find element`);
		}
		return e;
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
    // done
		$: (newLoc: Locator) => {
			return protrUniDriver(async () => {
				return (await elem()).$(newLoc);
			});
    },
    // done
		$$: (selector: Locator) => protrUniDriverList(async () => {
			const elem = await el();
			if (!elem) {
				throw new Error(`Cannot find element`);
			}
			return elem.$$(selector)
		}),
		text: async () => {
			const el = await elem();
			const textHandle = await el.getProperty('textContent');
			const text = await textHandle.jsonValue();
			return text || '';
		},
		click: async () => {
			return (await elem()).click();
		},
		hasClass: async (className: string) => {
			const el = await elem();
			const cm: any = await el.getProperty('classList');
			return cm.indexOf(className) !== -1;
		},
		enterValue: async (value: string) => {
			const e = await elem();
			await e.focus()
			await e.type(value);
		},
		exists,
		value: async () => {
			const el = await elem();
			const valueHandle = await el.getProperty('value');
			const value = await valueHandle.jsonValue();
			return value || '';
		},
		attr: async (name) => {
			const el = await elem();
			const attrsHandle = await el.getProperty('attributes');
			const attrs = await attrsHandle.jsonValue();
			return attrs[name] || '';
		},
		wait: async () => {
			return waitFor(exists);
		},
		type: 'protractor',
		getNative: elem
	};
};
