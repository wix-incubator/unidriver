import { UniDriver } from '@unidriver/core';
import {TodoAppProps} from './react-todoapp';
import {KeyboardEventsAppProps} from './react-events-app';

export type SetupFn<P> = (props: P) => Promise<{driver: UniDriver, tearDown: () => Promise<void>}>;
export type TodoAppSetupFn = SetupFn<TodoAppProps>;
export type KeyboardEventsAppSetupFn = SetupFn<KeyboardEventsAppProps>;

export type TestSuiteParams<P> = {
	setup: SetupFn<P>;
	before?: () => Promise<void>,
	after?: () => Promise<void>,
};
