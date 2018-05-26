import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { reactUniDriver } from './index';
import { TodoApp } from '../../test-suite/react-todoapp';
import { TodoAppSetupFn } from '../../test-suite/index';
import { runTestSuite } from '../../test-suite/spec';

const setup: TodoAppSetupFn = (data) => {
	const cleanup = require('jsdom-global')();
	const div = document.createElement('div');
	const props = {items: [], ...data };
	const comp = React.createElement(TodoApp, props);
	document.body.appendChild(div);
	ReactDOM.render(comp, div);

	const driver = reactUniDriver(div);


	const tearDown = () => {
		document.body.innerHTML = '';
		cleanup();
		return Promise.resolve();
	};

	return Promise.resolve({driver, tearDown});
}

describe('react base driver - test suite', () => {
	runTestSuite({setup});
});

describe('react base driver specific tests', () => {

});
