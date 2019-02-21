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

export type UniDriver<T = any> = {
	$: (selector: Locator) => UniDriver;
	$$: (selector: Locator) => UniDriverList;
	text: () => Promise<string>;
	click: () => Promise<void>;
	hover: () => Promise<void>;
	pressKey: (key: KeyDefinitionType) => Promise<void>
	value: () => Promise<string>;
	enterValue: (value: string) => Promise<void>;
	attr: (name: string) => Promise<string | null>;
	hasClass: (name: string) => Promise<boolean>;
	exists: () => Promise<boolean>;
	isDisplayed: () => Promise<boolean>;
	wait: (timeout?: number) => Promise<void>;
	mouse: MouseUniDriver<T>;
	type: string;
	scrollIntoView: () => Promise<{}>;
	getNative: () => Promise<T>;
};