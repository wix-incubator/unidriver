import * as React from 'react';
import { 
	MobileUniDriver,
	Locator,
	NoElementWithLocatorError,
	MultipleElementsWithLocatorError,
	isMultipleElementsWithLocatorError,
	waitFor,
	MobileUniDriverList
} from '@unidriver/core';
import { ReactTestInstance, act } from 'react-test-renderer';
import { fireEvent } from '@testing-library/react-native';

type ElementOrElementFinder = (() => ReactTestInstance) | ReactTestInstance | (() => Promise<ReactTestInstance>);
type ElementsOrElementsFinder = (() => ReactTestInstance[]) | ReactTestInstance[] | (() => Promise<ReactTestInstance[]>);

const isPromise = (a: Promise<any> | any ): a is Promise<any> => {
	return !!((a as any).then);
};

export const reactNativeUniDriverList = (containerOrFn: ElementsOrElementsFinder): MobileUniDriverList<ReactTestInstance> => {
	const elem = async () => {
		const elements = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
		return isPromise(elements) ? await elements : elements;
	};

	return {
		get: (idx: number) => reactNativeUniDriver(() => {
			return elem().then((cont) => {
				const elem = cont[idx];
				if (!elem) {
					throw new Error('React base driver - element was not found');
				} else {
					return elem;
				}
			});
		}),
		count: async () => (await elem()).length,
		map: async (fn) => {
			const children = await elem();
			return Promise.all(children.map((e, idx) => {
				return fn(reactNativeUniDriver(e), idx);
			}));
		},
		filter: (fn) => {
			return reactNativeUniDriverList(async () => {
				const elems = await elem();

				const results = await Promise.all(elems.map((e, i) => {
					const bd = reactNativeUniDriver(e);
					return fn(bd, i);
				}));

				return elems.filter((_, i) => {
					return results[i];
				});
			});
		}
	};
};

export const reactNativeUniDriver = (containerOrFn: ElementOrElementFinder): MobileUniDriver<ReactTestInstance> => {
  const elem = async () => {
		const container = typeof containerOrFn === 'function' ? containerOrFn() : containerOrFn;
		if (!container) {
			throw new Error('React Native base driver - element was not found');
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

  return {
    $: (loc: Locator) => {
			const getElement = async () => {
				const container = await elem();
	
				const elements = container.findAllByProps({ testID: loc }, {deep: false});
				if (!elements.length) {
					throw new NoElementWithLocatorError(loc);
				} else if (elements.length > 1) {
					throw new MultipleElementsWithLocatorError(elements.length, loc);
				}
				return elements[0];
			};
			return reactNativeUniDriver(getElement);
		},
		$$: (selector: Locator) => reactNativeUniDriverList(async () => {
			const e = await elem();
			return e.findAllByProps({ testID: selector }, {deep: false});
		}),
		text: async () => {
			try {
				const e = await elem();
				const text = React.Children.map(e.props.children, (child) => typeof child.props.children === 'string' ? child.props.children : '');
				return text.join(' ');
			} catch (err) {
				throw new Error('Element does not contain any text nodes');
			}
		},
    press: async () => {
      const e = await elem();
      await act(async () => {
				await e.props.onPress && fireEvent.press(e);
				await e.props.onTouchStart && fireEvent(e, 'onTouchStart');
				await e.props.onFocus && fireEvent(e, 'onFocus');
			});
		},
		longPress: async () => {
			const e = await elem();
			await act(async () => {
				await e.props.onLongPress && fireEvent(e, 'onLongPress');
			});
		},
		enterValue: async (value: string) => {
			const el = await elem();
			await act(async () => {
				await fireEvent.changeText(el, value);
			});
		},
		value: async () => {
			const e = await elem();
			return e.props.value;
		},
		scroll: async () => {
			const el = await elem();
			await act(async () => {
				await el.props.onScroll && fireEvent.scroll(el);
				await el.props.onScrollBeginDrag && fireEvent(el, 'onScrollBeginDrag');
				await el.props.onScrollEndDrag && fireEvent(el, 'onScrollEndDrag');
				await el.props.onMomentumScrollBegin && fireEvent(el, 'onMomentumScrollBegin');
				await el.props.onMomentumScrollEnd && fireEvent(el, 'onMomentumScrollEnd');				
			});
		},
		isDisplayed: async () => true,
		scrollIntoView: async () => { return {} },
		getNative: () => elem(),
		exists,
		wait: async (timeout?: number) => {
			return waitFor(exists, timeout);
		},
		type: 'react-native',
		_prop: async (name: string) => {
			const el = await elem();
			return el.props[name];
		}
  };
};
