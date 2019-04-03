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
  const elem = async () => {
    const e = await el();
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
    // done
    $: (newLoc: Locator) => {
      return protractorUniDriver(async () => {
        const elmArrFinder = (await elem()).$$(newLoc);
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
        const element = await el();
        if (!element) {
          throw new Error(`Cannot find element`);
        }
        return element.$$(selector);
      }),
    text: async () => {
      const text = await (await elem()).getAttribute('textContent');
      return text || '';
    },
    click: async () => {
      return (await elem()).click();
    },
    hover: async () => {
      const e = await elem();

      return (await e.browser_.actions().mouseMove(e).perform());
    },
		pressKey: async(key: string) => {
      const e = await elem();
      await e.sendKeys(key)
    },
    hasClass: async (className: string) => {
      const cm: any = await (await elem()).getAttribute('classList');
      return cm.indexOf(className) !== -1;
    },
    enterValue: async (value: string) => {
      const e = await elem();
      await e.focus();
      await e.type(value);
    },
    mouse: {
			press: async() => {
        const e = await elem();
        return (await e.browser_.actions().mouseDown(e).perform());
			},
			release: async () => {
        const e = await elem();
        return (await e.browser_.actions().mouseUp(e).perform());
      },
      moveTo: async (to) => {
        const e = await elem();
        const nativeElem = await to.getNative();
        await (await e.browser_.actions().mouseMove(nativeElem).perform());
      }
		},
    exists,
    isDisplayed: async () => {
      const e = await elem();
      return e.isDisplayed();
    },
    value: async () => {
      const value = await (await elem()).getAttribute('value');
      return value || '';
    },
    attr: async name => {
      const attr = await (await elem()).getAttribute(name);
      return attr || '';
    },
    wait: async () => {
      return waitFor(exists);
    },
    type: 'protractor',
    scrollIntoView: async () => {
      const el = await elem();

      return browser.controlFlow().execute(() => browser.executeScript('arguments[0].scrollIntoView(true)', el.getWebElement()));
    },
    getNative: elem
  };
};
