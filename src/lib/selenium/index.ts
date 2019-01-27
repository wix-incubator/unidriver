import { Locator, UniDriverList, UniDriver, MapFn } from '..';
import { By, WebElement}                            from 'selenium-webdriver';
import { waitFor }                                  from '../../utils';

export type WebElementGetter = () => Promise<WebElement>;
export type WebElementsGetter = () => Promise<WebElement[]>;


export const seleniumUniDriverList = (wep: WebElementsGetter): UniDriverList<WebElement> => {
	// const elem = () => Array.from(container.querySelectorAll(loc));

	const map = async <T>(fn: MapFn<T>) => {
		const els = await wep();
		const promises = els.map((e, i) => {
			const bd = seleniumUniDriver(() => Promise.resolve(e));
			return fn(bd, i);
		});
		return Promise.all(promises);
	};

	return {
		get: (idx: number) => seleniumUniDriver(async () => {
			const els = await wep();
			return els[idx] as any;
		}),
		text: async () => {
			return map((we) => we.text());
		},
		count: async () => {
			const els = await wep();
			return els.length;
		},
		map,
		filter: (fn) => {
			return seleniumUniDriverList(async () => {
				const elems = await wep();

				const results = await Promise.all(elems.map((e, i) => {
					const bd = seleniumUniDriver(() => Promise.resolve(e));
					return fn(bd, i);
				}));

				return elems.filter((_, i) => {
					return results[i];
				});
			});
		}
	};
};

export const seleniumUniDriver = (wep: WebElementGetter): UniDriver<WebElement> => {


	const elem = async () => {
		const e = await wep();
		if (!e) {
			throw new Error(`Cannot find element`);
		}
		return e;
	}

	const exists = async () => {
		return elem().then(() => true, () => false);
	};

	return {
		$: (selector: Locator) => seleniumUniDriver(async () => {
			return (await elem()).findElement(By.css(selector));
		}),
		$$: (selector: Locator) => seleniumUniDriverList(async () => {
			const el = await elem();
			return el.findElements(By.css(selector))
		}),
		text: async () => {
			const el = await elem();
			return el.getText();
		},
		attr: async (name) => {
			const el = await elem();
			return el.getAttribute(name);
		},
		value: async () => {
			const el = await elem();
			return el.getAttribute('value');
		},
		click: async () => (await elem()).click(),
		hover: async() => {
			const el = await elem();
			const driver = await el.getDriver();
			const actions = await (driver as any).actions({bridge: true});

			return await actions.mouseMove({x:1, y:1, origin: el}).perform();
		},
		hasClass: async (className: string) => {
			const el = await elem();
			const cl = await el.getAttribute('class');
			return cl.indexOf(className) !== -1;
		},
		enterValue: async (value: string) => {
			(await elem()).sendKeys(value);
		},
		exists,
		isDisplayed: async () => {
			const el = await elem();

			const retValue: boolean =
				await el.getDriver().executeScript<boolean>(
					'const elem = arguments[0], ' +
					'			box = elem.getBoundingClientRect(), ' +
					'			cx = box.left + box.width / 2, ' +
					'			cy = box.top + box.height / 2, ' +
					'			e = document.elementFromPoint(cx, cy); ' +
					'		for (; e; e = e.parentElement) { ' +
					'			if ( e === elem) return true; ' +
					'		} ' +
					'' +
					'		return false;', el);
			return retValue;
		},
		wait: async () => {
			return waitFor(exists);
		},
		type: 'selenium',
		scrollIntoView: async () => {
			const el = await elem();

			//return el.getDriver().executeScript(`window.scrollTo(${location.x}, ${location.y});`);
			return el.getDriver().executeScript('arguments[0].scrollIntoView();', el);
		},
		getNative: elem
	};
};
