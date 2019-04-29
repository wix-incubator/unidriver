import {browser, ElementFinder} from 'protractor';
import {Key as SeleniumKey} from 'selenium-webdriver';
import {Locator, UniDriverList, UniDriver, MapFn, waitFor, NoElementWithLocatorError, MultipleElementsWithLocatorError, isMultipleElementsWithLocatorError} from '@unidriver/core';
type ElementGetter = () => Promise<ElementFinder | null>;
type ElementsGetter = () => Promise<ElementFinder[]>;

const camelCaseToHyphen = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1_$2');
const interpolateSeleniumSpecialKeys = (key: string) => {
  switch (key) {
    case 'BACKSPACE':
      return 'BACK_SPACE';

    default:
      return key;
  }
};

export const protractorUniDriverList = (
  elems: ElementsGetter
): UniDriverList<ElementFinder> => {
  const map = async <T>(fn: MapFn<T>) => {
    const els = await elems();
    const promises = els.map((e, i) => {
      const bd = protractorUniDriver(() => Promise.resolve(e));
      return fn(bd, i);
    });
    return Promise.all(promises);
  };

  return {
    get: (idx: number) => {
      const elem = async () => {
        const els = await elems();
        return els[idx];
      };
      return protractorUniDriver(elem);
    },
    text: async () => {
      return map(d => d.text());
    },
    count: async () => {
      const els = await elems();
      return els.length;
    },
    map,
    filter: fn => {
      return protractorUniDriverList(async () => {
        const els = await elems();

        const results = await Promise.all(
          els.map((e, i) => {
            const bd = protractorUniDriver(() => Promise.resolve(e));
            return fn(bd, i);
          })
        );

        return els.filter((_, i) => {
          return results[i];
        });
      });
    }
  };
};

export const protractorUniDriver = (
  el: ElementGetter
): UniDriver<ElementFinder> => {
  const safeElem: () => Promise<ElementFinder> = async () => {
    const e = await el();
    if (!e || !(await e.isPresent())) {
      throw new Error(`Cannot find element`);
    }
    return e;
  };

  const exists = async () => {
	try {
		await safeElem();
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
    // done
    $: (newLoc: Locator) => {
      return protractorUniDriver(async () => {
        const elmArrFinder = (await safeElem()).$$(newLoc);
        const count = await elmArrFinder.count();
        if (count === 0) {
          throw new NoElementWithLocatorError(newLoc);
        } else if (count > 1) {
          throw new MultipleElementsWithLocatorError(elmArrFinder.length, newLoc);
        }
        return elmArrFinder.get(0);
      });
    },
    // done
    $$: (selector: Locator) =>
      protractorUniDriverList(async () => {
        const element = await safeElem();
        return element.$$(selector);
      }),
    text: async () => {
      const text = await (await safeElem()).getAttribute('textContent');
      return text || '';
    },
    click: async () => {
      return (await safeElem()).click();
    },
    hover: async () => {
      const e = await safeElem();

      return (await e.browser_.actions().mouseMove(e).perform());
    },
		pressKey: async(key: string) => {
      const el = await safeElem();
      const realKey = interpolateSeleniumSpecialKeys(camelCaseToHyphen(key).toUpperCase());
      const value = SeleniumKey[realKey as keyof typeof SeleniumKey] as string;
      if (value) {
        await el.sendKeys(value);
      } else {
        return el.sendKeys(key); 
      }
    },
    hasClass: async (className: string) => {
      const cm = await (await safeElem()).getAttribute('class');
      return cm.split(' ').includes(className);
    },
    enterValue: async (value: string) => {
      const e = await safeElem();
      await e.sendKeys(value);
    },
    mouse: {
			press: async() => {
        const e = await safeElem();
        return (await e.browser_.actions().mouseDown(e).perform());
			},
			release: async () => {
        const e = await safeElem();
        return (await e.browser_.actions().mouseUp(e).perform());
      },
      moveTo: async (to) => {
        const e = await safeElem();
        const nativeElem = await to.getNative();
        await (await e.browser_.actions().mouseMove(nativeElem).perform());
      }
		},
    exists,
    isDisplayed: async () => {
      const el = await safeElem();

      const retValue: boolean =
        await browser.executeScript<boolean>(
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
    value: async () => {
      const value = await (await safeElem()).getAttribute('value');
      return value || '';
    },
    attr: async name => {
      const attr = await (await safeElem()).getAttribute(name);
      return attr;
    },
    wait: async () => {
      return waitFor(exists);
    },
    type: 'protractor',
    scrollIntoView: async () => {
      const el = await safeElem();
      return browser.executeScript((el: HTMLElement) => el.scrollIntoView(), el.getWebElement())
    },
    getNative: safeElem,
    _prop: async (name: string) => {
      const el = await safeElem();
      return browser.executeScript(function(){return arguments[0][arguments[1]]}, el.getWebElement(),name)
    }
  };
};
