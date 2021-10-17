import { Locator, UniDriverList, UniDriver, MapFn, waitFor, NoElementWithLocatorError, MultipleElementsWithLocatorError, isMultipleElementsWithLocatorError, EnterValueOptions, DriverContext, contextToWaitError } from '@unidriver/core';
import { ElementHandle, Page, Frame } from './pptrVersionSelector';

type BaseElementContainer = { page: Page | Frame; selector: string };
type ElementContainer = BaseElementContainer & { element: ElementHandle | null };
type ElementsContainer = BaseElementContainer & { elements: ElementHandle[] };

type ElementGetter = () => Promise<ElementContainer>;
type ElementsGetter = () => Promise<ElementsContainer>;

export const pupUniDriverList = (
    elems: ElementsGetter,
    context: DriverContext = { selector: 'Root Puppeteer list driver' }
): UniDriverList<ElementContainer> => {
    const map = async <T>(fn: MapFn<T>) => {
        const { elements, ...rest } = await elems();
        const promises = elements.map((element, i) => {
            const bd = pupUniDriver(() => Promise.resolve({ element, ...rest }), {
                parent: context, idx: i, selector: context.selector
            });
            return fn(bd, i);
        });
        return Promise.all(promises);
    };

    return {
        get: (idx: number) => {
            const elem = async () => {
                const { elements, ...rest } = await elems();
                return {
                    element: elements[idx],
                    ...rest
                };
            };
            return pupUniDriver(elem, { parent: context, selector: context.selector, idx });
        },
        text: async () => {
            return map((d) => d.text());
        },
        count: async () => {
            const { elements } = await elems();
            return elements.length;
        },
        map,
        filter: (fn) => {
            return pupUniDriverList(async () => {
                const { elements, ...rest } = await elems();
                const results = await map(fn);
                const filteredElements = elements.filter((_, i) => {
                    return results[i];
                });
                return {
                    elements: filteredElements,
                    ...rest
                };
            }, context);
        }
    };
};

const isBaseContainer = (
    obj: ElementGetter | BaseElementContainer
): obj is BaseElementContainer => {
    return !!(obj as any).page;
};

export const pupUniDriver = (
    el: ElementGetter | BaseElementContainer,
    context: DriverContext = { selector: 'Root Puppeteer driver' }
): UniDriver<ElementContainer> => {
    const elem = async () => {
        if (isBaseContainer(el)) {
            const { page, selector } = el;
            //@ts-ignore
            const element = await page.$(selector);
            if (!element) {
                throw new Error(`Cannot find element`);
            }
            return {
                page,
                element,
                selector
            };
        } else {
            const { element, ...rest } = await el();
            if (!element) {
                throw new Error(`Cannot find element`);
            }
            return {
                ...rest,
                element
            };
        }
    };

    const exists = async () => {
        try {
            await elem();
            return true;
        } catch (e) {
            if (isMultipleElementsWithLocatorError(e as Error)) {
                throw e;
            } else {
                return false;
            }
        }
    };

    const clearValue = async () => {
        const { element } = await elem();
        // Select all input text
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
    };

    return {
        $: (newLoc: Locator) => {
            return pupUniDriver(async () => {
                const { element, selector, ...rest } = await elem();

                const elHandles = await element.$$(newLoc);

                if (elHandles.length === 0) {
                    throw new NoElementWithLocatorError(newLoc);
                } else if (elHandles.length > 1) {
                    throw new MultipleElementsWithLocatorError(elHandles.length, newLoc);
                } else {
                    return {
                        ...rest,
                        element: elHandles[0],
                        selector: `${selector} ${newLoc}`
                    };
                }
            }, { parent: context, selector: newLoc });
        },
        $$: (newLoc: Locator) =>
            pupUniDriverList(async () => {
                const { element, selector, ...rest } = await elem();
                return {
                    ...rest,
                    elements: await element.$$(newLoc),
                    selector: `${selector} ${newLoc}`
                };
            }, { parent: context, selector: newLoc }),
        text: async () => {
            const { element } = await elem();
            const textHandle = await element.getProperty('textContent');
            if (!textHandle) {
                throw new Error('property textContent of element was not found')
            }

            const text = await textHandle.jsonValue() as string;
            return text || '';
        },
        click: async () => {
            return (await elem()).element.click();
        },
        hover: async () => {
            return (await elem()).element.hover();
        },
        hasClass: async (className: string) => {
            const { element } = await elem();
            const classList = await element.getProperty('classList');

            if (!classList) {
                throw new Error('element class list was not found');
            }

            const cm = await (classList).jsonValue() as Record<string, string>;
            return Object.keys(cm).map(key => cm[key]).includes(className);
        },
        enterValue: async (
            value: string,
            { delay = 0, shouldClear = true }: EnterValueOptions = {}
        ) => {
            const { element } = await elem();

            const disabledProp = await element.getProperty('disabled');
            const readOnlyProd = await element.getProperty('readOnly');

            const disabled = disabledProp ? await (disabledProp).jsonValue() : undefined;
            const readOnly = readOnlyProd ? await (readOnlyProd).jsonValue() : undefined;
            // Don't do anything if element is disabled or readOnly
            if (disabled || readOnly) {
                return;
            }
            await element.focus();
            if (shouldClear) {
                await clearValue();
            }
            await element.type(value, {
                delay,
            });
        },
        pressKey: async (key) => {
            const { element } = await elem();
            return element.press(`${key}`);
        },
        exists,
        isDisplayed: async () => {
            const { element } = await elem();
            return element.isIntersectingViewport();
        },
        value: async () => {
            const { element } = await elem();

            const valueHandle = await element.getProperty('value');
            const value = valueHandle ? await valueHandle.jsonValue() as string : undefined;
            return value || '';
        },
        attr: async name => {
            const { page, element } = await elem();
            //@ts-ignore
            return page.evaluate(
                (elem: any, n: any) => {
                    return elem.getAttribute(n);
                },
                element,
                name
            );
        },
        mouse: {
            press: async () => {
                const { page, selector } = await elem();

                //@ts-ignore
                return page.$eval(
                    selector,
                    (elem: any) => {
                        const mousedown = new MouseEvent('mousedown');
                        mousedown.initEvent(mousedown.type, true, false);
                        elem.dispatchEvent(mousedown);
                    }
                );
            },
            release: async () => {
                const { page, selector } = await elem();

                //@ts-ignore
                return page.$eval(
                    selector,
                    (elem: any) => {
                        const mouseup = new MouseEvent('mouseup');
                        mouseup.initEvent(mouseup.type, true, false);
                        elem.dispatchEvent(mouseup);
                    }
                );
            },
            moveTo: async (to) => {
                const { page, selector } = await elem();
                const native = (await to.getNative());
                const boundingBox = native.element && await native.element.boundingBox();

                if (!!boundingBox) {
                    //@ts-ignore
                    return page.$eval(
                        selector,
                        (elem: any, boundingBox: any) => {
                            const mousemove = new MouseEvent('mousemove', { clientX: boundingBox.x, clientY: boundingBox.y });
                            mousemove.initEvent(mousemove.type, true, false);
                            elem.dispatchEvent(mousemove);
                        },
                        boundingBox
                    );
                } else {
                    throw new Error(`Cannot find target element`);
                }
            }
        },
        wait: async (timeout?: number) => {
            return waitFor(exists, timeout, 30, contextToWaitError(context));
        },
        type: 'puppeteer',
        scrollIntoView: async () => {
            const { element } = await elem();
            await element.hover();

            return {};
        },
        getNative: elem,
        _prop: async (name: string) => {
            const { page, element } = await elem();
            //@ts-ignore
            return page.evaluate(
                (elem: any, n: any) => {
                    return elem[n];
                },
                element, name
            );
        },
    };
};
