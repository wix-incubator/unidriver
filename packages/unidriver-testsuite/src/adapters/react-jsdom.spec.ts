import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { reactUniDriver } from '@unidriver/react-adapter';
import { TodoApp } from '../react-todoapp';
import {KeyboardEventsAppSetupFn, TodoAppSetupFn} from '../';
import {runAllTestSuites} from '../run-all-test-suites';
import {EventsApp} from '../react-events-app';

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
	return commonSetup(EventsApp, { ...props });
};

describe('react base driver - test suite', () => {
	runAllTestSuites({todoAppParams: {setup: todoAppSetup}, keyboardEventsAppParams: {setup: keyboardEventsAppSetup}});
});

describe('react base driver specific tests', () => {

});
