import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { assert } from 'chai';
import { reactUniDriver } from '../../lib/react';
import { MultiCounter } from './multi-counter';
import { multiCounterDriver } from './multi-counter.driver';

const render = () => {
	const div = document.createElement('div');
	ReactDOM.render(<MultiCounter/>, div);
	return div;
};

const renderAppAndCreateDriver = () => {
	const app = render();
	const base = reactUniDriver(app);
	return multiCounterDriver(base);
};

describe('multi counters', async () => {
	it('shows one counter with 0', async () => {
		const driver = renderAppAndCreateDriver();
		assert.equal(await driver.count(), 1);
		assert.equal(await driver.val(0), 0);
	});

	it('adds counters', async () => {
		const driver = renderAppAndCreateDriver();
		await driver.add();
		assert.equal(await driver.count(), 2);
		await  driver.add();
		await  driver.add();
		assert.equal(await driver.count(), 4);
	});

	it('has independently working counters', async () => {
		const driver = renderAppAndCreateDriver();
		await driver.add();
		await  driver.add();
		await driver.increase(0);
		assert.equal(await driver.val(0), 1);
		assert.equal(await driver.val(1), 0);
		await driver.increase(1);
		assert.equal(await driver.val(1), 1);
	});

	it('removes counters', async () => {
		const driver = renderAppAndCreateDriver();
		await driver.remove(0);
		assert.equal(await driver.count(), 0);
	});

});
