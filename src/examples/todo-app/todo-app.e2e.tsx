import { assert } from 'chai';
import { pupUniDriver } from '../../lib/puppeteer';
import { todoAppDriver } from './todo-app.driver';
import { getBrowser } from '../shared.e2e';
import { goAndWait } from '../utils';
import { Page } from 'puppeteer';

describe('todo app', () => {

	let page: Page;

	beforeEach(async () => page = await goAndWait(getBrowser()));
	afterEach(() => page.close());

	const begin = async () => {
		const base = pupUniDriver(async() => {
			const selector = 'body';
			return{
				element: await page.$(selector),
				page,
				selector
			}
		});
		return todoAppDriver(base);
	};

	it('adds new item', async () => {
		const driver = await begin();
		assert.notInclude(await driver.getItems(), 'New bob');
		await driver.addItem('New bob');
		assert.include(await driver.getItems(), 'New bob');
	});

	it('adds toggles items', async () => {
		const driver = await begin();
		assert.equal(await driver.isDone(0), true);
		await driver.toggleItem(0);
		assert.equal(await driver.isDone(0), false);
	});

	it('adds removes items', async () => {
		const driver = await begin();
		assert.equal((await driver.getItems()).length, 2);
		await driver.deleteItem(0);
		assert.equal((await driver.getItems()).length, 1);
		await driver.deleteItem(0);

		assert.equal((await driver.getItems()).length, 0);
	});

	it('has a counter', async () => {
		const driver = await begin();
		assert.equal(await driver.getCount(), 2);
		await driver.addItem('bob');
		assert.equal(await driver.getCount(), 3);
		await driver.deleteItem(2);
		await driver.deleteItem(1);
		assert.equal(await driver.getCount(), 1);
	});

});
