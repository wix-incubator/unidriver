import { Wrapper } from '@vue/test-utils';
import {
  UniDriver,
  UniDriverList,
  DriverContext,
  MultipleElementsWithLocatorError,
  NoElementWithLocatorError,
  waitFor,
  delay as sleep,
  contextToWaitError,
  isMultipleElementsWithLocatorError,
  EnterValueOptions,
  getDefinitionForKeyType,
} from '@unidriver/core';

const isPromise = (fn: Promise<any> | any): fn is Promise<any> => {
  return Boolean((fn as any).then);
};

const slowType = async (wrapper: Wrapper<any>, value: string, delay: number) => {
  let newValue = '';

  for (let char of value) {
    newValue += char;
    await wrapper.setValue(newValue);
    await sleep(delay);
  }
}

type WrappersOrWrappersFinder = (() => Wrapper<any>[]) | Wrapper<any>[] | (() => Promise<Wrapper<any>[]>);
type WrapperOrWrapperFinder = (() => Wrapper<any>) | Wrapper<any> | (() => Promise<Wrapper<any>>);
export type VueUniDriver = UniDriver<Wrapper<any>>

export const vueUniDriverList = (containerOrFn: WrappersOrWrappersFinder, context: DriverContext = { selector: 'Root list driver' }): UniDriverList<Wrapper<any>> => {
  const getWrapperArray = async(): Promise<Wrapper<any>[]> => {
    const elements = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
    return isPromise(elements) ? await elements : elements;
  };

  return {
    get: (idx: number) =>
      vueUniDriver(async() => {
        const wrappers = await getWrapperArray();
        const elem = wrappers[idx];
        if (!elem) {
          throw new Error('Vue base driver - element was not found');
        } else {
          return elem;
        }
      }, { ...context, idx }),
    text: async() => (await getWrapperArray()).map((wrapper) => wrapper?.element.textContent ?? ''),
    count: async() => (await getWrapperArray()).length,
    map: async(fn) => {
      const children = (await getWrapperArray());
      return Promise.all(
        children.map((wrapper, idx) => {
          return fn(
            vueUniDriver(wrapper, {
              parent: context,
              idx,
              selector: context.selector,
            }),
            idx,
          );
        }),
      );
    },
    filter: (fn) => {
      return vueUniDriverList(async() => {
        const elems = (await getWrapperArray());
        const results = await Promise.all(
          elems.map((e, i) => {
            const bd = vueUniDriver(e, { parent: context, idx: i, selector: context.selector });
            return fn(bd, i);
          })
        );

        return elems.filter((_, i) => {
          return results[i];
        });
      }, context);
    },
  };
};

export const vueUniDriver = (wrapperOrFn: WrapperOrWrapperFinder, context: DriverContext = { selector: 'Root' }): VueUniDriver => {
  const getWrapper = async() => {
    const wrapper = typeof wrapperOrFn === 'function' ? wrapperOrFn() : wrapperOrFn;
    if (!wrapper) {
      throw new Error('Vue base driver - element was not found');
    }
    return wrapper;
  };

  const getBySelector = (selector: string) => {
    const getComponent = async() => {
      const wrapper = await getWrapper();
      const elements = wrapper.findAll(selector);
      if (!elements.length) {
        throw new NoElementWithLocatorError(selector);
      } else if (elements.length > 1) {
        throw new MultipleElementsWithLocatorError(elements.length, selector);
      }
      return elements.at(0);
    };

    return vueUniDriver(getComponent, { parent: context, selector: selector });
  };

  const exists = async() => {
    try {
      return (await getWrapper()).exists();
    } catch (error: any) {
      if (isMultipleElementsWithLocatorError(error)) {
        throw error;
      } else {
        return false;
      }
    }
  };

  return {
    type: 'Vue',
    
    $: getBySelector,

    $$: (selector: string) => {
      return vueUniDriverList(async() => {
        const wrapper = await getWrapper();

        return wrapper.findAll(selector).wrappers;
      }, { parent: context, selector: selector });
    },

    text: async() => {
      const wrapper = await getWrapper();
      return wrapper.element.textContent ?? '';
    },

    click: async() => {
      const wrapper = await getWrapper();

      wrapper.trigger('click');
    },

    hover: async() => {
      const wrapper = await getWrapper();
      wrapper.trigger('mouseover');
      wrapper.trigger('mouseenter');
    },

    pressKey: async(key) => {
      const wrapper = await getWrapper();
      const def = getDefinitionForKeyType(key);
  
      await wrapper.trigger('keydown', def);
      await wrapper.trigger('keyup', def);
    },

    exists,

    hasClass: async(className: string) => {
      const wrapper = await getWrapper();
      return wrapper.element.classList.contains(className);
    },

    value: async() => {
      const wrapper = await getWrapper();
      const element = wrapper.element as HTMLInputElement;
      return element.value;
    },

    enterValue: async(value: string, options?: EnterValueOptions) => {
      const wrapper = await getWrapper();
      const element = wrapper.element as HTMLInputElement;
      // Don't do anything if element is disabled or readOnly
      if (element.disabled || element.readOnly) {
        return;
      }

      if (options?.delay) {
        return await slowType(wrapper, value, options.delay);
      }
      return wrapper.setValue(value);
    },

    attr: async(name: string) => {
      const wrapper = await getWrapper();
      return wrapper.attributes(name) ?? null;
    },

    mouse: {
      moveTo: async(to: VueUniDriver) => {
        const wrapper = await getWrapper();
        const targetElement = (await to.getNative()).element;

        const rect = targetElement.getBoundingClientRect();
        return wrapper.trigger('mousemove', { clientX: rect.left, clientY: rect.top });
      },

      press: async() => {
        const wrapper = await getWrapper();
        wrapper.trigger('mousedown');
      },

      release: async() => {
        const wrapper = await getWrapper();
        wrapper.trigger('mouseup');
      },

      leave: async() => {
        const wrapper = await getWrapper();
        wrapper.trigger('mouseleave');
      },
    },

    isDisplayed: async() => {
      return Promise.resolve(true);
    },
    getNative: getWrapper,

    wait: async(timeout?: number) => {
      return waitFor(exists, timeout, 30, contextToWaitError(context));
    },

    scrollIntoView: async() => {
      return {};
    },

    _prop: async(name: string) => {
      const wrapper = await getWrapper();
      return (wrapper.element as any)[name];
    },
  };
};

