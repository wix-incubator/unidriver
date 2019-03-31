import { jsdomReactUniDriver } from '.';
import { SetupFn, renderTestApp, runTestSuite } from '@unidriver/test-suite';
// import {KeyboardEventsAppSetupFn, TodoAppSetupFn} from '@unidriver/test-suite';
import {spy} from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {assert} from 'chai';

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

	it('sends event data properly on simulated events when element is attached to body', async () => {
		const cleanJsdom = require('jsdom-global')();
		const s = spy();
		const elem = document.createElement('div');
		const btn = <button onClick={s}>bob</button>;
		ReactDOM.render(btn, elem);

		const driver = jsdomReactUniDriver(elem);

		await driver.$('button').click();
		cleanJsdom();

		assert.equal(s.lastCall.args[0].target.tagName, 'BUTTON');
	});

	it('sends event data properly on simulated events when element is attached to body', async () => {
		const cleanJsdom = require('jsdom-global')();
		const s = spy();
		const elem = document.createElement('div');
		document.body.appendChild(elem);
		const btn = <button onClick={s}>bob</button>;
		ReactDOM.render(btn, elem);

		const driver = jsdomReactUniDriver(elem);

		await driver.$('button').click();
		cleanJsdom();

		assert.equal(s.lastCall.args[0].target.tagName, 'BUTTON');
	});
});
