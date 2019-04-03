import {Locator, UniDriverList, UniDriver, MapFn, waitFor, NoElementWithLocatorError, MultipleElementsWithLocatorError, isMultipleElementsWithLocatorError} from '@unidriver/core';
import {browser, ElementFinder} from 'protractor';

type ElementGetter = () => Promise<ElementFinder | null>;
type ElementsGetter = () => Promise<ElementFinder[]>;

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
  const safeElem = async () => {
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
      const e = await safeElem();
      await e.sendKeys(key)
    },
    hasClass: async (className: string) => {
      const cm: any = await (await safeElem()).getAttribute('classList');
      return cm.indexOf(className) !== -1;
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
      const e = await safeElem();
      return e.isDisplayed();
    },
    value: async () => {
      const value = await (await safeElem()).getAttribute('value');
      return value || '';
    },
    attr: async name => {
      const attr = await (await safeElem()).getAttribute(name);
      return attr || '';
    },
    wait: async () => {
      return waitFor(exists);
    },
    type: 'protractor',
    scrollIntoView: async () => {
      const el = await safeElem();

      return browser.controlFlow().execute(() => browser.executeScript('arguments[0].scrollIntoView(true)', el.getWebElement()));
    },
    getNative: safeElem
  };
};
