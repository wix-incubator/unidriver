import { assert } from 'chai';
import { todoAppDriver } from './todo-app.driver';
import { getWd } from '../shared.e2e';
import { defaultUrl } from '../utils';
import { seleniumUniDriver } from '../../lib/selenium';
import { WebElement, By } from 'selenium-webdriver';

describe('todo app', function () {

	// tslint:disable-next-line:no-invalid-this
	this.timeout(20000);

	beforeEach(async () => getWd().get(defaultUrl));

	const begin = async () => {
		const base = seleniumUniDriver(async () => {
			const el: any = getWd().findElement(By.css('body'));
			return el as Promise<WebElement>;
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
