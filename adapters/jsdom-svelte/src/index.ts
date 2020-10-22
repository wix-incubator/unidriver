import {
    getDefinitionForKeyType,
    isMultipleElementsWithLocatorError,
    Locator,
    MultipleElementsWithLocatorError,
    NoElementWithLocatorError,
    UniDriver, UniDriverList, waitFor,
    delay as sleep,
    EnterValueOptions
} from "@unidriver/core";

import {fireEvent} from '@testing-library/svelte';

type HTMLFocusableElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;
type ElementOrElementFinder = (() => Element) | Element | (() => Promise<Element>);
type ElementsOrElementsFinder = (() => Element[]) | Element[] | (() => Promise<Element[]>);

const isPromise = (a: Promise<any> | any ): a is Promise<any> => {
    return !!((a as any).then);
};

const elementIsFocusableAndNotAnchor = (el: Element): el is HTMLFocusableElement => {
    return (
        el.tagName === 'INPUT' ||
        el.tagName === 'SELECT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'BUTTON'
    )
}


const isCheckable = (el: Element): boolean => {
    return (
        el.tagName === 'INPUT' &&
        ((el as HTMLInputElement).type == 'checkbox' ||
            (el as HTMLInputElement).type == 'radio')
    );
};

const slowType = async (element: HTMLInputElement, value: string, delay: number) => {
    const { name, type } = element;
    let currentValue = "";
    for (let i = 0; i < value.length; i++) {
        currentValue += value[i];
		await fireEvent.change(element, {
            target: { name, type, value: currentValue }
        });
		await sleep(delay);
	}
};


export const jsdomSvelteUniDriver = (containerOrFn: ElementOrElementFinder): UniDriver<Element> => {

    const elem = async () => {
        const container = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
        if (!container) {
            throw new Error('Svelte base driver - element was not found');
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
        await fireEvent.input(input);
        await fireEvent.change(input);
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
            return jsdomSvelteUniDriver(getElement);
        },
        $$: (selector: Locator) => jsdomSvelteUniDriverList(async () => {
            const e = await elem();
            return Array.from(e.querySelectorAll(selector));
        }),
        text: async () => elem().then((e) => e.textContent || ''),
        value: async () => {
            const e = (await elem()) as HTMLInputElement;
            return e.value;
        },
        click: async () => {
            const el = await elem();
            await fireEvent.mouseDown(el);

            if (elementIsFocusableAndNotAnchor(el)) {
                if (document.activeElement != el) {
                    if (document.activeElement) {
                        fireEvent.blur(document.activeElement);
                    }

                    if (!el.disabled) {
                        el.focus();
                        await fireEvent.focus(el);
                    }
                }
            }


            await fireEvent.mouseUp(el);
            await fireEvent.click(el);

            if (isCheckable(el)) {
                handleCheckableInput(el as HTMLInputElement);
            }
        },
        mouse: {
            press: async() => {
                const el = await elem();

                await fireEvent.mouseDown(el);
            },
            release: async () => {
                const el = await elem();

                await fireEvent.mouseUp(el);
            },
            moveTo: async (to) => {
                const el = await elem();
                const {left, top} = (await to.getNative()).getBoundingClientRect();

                await fireEvent.mouseMove(el, {clientX: left, clientY: top});
            }
        },
        hover: async () => {
            const el = await elem();

            await fireEvent.mouseOver(el);
            await fireEvent.mouseEnter(el);
        },
        pressKey: async (key) => {
            const el = await elem();
            const def = getDefinitionForKeyType(key);

            await fireEvent.keyDown(el, def);
            await fireEvent.keyUp(el, def);
        },
        hasClass: async (className: string) => (await elem()).classList.contains(className),
        enterValue: async (value: string, options?: EnterValueOptions) => {
            const el = (await elem()) as HTMLInputElement;
            const { name, type, disabled } = el;
			// Don't do anything if element is disabled
			if (disabled) {
				return;
            }
            if (options?.delay) {
                await slowType(el, value, options.delay);
            } else {
                await fireEvent.change(el, {
                    target: { name, type, value }
                });
            }
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
            return waitFor(exists, timeout);
        },
        type: 'svelte',
        scrollIntoView: async () => { return {} },
        getNative: () => elem(),
        _prop: async (name: string) => {
            const el = await elem();
            return (el as any)[name];
        }
    };
};

export const jsdomSvelteUniDriverList = (containerOrFn: ElementsOrElementsFinder): UniDriverList<Element> => {
    const elem = async () => {
        const elements = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
        return isPromise(elements) ? await elements : elements;
    };

    return {
        get: (idx: number) => jsdomSvelteUniDriver(() => {
            return elem().then((cont) => {
                const elem = cont[idx];
                if (!elem) {
                    throw new Error('Svelte base driver - element was not found');
                } else {
                    return elem;
                }
            });
        }),
        text: async () => (await elem()).map((e) => e.textContent || ''),
        count: async () => (await elem()).length,
        map: async (fn) => {
            const children = Array.from(await elem());
            return Promise.all(children.map((e, idx) => {
                return fn(jsdomSvelteUniDriver(e), idx);
            }));
        },
        filter: (fn) => {
            return jsdomSvelteUniDriverList(async () => {
                const elems = await elem();

                const results = await Promise.all(elems.map((e, i) => {
                    const bd = jsdomSvelteUniDriver(e);
                    return fn(bd, i);
                }));

                return elems.filter((_, i) => {
                    return results[i];
                });
            });
        }
    };
};
