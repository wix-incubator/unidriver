import {browser, ElementFinder} from 'protractor';
import {Key as SeleniumKey} from 'selenium-webdriver';
import {Locator, UniDriverList, UniDriver, MapFn, waitFor, NoElementWithLocatorError, MultipleElementsWithLocatorError, isMultipleElementsWithLocatorError, EnterValueOptions, DriverContext, contextToWaitError} from '@unidriver/core';

type TsSafeElementFinder = Omit<ElementFinder, 'then'>;

type ElementGetter = () => Promise<TsSafeElementFinder | null>;
type ElementsGetter = () => Promise<TsSafeElementFinder[]>;


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
  elems: ElementsGetter,
  context: DriverContext = {selector: 'Root Protractor list driver'}
): UniDriverList<TsSafeElementFinder> => {
  const map = async <T>(fn: MapFn<T>) => {
    const els = await elems();
    const promises = els.map((e, i) => {
      const bd = protractorUniDriver(() => Promise.resolve(e), { parent: context, idx: i, selector: context.selector });
      return fn(bd, i);
    });
    return Promise.all(promises);
  };

  return {
    get: (idx: number) => {
      const elem = async () => {
        const els: any = await elems(); // any due to element finder also having a "then" property, causing TS1058
        return els[idx];
      };
      return protractorUniDriver(elem, {parent: context, idx, selector: context.selector});
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
      return protractorUniDriverList(
        async () => {
          const els = await elems();

          const results = await Promise.all(
            els.map((e, i) => {
              const bd = protractorUniDriver(() => Promise.resolve(e), {
                parent: context,
                idx: i,
                selector: context.selector,
              });
              return fn(bd, i);
            })
          );

          return els.filter((_, i) => {
            return results[i];
          });
        },
        { parent: context, selector: context.selector }
      );
    }
  };
};

export const protractorUniDriver = (
  el: ElementGetter,
  context: DriverContext = {selector: 'Root Protractor driver'}
): UniDriver<TsSafeElementFinder> => {
  const safeElem: () => Promise<TsSafeElementFinder> = async () => {
    const e = await el();
    if (!e || !(await e.isPresent())) {
      throw new Error(`Cannot find element`);
    }
    return e as TsSafeElementFinder;
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

const slowType = async (element: TsSafeElementFinder, value: string, delay: number) => {
  for (let i = 0; i < value.length; i++) {
    await element.sendKeys(value[i]);
    await browser.sleep(delay);
  }
};

const adapter: UniDriver<TsSafeElementFinder> = {
  // done
  $: (newLoc: Locator) => {
    return protractorUniDriver(
      async () => {
        const elmArrFinder = (await safeElem()).$$(newLoc);
        const count = await elmArrFinder.count();
        if (count === 0) {
          throw new NoElementWithLocatorError(newLoc);
        } else if (count > 1) {
          throw new MultipleElementsWithLocatorError(
            elmArrFinder.length,
            newLoc
          );
        }
        return elmArrFinder.get(0) as TsSafeElementFinder;
      },
      { parent: context, selector: newLoc }
    );
  },
  // done
  $$: (selector: Locator) =>
    protractorUniDriverList(
      async () => {
        const element = await safeElem();
        return element.$$(selector);
      },
      { parent: context, selector }
    ),
  text: async () => {
    const text = await (await safeElem()).getAttribute("textContent");
    return text || "";
  },
  click: async () => {
    return (await safeElem()).click();
  },
  hover: async () => {
    const e = await safeElem();

    return browser.actions()
      .mouseMove(e as ElementFinder)
      // .mouseDown(e)
      // .mouseUp(e)
      .perform();
  },
  pressKey: async (key) => {
    const el = await safeElem();
    const realKey = interpolateSeleniumSpecialKeys(
      camelCaseToHyphen(`${key}`).toUpperCase()
    );
    const value = SeleniumKey[realKey as keyof typeof SeleniumKey] as string;
    if (value) {
      await el.sendKeys(value);
    } else {
      return el.sendKeys(key);
    }
  },
  hasClass: async (className: string) => {
    const cm = await (await safeElem()).getAttribute("class");
    return cm.split(" ").includes(className);
  },
  enterValue: async (
    value: string,
    { delay, shouldClear = true }: EnterValueOptions = {}
  ) => {
    const e = await safeElem();
    const disabled = await e.getAttribute("disabled");
    const readOnly = await e.getAttribute("readOnly");
    // Don't do anything if element is disabled or readOnly
    if (disabled || readOnly) {
      return;
    }
    if (shouldClear) {
      await e.clear();
    }
    if (delay) {
      await slowType(e, value, delay);
    } else {
      await e.sendKeys(value);
    }
  },
  mouse: {
    press: async () => {

      const e = await safeElem() as ElementFinder;
      return browser.actions()
    .mouseMove(e)
    .mouseDown(e)
    .perform();

    },
    release: async () => {
      const e = await safeElem() as ElementFinder;

      return browser.actions()
      .mouseMove(e)
      .mouseUp(e)
      .perform();
    },
    moveTo: async (to) => {
      const nativeElem = await to.getNative() as ElementFinder;

      return browser.actions()
      .mouseMove(nativeElem)
      .perform();
    },
    leave: async () => {
      const e = await safeElem() as ElementFinder;
      await browser.actions()
          .mouseMove(e)
          .perform();

      return browser.actions()
      .mouseMove({ x: -999, y: -999 })
      .perform();
    },
  },
  exists,
  isDisplayed: async () => {
    const el = await safeElem();

    const retValue: boolean = await browser.executeScript(
      "const elem = arguments[0], " +
        "			box = elem.getBoundingClientRect(), " +
        "			cx = box.left + box.width / 2, " +
        "			cy = box.top + box.height / 2, " +
        "			e = document.elementFromPoint(cx, cy); " +
        "		for (; e; e = e.parentElement) { " +
        "			if ( e === elem) return true; " +
        "		} " +
        "" +
        "		return false;",
      el
    );
    return retValue;
  },
  value: async () => {
    const value = await (await safeElem()).getAttribute("value");
    return value || "";
  },
  attr: async (name) => {
    const attr = await (await safeElem()).getAttribute(name);
    return attr;
  },
  wait: async (timeout?: number) => {
    return waitFor(exists, timeout, 30, contextToWaitError(context));
  },
  type: "protractor",
  scrollIntoView: async () => {
    const el = await safeElem();
    return browser.executeScript(
      (el: HTMLElement) => el.scrollIntoView(),
      el.getWebElement()
    );
  },
  getNative: safeElem,
  _prop: async (name: string) => {
    const el = await safeElem();
    return browser.executeScript(
      function () {
        return arguments[0][arguments[1]];
      },
      el.getWebElement(),
      name
    );
  },
};

  return adapter;
};
