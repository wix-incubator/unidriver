import { assert } from 'chai';
import { pupUniDriver } from '../../lib/puppeteer';
import { multiCounterDriver } from './multi-counter.driver';
import { getBrowser } from '../shared.e2e';
import { goAndWait } from '../utils';
import { Page } from 'puppeteer';

describe('multi counter', () => {

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
		return multiCounterDriver(base);
	};

	it('shows one counter with 0', async () => {
		const driver = await begin();
		assert.equal(await driver.count(), 1);
		assert.equal(await driver.val(0), 0);
	});

	it('adds counters', async () => {
		const driver = await begin();
		await driver.add();
		assert.equal(await driver.count(), 2);
		await  driver.add();
		await  driver.add();
		assert.equal(await driver.count(), 4);
	});

	it('has independently working counters', async () => {
		const driver = await begin();
		await driver.add();
		await  driver.add();
		await driver.increase(0);
		assert.equal(await driver.val(0), 1);
		assert.equal(await driver.val(1), 0);
		await driver.increase(1);
		assert.equal(await driver.val(1), 1);
	});

	it('removes counters', async () => {
		const driver = await begin();
		await driver.remove(0);
		assert.equal(await driver.count(), 0);
	});

});
