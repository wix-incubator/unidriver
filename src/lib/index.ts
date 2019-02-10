import {Key} from '../lib/key-types';

export type Locator = string;

export type MapFn<T> = (e: UniDriver, idx?: number, array?: UniDriver[]) => Promise<T>;

export type PredicateFn = (e: UniDriver, idx?: number, array?: UniDriver[]) => Promise<boolean>;

export type ReducerFn<T> = (acc: T, curr: UniDriver, idx?: number, array?: UniDriver[]) => T;

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
	pressKey: (key: Key | string) => Promise<void>
	value: () => Promise<string>;
	enterValue: (value: string) => Promise<void>;
	attr: (name: string) => Promise<string>;
	hasClass: (name: string) => Promise<boolean>;
	exists: () => Promise<boolean>;
	isDisplayed: () => Promise<boolean>;
	wait: (timeout?: number) => Promise<void>;
	type: string;
	scrollIntoView: () => Promise<{}>;
	getNative: () => Promise<T>;
};
