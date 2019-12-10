import { UniDriver } from '@unidriver/core';
import { TestAppProps } from './test-app';

export type SetupFn = (data: TestAppProps) => Promise<{driver: UniDriver, tearDown: () => Promise<void>}>;

export type TestSuiteParams = {
	setup: SetupFn;
	before?: () => Promise<void>,
	after?: () => Promise<void>,
};


export {renderTestApp} from './test-app'

export {startServer as startTestAppServer, getTestAppUrl} from './server';

export {runTestSuite} from './run-test-suite';
// @ts-ignore
export {renderSvelteApp} from './svelte-app/renderSvelteApp'
