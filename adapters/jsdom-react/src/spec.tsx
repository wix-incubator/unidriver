import { jsdomReactUniDriver } from '.';
import { SetupFn, renderTestApp, runTestSuite } from '@unidriver/test-suite';
// import {KeyboardEventsAppSetupFn, TodoAppSetupFn} from '@unidriver/test-suite';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { assert } from 'chai';

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

	return { driver, tearDown };
};

describe('react base driver - test suite', () => {
	runTestSuite({
		setup
	});
});

describe('react base driver specific tests', () => {
	const spy = sinon.spy;

	describe('click', () => {
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

		it('should trigger [mouseDown, mouseUp, click] in this order and with default main-button(0) when clicked', async () => {
			const cleanJsdom = require('jsdom-global')();
			const mouseDown = spy();
			const mouseUp = spy();
			const click = spy();
			const elem = document.createElement('div');
			const btn = (
				<button
					onMouseDown={mouseDown}
					onMouseUp={mouseUp}
					onClick={click}>
					bob
				</button>
			);
			ReactDOM.render(btn, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('button').click();
			cleanJsdom();

			sinon.assert.callOrder(mouseDown, mouseUp, click);
			const DEFAULT_BUTTON_ID = '0'
			assert.equal(mouseDown.lastCall.args[0].button, DEFAULT_BUTTON_ID);
			assert.equal(mouseUp.lastCall.args[0].button, DEFAULT_BUTTON_ID);
			assert.equal(click.lastCall.args[0].button, DEFAULT_BUTTON_ID);
		});

		it('should trigger [focus] on click', async () => {
			const cleanJsdom = require('jsdom-global')();
			const focus = spy();
			const elem = document.createElement('div');
			const btn = (
				<button onFocus={focus}>
					bob
				</button>
			);
			ReactDOM.render(btn, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('button').click();
			cleanJsdom();

			assert(focus.calledOnce);
		});

		it('should trigger [mousedown, focus, mouseup, click] events on click', async () => {
			// https://jsbin.com/larubagiwu/1/edit?html,js,console,output
			// https://github.com/wix-incubator/unidriver/pull/86#issuecomment-516809527
			const cleanJsdom = require('jsdom-global')();
			const mousedown = spy();
			const focus = spy();
			const mouseup = spy();
			const click = spy();
			const elem = document.createElement('div');
			const btn = (
				<button onMouseDown={mousedown} onFocus={focus} onMouseUp={mouseup} onClick={click}>
					bob
				</button>
			);
			ReactDOM.render(btn, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('button').click();
			cleanJsdom();

			sinon.assert.callOrder(mousedown, focus, mouseup, click);

			assert(mousedown.calledOnce);
			assert(focus.calledOnce);
			assert(mouseup.calledOnce);
			assert(click.calledOnce);
		});

		it('should trigger [mousedown, focus, mouseup, click, input, change] events on click on input[type=checkbox]', async () => {
			const cleanJsdom = require('jsdom-global')();
			const mousedown = spy();
			const focus = spy();
			const mouseup = spy();
			const click = spy();
			const input = spy();
			const change = spy();
			const elem = document.createElement('div');
			const checkbox = (
				<input
					type="checkbox"
					onMouseDown={mousedown}
					onFocus={focus}
					onMouseUp={mouseup}
					onClick={click}
					onInput={input}
					onChange={change}
				/>
			);

			ReactDOM.render(checkbox, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('input').click();
			cleanJsdom();

			sinon.assert.callOrder(mousedown, focus, mouseup, click, input, change);

			assert(mousedown.calledOnce);
			assert(focus.calledOnce);
			assert(mouseup.calledOnce);
			assert(click.calledOnce);
			assert(input.calledOnce);
			assert(change.calledOnce);
		})

		it('should trigger [focusA, blurA, focusB] when clicking two buttons', async () => {
			const cleanJsdom = require('jsdom-global')();
			const focusA = spy(function focusA () { });
			const focusB = spy(function focusB () { });
			const blurA = spy(function blurA () { });
			const elem = document.createElement('div');
			const btn = (
				<div>
					<button id="A" onFocus={focusA} onBlur={blurA}>
						button A
					</button>
					<button id="B" onFocus={focusB}>
						button B
					</button>
				</div>
			);
			ReactDOM.render(btn, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('button#A').click();
			await driver.$('button#B').click();
			cleanJsdom();

			sinon.assert.callOrder(focusA, blurA, focusB);

			assert(focusA.calledOnce);
			assert(blurA.calledOnce);
			assert(focusB.calledOnce);
		});

		it('should trigger [focusA, blurA] when clicking enabled and disabled button', async () => {
			const cleanJsdom = require('jsdom-global')();
			const focusA = spy();
			const focusB = spy();
			const blurA = spy();
			const elem = document.createElement('div');
			const btn = (
				<div>
					<button id="A" onFocus={focusA} onBlur={blurA}>
						button A
					</button>
					<button id="B" onFocus={focusB} disabled>
						button B
					</button>
				</div>
			);
			ReactDOM.render(btn, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('button#A').click();
			await driver.$('button#B').click();
			cleanJsdom();

			sinon.assert.callOrder(focusA, blurA);

			assert(focusA.calledOnce);
			assert(blurA.calledOnce);
			assert(focusB.notCalled);
		});

		it('should trigger blur on active element when clicking an svg', async () => {
			const cleanJsdom = require('jsdom-global')();
			const blurA = spy();
			const elem = document.createElement('div');
			const testApp = (
				<div>
					<button id="A" onBlur={blurA}>
						button A
					</button>
					<svg id="B" width="100" height="100">
						<circle cx="50" cy="50" r="40" />
					</svg>
				</div>
			);
			ReactDOM.render(testApp, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('button#A').click();
			await driver.$('svg#B').click();
			cleanJsdom();

			assert(blurA.calledOnce);
		});
	})

	describe('enterValue', () => {
		it('should set event target properly', async () => {
			const cleanJsdom = require('jsdom-global')();
			const change = spy();
			const elem = document.createElement('div');
			const input = (
				<input
					type="text"
					name="search"
					onChange={change}
				/>
			);

			ReactDOM.render(input, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('input').enterValue('some keywords');
			assert(change.calledOnce);

			const eventTarget = change.args[0][0].target;
			assert.equal(eventTarget.name, "search");
			assert.equal(eventTarget.type, "text");
			assert.equal(eventTarget.value, "some keywords");

			cleanJsdom();
		});

		it('works with uncontrolled inputs', async () => {
			const cleanJsdom = require('jsdom-global')();
			const elem = document.createElement('div');
			const input = (
				<input
					type="text"
					name="search"
				/>
			);

			ReactDOM.render(input, elem);

			const driver = jsdomReactUniDriver(elem);

			await driver.$('input').enterValue('some keywords');

			const inputValue = await driver.$('input').value();
			assert.equal(inputValue, "some keywords");

			cleanJsdom();
		});
	})

	describe('isDisplayed', () => {
		it('Should indicate if an element is not displayed', async () => {
			const cleanJsdom = require('jsdom-global')();
			const elem = document.createElement('div');
			const noneDisplayedBtn = (
				<button
					className='hidden-button'
					style={{ display: 'none' }}
				/>
			);

			const notVisibleBtn = (
				<button
					className='not-visible-button'
					style={{ display: 'none' }}
				/>
			);

			const transparentBtn = (
				<button
					className='transparent-button'
					style={{ opacity: 0 }}
				/>
			);

			const btn = (
				<button
					className='button'
				/>
			);

			const content = (
				<div>
					{noneDisplayedBtn}
					{notVisibleBtn}
					{transparentBtn}
					{btn}
				</div>
			);

			ReactDOM.render(content, elem);

			const driver = jsdomReactUniDriver(elem);

			assert.equal(await driver.$('.hidden-button').isDisplayed(), false);
			assert.equal(await driver.$('.not-visible-button').isDisplayed(), false);
			assert.equal(await driver.$('.transparent-button').isDisplayed(), false);
			assert.equal(await driver.$('.button').isDisplayed(), true);

			cleanJsdom();
		});
	})

});
