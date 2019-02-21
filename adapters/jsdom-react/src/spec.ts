import { jsdomReactUniDriver } from './';
import { SetupFn, renderTestApp, runTestSuite } from '@unidriver/test-suite';
// import {KeyboardEventsAppSetupFn, TodoAppSetupFn} from '@unidriver/test-suite';

const setup: SetupFn = async (params) => {
	const cleanJsdom = require('jsdom-global')();
	const div = document.createElement('div');
	document.body.appendChild(div);
	const cleanApp = renderTestApp(div, params);
	const driver = jsdomReactUniDriver(div);

	const tearDown = () => {
		cleanApp();
		cleanJsdom();
		return Promise.resolve();
	};

	return {driver, tearDown};
};

describe('react base driver - test suite', () => {
	runTestSuite({
		setup
	});
});

describe('react base driver specific tests', () => {

});
