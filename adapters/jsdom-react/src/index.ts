import {
  contextToWaitError,
  delay as sleep,
  DriverContext,
  EnterValueOptions,
  getDefinitionForKeyType,
  isMultipleElementsWithLocatorError,
  Locator,
  MultipleElementsWithLocatorError,
  NoElementWithLocatorError,
  UniDriver,
  UniDriverList,
  waitFor,
} from "@unidriver/core";
import { Simulate } from 'react-dom/test-utils';

type ElementOrElementFinder = (() => Element) | Element | (() => Promise<Element>);
type ElementsOrElementsFinder = (() => Element[]) | Element[] | (() => Promise<Element[]>);

const isPromise = (a: Promise<any> | any): a is Promise<any> => {
  return !!((a as any).then);
};

export const jsdomReactUniDriverList = (containerOrFn: ElementsOrElementsFinder, context: DriverContext = {selector: 'Root React list driver'}): UniDriverList<Element> => {
  const elem = async () => {
    const elements = await (typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn);
    return isPromise(elements) ? await elements : elements;
  };

  return {
    get: (idx: number) =>
      jsdomReactUniDriver(() => {
        return elem().then((cont) => {
          const elem = cont[idx];
          if (!elem) {
            throw new Error("React base driver - element was not found");
          } else {
            return elem;
          }
        });
      }, {...context, idx}),
    text: async () => (await elem()).map((e) => e.textContent || ""),
    count: async () => (await elem()).length,
    map: async (fn) => {
      const children = Array.from(await elem());
      return Promise.all(
        children.map((e, idx) => {
          return fn(
            jsdomReactUniDriver(e, {
              parent: context,
              idx,
              selector: context.selector,
            }),
            idx
          );
        })
      );
    },
    filter: (fn) => {
      return jsdomReactUniDriverList(async () => {
        const elems = await elem();

        const results = await Promise.all(
          elems.map((e, i) => {
            const bd = jsdomReactUniDriver(e, {parent: context, idx: i, selector: context.selector});
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

type HTMLFocusableElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;

const elementIsFocusable = (el: Element): el is HTMLFocusableElement => {
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'SELECT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'BUTTON' ||
    el.tagName === 'svg'
  )
}

const isCheckable = (el: Element): boolean => {
  return (
    el.tagName === 'INPUT' &&
    ((el as HTMLInputElement).type == 'checkbox' ||
      (el as HTMLInputElement).type == 'radio')
  );
};

const slowType = async (element: JSX.IntrinsicElements['input'], value: string, delay: number) => {
  const {name, type} = element;
  let currentValue = "";
  for (let i = 0; i < value.length; i++) {
    currentValue += value[i];
    Simulate.change(element as Element, {
      target: {name, type, value: currentValue} as HTMLInputElement
    });
    await sleep(delay);
  }
};

export const jsdomReactUniDriver = (containerOrFn: ElementOrElementFinder, context: DriverContext = {selector: 'Root React driver'}): UniDriver<Element> => {

  const elem = async () => {
    const container = await (typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn);
    if (!container) {
      throw new Error('React base driver - element was not found');
    }
    return container;
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

  const handleCheckableInput = async (input: HTMLInputElement) => {
    input.checked = !input.checked;
    Simulate.input(input);
    Simulate.change(input);
  }

  return {
    $: (loc: Locator) => {
      const getElement = async () => {
        const container = await elem();
        const elements = container.querySelectorAll(loc);
        if (!elements.length) {
          throw new NoElementWithLocatorError(loc);
        } else if (elements.length > 1) {
          throw new MultipleElementsWithLocatorError(elements.length, loc);
        }
        return elements[0];
      };
      return jsdomReactUniDriver(getElement, {parent: context, selector: loc});
    },
    $$: (selector: Locator) => jsdomReactUniDriverList(async () => {
      const e = await elem();
      return Array.from(e.querySelectorAll(selector));
    }, {parent: context, selector}),
    text: async () => elem().then((e) => e.textContent || ''),
    value: async () => {
      const e = (await elem()) as HTMLInputElement;
      return e.value;
    },
    click: async () => {
      const el = await elem();
      const eventData = {button: 0}; // 0 - Main Button (Left)
      // setting button 0 is now needed in React 16+ as it's not set by react anymore
      // 15 - https://github.com/facebook/react/blob/v15.6.1/src/renderers/dom/client/syntheticEvents/SyntheticMouseEvent.js#L45
      // 16 - https://github.com/facebook/react/blob/master/packages/react-dom/src/events/SyntheticMouseEvent.js#L33
      Simulate.mouseDown(el, eventData);

      if (elementIsFocusable(el)) {
        if (document.activeElement != el) {
          if (document.activeElement) {
            Simulate.blur(document.activeElement);
          }

          if (!el.disabled) {
            el.focus();

            Simulate.focus(el);
          }
        }
      }


      Simulate.mouseUp(el, eventData);
      Simulate.click(el, eventData);

      if (isCheckable(el)) {
        handleCheckableInput(el as HTMLInputElement);
      }
    },
    mouse: {
      press: async () => {
        const el = await elem();

        Simulate.mouseDown(el);
      },
      release: async () => {
        const el = await elem();

        Simulate.mouseUp(el);
      },
      moveTo: async (to) => {
        const el = await elem();
        const {left, top} = (await to.getNative()).getBoundingClientRect();

        Simulate.mouseMove(el, {clientX: left, clientY: top});
      }
    },
    hover: async () => {
      const el = await elem();

      Simulate.mouseOver(el);
      Simulate.mouseEnter(el);
    },
    pressKey: async (key) => {
      const el = await elem();
      const def = getDefinitionForKeyType(key);


      // enabling this throws an error with JSDOM. Thuss, pesskey will only use Simulate
      /*
       if (document.body.contains(el)) {
      // 	const keydown = new KeyboardEvent('keydown', {...def});
      // 	const keyup = new KeyboardEvent('keyup', {...def});


       // 	keydown.initEvent(keydown.type, true, false);
      // 	el.dispatchEvent(keydown);
      // 	await (Promise.resolve());
       // 	keyup.initEvent(keyup.type, true, false);
      // 	el.dispatchEvent(keyup)

      // } else {

      // }
      */
      Simulate.keyDown(el, def);
      Simulate.keyUp(el, def);
    },
    hasClass: async (className: string) => (await elem()).classList.contains(className),
    enterValue: async (value: string, options?: EnterValueOptions) => {
      const el = (await elem()) as JSX.IntrinsicElements['input'];

      // Don't do anything if element is disabled or readOnly
      if (el.disabled || el.readOnly) {
        return;
      }

      const {name, type, onChange} = el;
      // Set native value for uncontrolled component
      if (!onChange) {
        el.value = value;
      }
      if (options?.delay) {
        await slowType(el, value, options.delay);
      }
      Simulate.change(el as Element, {
        target: {name, type, value} as HTMLInputElement
      });
    },
    attr: async (name: string) => {
      const el = await elem();
      return el.getAttribute(name);
    },
    exists,
    isDisplayed: async () => {
      return true;
    },
    wait: async (timeout?: number) => {
      return waitFor(exists, timeout, 30, contextToWaitError(context));
    },
    type: 'react',
    scrollIntoView: async () => {
      return {}
    },
    getNative: () => elem(),
    _prop: async (name: string) => {
      const el = await elem();
      return (el as any)[name];
    }
  };
};
