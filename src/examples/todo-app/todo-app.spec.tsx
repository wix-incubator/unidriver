import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { TodoApp } from './todo-app';

import { todoAppDriver } from './todo-app.driver';
import { assert } from 'chai';
import { reactUniDriver } from '../../lib/react';

const renderApp = () => {
	const div = document.createElement('div');
	ReactDOM.render(<TodoApp/>, div);
	return div;
};

const renderAppAndCreateDriver = () => {
	const app = renderApp();
	const base = reactUniDriver(app);
	return todoAppDriver(base);
};

describe('todo app', async () => {
	it('adds new item', async () => {
		const driver = renderAppAndCreateDriver();

		assert.notInclude(await driver.getItems(), 'New bob');
		await driver.addItem('New bob');
		assert.include(await driver.getItems(), 'New bob');
	});

	it('marks items as done or undone', async () => {
		const driver = renderAppAndCreateDriver();

		assert.equal(await driver.isDone(0), true);
		await driver.toggleItem(0);
		assert.equal(await driver.isDone(0), false);
	});

	it('removes items', async () => {
		const driver = renderAppAndCreateDriver();

		assert.deepEqual(await driver.getItems(), ['Code', 'Eat']);

		await driver.deleteItem(0);
		assert.deepEqual(await driver.getItems(), ['Eat']);
		await driver.deleteItem(0);
		assert.deepEqual(await driver.getItems(), []);
	});

	it('has a counter', async () => {
		const driver = renderAppAndCreateDriver();

		assert.equal(await driver.getCount(), 2);
		await driver.addItem('bob');
		assert.equal(await driver.getCount(), 3);
		await driver.deleteItem(2);
		await driver.deleteItem(1);
		assert.equal(await driver.getCount(), 1);
	});
});
