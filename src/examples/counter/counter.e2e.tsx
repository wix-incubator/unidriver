import { assert } from 'chai';
import { pupUniDriver } from '../../lib/puppeteer';
import { counterDriver } from './counter.driver';
import { getBrowser } from '../shared.e2e';
import { goAndWait } from '../utils';
import { Page } from 'puppeteer';

describe('counter', () => {

	let page: Page;

	beforeEach(async () => page = await goAndWait(getBrowser()));
	afterEach(() => page.close());

	const begin = async () => {
		const base = pupUniDriver(async() => {
			const selector = 'body'
			return{
				element: await page.$(selector),
				page,
				selector
			}
		});
		return counterDriver(base);
	};

	it('shows initial value', async () => {
		const driver = await begin();
		assert.equal(await driver.val(), 0);
	});

	it('increases value', async () => {
		const driver = await begin();
		await driver.increase();
		assert.equal(await driver.val(), 1);
		await driver.increase();
		await driver.increase();
		assert.equal(await driver.val(), 3);
	});

	it('decreases value', async () => {
		const driver = await begin();
		await driver.decrease();
		assert.equal(await driver.val(), -1);
		await driver.decrease();
		await driver.decrease();
		assert.equal(await driver.val(), -3);
	});
});
