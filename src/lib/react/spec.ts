import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { reactUniDriver } from './index';
import { TodoApp } from '../../test-suite/react-todoapp/react-todoapp';
import {KeyboardEventsAppSetupFn, TodoAppSetupFn} from '../../test-suite';
import {runAllTestSuites} from '../../test-suite/run-all-test-suites';
import {KeyboardEventsApp} from '../../test-suite/react-keyboard-events-app/react-keyboard-events-app';

const commonSetup = <P>(CompClass: React.ComponentClass<P>, props: P) => {
	const cleanup = require('jsdom-global')();
	const div = document.createElement('div');
	const comp = React.createElement(CompClass, props);
	document.body.appendChild(div);
	ReactDOM.render(comp, div);

	const driver = reactUniDriver(div);


	const tearDown = () => {
		document.body.innerHTML = '';
		cleanup();
		return Promise.resolve();
	};

	return {driver, tearDown};
};

const todoAppSetup: TodoAppSetupFn = async (props) => {
	return commonSetup(TodoApp, {items: [], ...props });
};

const keyboardEventsAppSetup: KeyboardEventsAppSetupFn = async (props) => {
	return commonSetup(KeyboardEventsApp, { ...props });
};

describe('react base driver - test suite', () => {
	runAllTestSuites({todoAppParams: {setup: todoAppSetup}, keyboardEventsAppParams: {setup: keyboardEventsAppSetup}});
});

describe('react base driver specific tests', () => {

});
