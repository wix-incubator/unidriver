import { UniDriver } from '../lib';

export type TodoItem = {
	label: string,
	completed: boolean
};

export type TodoAppData = {
	items?: TodoItem[];
	initialText?: string;
}

export type TodoAppSetupFn = (data: TodoAppData) => Promise<{driver: UniDriver, tearDown: () => Promise<void>}>;

export type TestSuiteParams = {
	setup: TodoAppSetupFn;
	before?: () => Promise<void>,
	after?: () => Promise<void>
};
