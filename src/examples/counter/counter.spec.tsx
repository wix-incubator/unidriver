import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { assert } from 'chai';
import { counterDriver } from './counter.driver';
import { reactUniDriver } from '../../lib/react';
import { Counter } from './counter';

const render = (val: number) => {
	const div = document.createElement('div');
	ReactDOM.render(<Counter init={val}/>, div);
	return div;
};

const renderAppAndCreateDriver = (val: number) => {
	const app = render(val);
	const base = reactUniDriver(app);
	return counterDriver(base);
};

describe('counter', async () => {
	it('shows initial value', async () => {
		const driver = renderAppAndCreateDriver(5);
		assert.equal(await driver.val(), 5);
	});

	it('increases value', async () => {
		[5, 8, 58, 124, -214].forEach(async (num) => {
			const driver = renderAppAndCreateDriver(num);
			await driver.increase();
			assert.equal(await driver.val(), num + 1);
			await driver.increase();
			await driver.increase();
			assert.equal(await driver.val(), num + 3);
		});
	});

	it('decreases value', async () => {
		[5, 8, 58, 124, -214].forEach(async (num) => {
			const driver = renderAppAndCreateDriver(num);
			await driver.decrease();
			assert.equal(await driver.val(), num - 1);
			await driver.decrease();
			await driver.decrease();
			assert.equal(await driver.val(), num - 3);
		});
	});

});
