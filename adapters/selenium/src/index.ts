import { Locator, UniDriverList, UniDriver, MapFn, waitFor, NoElementWithLocatorError, MultipleElementsWithLocatorError, isMultipleElementsWithLocatorError } from '@unidriver/core';
import { By, WebElement, Key as SeleniumKey } from 'selenium-webdriver';

export type WebElementGetter = () => Promise<WebElement>;
export type WebElementsGetter = () => Promise<WebElement[]>;

const CamelCaseToHyphen = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1_$2');
const interpolateSeleniumSpecialKeys = (key: string) => {
  switch (key) {
    case 'BACKSPACE':
      return 'BACK_SPACE';

    default:
      return key;
  }
};

export const seleniumUniDriverList = (
  wep: WebElementsGetter
): UniDriverList<WebElement> => {

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
          })
        );

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
    $: (selector: Locator) => seleniumUniDriver(async () => {
		const els = await (await elem()).findElements(By.css(selector));
		if (els.length === 0) {
			throw new NoElementWithLocatorError(selector);
		} else if (els.length > 1) {
			throw new MultipleElementsWithLocatorError(els.length, selector);
		} else {
			return els[0];
		}
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
    hover: async () => {
      const el = await elem();
      const driver = await el.getDriver();
      const actions = await driver.actions();
      return actions.mouseMove(el).perform();
    },
    pressKey: async (key) => {
      const el = await elem();
      const realKey = interpolateSeleniumSpecialKeys(CamelCaseToHyphen(key).toUpperCase());
      const value = SeleniumKey[realKey as keyof typeof SeleniumKey] as string;
      if (value) {
        await el.sendKeys(value);
      } else {
        return el.sendKeys(key); 
      }
    },
    hasClass: async (className: string) => {
      const el = await elem();
      const cl = await el.getAttribute('class');
      return cl.split(' ').filter(c => c === className).length > 0;
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
    mouse: {
			press: async() => {
        const el = await elem();
        const driver = await el.getDriver();
        const actions = await driver.actions();
        await actions.mouseDown(el).perform();
			},
			release: async () => {
        const el = await elem();
        const driver = await el.getDriver();
        const actions = await driver.actions();
        await actions.mouseUp(el).perform();
      },
      moveTo: async (to) => {
        const el = await elem();
        const driver = await el.getDriver();
        const actions = await driver.actions();
        const native = await to.getNative();
        await actions.mouseMove(native).perform();
			}
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
