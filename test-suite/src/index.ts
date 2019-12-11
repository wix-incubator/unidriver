import { UniDriver } from '@unidriver/core';

import { TestAppProps } from "./types";

export type SetupFn = (data: TestAppProps) => Promise<{driver: UniDriver, tearDown: () => Promise<void>}>;

export type TestSuiteParams = {
	setup: SetupFn;
	before?: () => Promise<void>,
	after?: () => Promise<void>,
};


export {renderTestApp} from './react-app';
export {renderSvelteApp} from './svelte-app/renderSvelteApp';

export {startServer as startTestAppServer, getTestAppUrl} from './server';

export {runTestSuite} from './run-test-suite';
