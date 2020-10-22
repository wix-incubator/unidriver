import { KeyDefinitionType } from './key-types';

export * from './utils';
export * from './key-types';

export type Locator = string;

export type MapFn<T> = (e: UniDriver, idx?: number, array?: UniDriver[]) => Promise<T>;

export type PredicateFn = (e: UniDriver, idx?: number, array?: UniDriver[]) => Promise<boolean>;

export type ReducerFn<T> = (acc: T, curr: UniDriver, idx?: number, array?: UniDriver[]) => T;

export type MouseUniDriver<T> = {
	moveTo: (to: UniDriver<T>) => Promise<void>;
	press: () => Promise<void>;
	release: () => Promise<void>;
}

export type UniDriverList<T = any> = {
	get: (idx: number) => UniDriver<T>,
	text: () => Promise<string[]>,
	count: () => Promise<number>,
	map: <T>(mapFn: MapFn<T>) => Promise<T[]>,
	filter: (predicate: PredicateFn) => UniDriverList
};

export type EnterValueOptions = {
	delay?: number; // Time to wait between key presses in milliseconds.
}

export type UniDriver<T = any> = {
	$: (selector: Locator) => UniDriver<T>;
	$$: (selector: Locator) => UniDriverList<T>;
	text: () => Promise<string>;
	click: () => Promise<void>;
	hover: () => Promise<void>;
	pressKey: (key: KeyDefinitionType) => Promise<void>
	value: () => Promise<string>;
	enterValue: (value: string, config?: EnterValueOptions) => Promise<void>;
	attr: (name: string) => Promise<string | null>;
	hasClass: (name: string) => Promise<boolean>;
	exists: () => Promise<boolean>;
	isDisplayed: () => Promise<boolean>;
	wait: (timeout?: number) => Promise<void>;
	mouse: MouseUniDriver<T>;
	type: string;
	scrollIntoView: () => Promise<{}>;
	getNative: () => Promise<T>;
	/** Gets a html element's property value by property name. @returns null if property is not defined */
	_prop: (name: string) => Promise<any>;
};

export enum ErrorTypes {
	NO_ELEMENTS_WITH_SELECTOR = 'no-elements-with-selector',
	MULTIPLE_ELEMENTS_WITH_SELECTOR = 'multiple-elements-with-selector'
}

export class NoElementWithLocatorError extends Error {

	type = ErrorTypes.NO_ELEMENTS_WITH_SELECTOR;
	
	constructor(locator: string) {
		super(`Cannot find element with locator: ${locator}`)
	}
}

export class MultipleElementsWithLocatorError extends Error {

	type = ErrorTypes.MULTIPLE_ELEMENTS_WITH_SELECTOR;

	constructor(count: number, locator: string) {
		super(`Found ${count} elements with locator [${locator}]. Only 1 is expected. This is either a bug or not-specific-enough locator`);
	}
}

export const isNoElementWithLocatorError = (e: Error): e is NoElementWithLocatorError => {
	const type = (e as NoElementWithLocatorError).type || '';
	return type === ErrorTypes.NO_ELEMENTS_WITH_SELECTOR;
};

export const isMultipleElementsWithLocatorError = (e: Error): e is MultipleElementsWithLocatorError => {
	const type = (e as MultipleElementsWithLocatorError).type || '';
	return type === ErrorTypes.MULTIPLE_ELEMENTS_WITH_SELECTOR;
};