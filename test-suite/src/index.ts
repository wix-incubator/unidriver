import { MobileUniDriver, UniDriver } from '@unidriver/core';

import { TestAppProps } from "./types";

export type SetupFn = (data: TestAppProps) => Promise<{driver: UniDriver, tearDown: () => Promise<void>}>;
export type MobileSetupFn = (data: TestAppProps) => Promise<{driver: MobileUniDriver, tearDown: () => Promise<void>}>;

export type TestSuiteParams = {
	setup: SetupFn;
	before?: () => Promise<void>,
	after?: () => Promise<void>,
};

export type MobileTestSuiteParams = {
	setup: MobileSetupFn;
	before?: () => Promise<void>,
	after?: () => Promise<void>,
}


export {renderTestApp} from './app/react';
export {renderSvelteApp} from './app/svelte/renderSvelteApp';

export {startServer as startTestAppServer, getTestAppUrl} from './server';

export {runTestSuite} from './run-test-suite';
