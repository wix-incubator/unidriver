import { Locator, UniDriverList, UniDriver, MapFn } from '..';
import { ElementHandle } from 'puppeteer';
import { waitFor } from '../../utils';
import { Key, getModifiedKey } from '../key-types';

type ElementGetter = () => Promise<ElementHandle | null>;
type ElementsGetter = () => Promise<ElementHandle[]>;

export const pupUniDriverList = (
  elems: ElementsGetter
): UniDriverList<ElementHandle> => {
  const map = async <T>(fn: MapFn<T>) => {
    const els = await elems();
    const promises = els.map((e, i) => {
      const bd = pupUniDriver(() => Promise.resolve(e));
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
      return pupUniDriver(elem);
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
      return pupUniDriverList(async () => {
        const els = await elems();

        const results = await Promise.all(els.map((e, i) => {
            const bd = pupUniDriver(() => Promise.resolve(e));
            return fn(bd, i);
          }));

        return els.filter((_, i) => {
          return results[i];
        });
      });
    }
  };
};

export const pupUniDriver = (el: ElementGetter): UniDriver<ElementHandle> => {


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

  function press(key: Key): Promise<void>;
  function press(key: string): Promise<void>;
  async function press(key: string | Key): Promise<void> {
    const el = await elem();
    return el.press(getModifiedKey(key));
  }

  return {
    $: (newLoc: Locator) => {
      return pupUniDriver(async () => {
        return (await elem()).$(newLoc);
      });
    },
    $$: (selector: Locator) => pupUniDriverList(async () => {
        const elem = await el();
        if (!elem) {
          throw new Error(`Cannot find element`);
        }
        return elem.$$(selector);
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
    press,
    hover: async () => {
      return (await elem()).hover();
    },
    hasClass: async (className: string) => {
      const el = await elem();
      const cm: any = await el.getProperty('classList');
      return cm.indexOf(className) !== -1;
    },
    enterValue: async (value: string) => {
      const e = await elem();
      await e.focus();
      await e.type(value);
    },
    exists,
    isDisplayed: async () => {
      const e = await elem();
      return e.isIntersectingViewport();
    },
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
    type: 'puppeteer',
    scrollIntoView: async () => {
      const el = await elem();
      await el.hover();

      return {};
    },
    getNative: elem
  };
};
