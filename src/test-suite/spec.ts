import { UniDriver } from '../lib';
import { assert } from 'chai';
import { TestSuiteParams, TodoAppData } from '.';
import {Key} from '../lib/key-types';

const itemCreator = (label: string, completed = false) => ({label, completed});

export const runTestSuite = (params: TestSuiteParams) => {

	const {setup} = params;


	const runTest = async (init: TodoAppData, test: (driver: UniDriver) => Promise<any>) => {
		const {driver, tearDown} = await setup(init);

		return test(driver).then(async () => await tearDown(),
		async (e) => {
			await tearDown();
			throw e;
		});
	};

	describe('Unidriver test suite', () => {
		before(async () => {
			if (params.before) {
				await params.before();
			}
		});

		after(async () => {
			if (params.after) {
				await params.after();
			}
		});

		describe('$', () => {
			describe('text()', () => {
				it('returns text of a element', async () => {
					await runTest({items: [itemCreator('Bob')]}, async (driver) => {
						assert.equal(await driver.$('.label').text(), 'Bob');
						assert.equal(await driver.$('.count').text(), '1');
					});
				});

				it('returns text of a element with nested selector', async () => {
					await runTest({items: [itemCreator('Buy milk')]}, async (driver) => {
						assert.equal(await driver.$('.todo-item').$('.label').text(), 'Buy milk');
					});
				});

				it('is lazy', async () => {
					await runTest({items: []}, async (driver) => {

						// we predefine the locator.
						const item = driver.$('.todo-item').$('.label');

						await driver.$('header input').enterValue('Some value');
						await driver.$('.add').click();

						assert.equal(await item.text(), 'Some value');
					});
				});
			});

			describe('value()', () => {
				it('returns value of given input', async () => {
					await runTest({items: [], initialText: 'Bob'}, async (driver) => {
						assert.equal(await driver.$('header input').value(), 'Bob');
					});
				});
			});

			describe('enterValue()', () => {
				it('works', async () => {
					await runTest({items: [], initialText: ''}, async (driver) => {
						await driver.$('header input').enterValue('hey there');
						assert.equal(await driver.$('header input').value(), 'hey there');
					});
				});
			});

			describe('click()', () => {
				it('works', async () => {
					await runTest({items: [], initialText: ''}, async (driver) => {
						await driver.$('input').enterValue('bob');
						await driver.$('.add').click();
					
						assert.equal(await driver.$('.count').text(), '1');
						assert.equal(await driver.$('.label').text(), 'bob');
					});
				});
			});

			describe('hover()', () => {
				it('works', async () => {
					await runTest({items: [itemCreator('Bob'), itemCreator('David')]}, async (driver) => {
						const bd = await driver.$$('.todo-item').get(1);
						await bd.hover();

						// const classLists = await (await (await bd.getNative()).getProperty('classList')).jsonValue();
						// console.log('THIS IS CLASS', classLists);

						assert.equal(await bd.hasClass('active'), true);
					});
				});
			});

			describe('exists()', () => {

				it('returns true when an element exists', async () => {
					await runTest({items: []}, async (driver) => {
						assert.equal(await driver.$('.count').exists(), true);
						assert.equal(await driver.$('.add').exists(), true);
					});
				});

				it('returns false when an element does not exist', async () => {
					await runTest({items: []}, async (driver) => {
						assert.equal(await driver.$('.tootim').exists(), false);
						assert.equal(await driver.$('#arnold-schwarzenegger').exists(), false);
					});
				});

			});

			describe('getNative()', () => {
				it('returns a native element for advanced usages', async () => {
					await runTest({}, async (driver) => {
						const native = await driver.getNative();
						assert.isDefined(native);
					});
				});
			});

			describe('pressKey()', () => {
				it('single key works', async () => {
					await runTest({items: [], initialText: ''}, async (driver) => {
						await driver.$('input').enterValue('bob');
						await driver.$('.add').pressKey(Key.ENTER);
						assert.equal(await driver.$('.count').text(), '1');
						assert.equal(await driver.$('.label').text(), 'bob');
					});
				});
			});
		});

		describe('$$', () => {
			describe('get()', () => {
				it('returns single driver in the required position', async () => {
					const items = [itemCreator('Bob'), itemCreator('David')];
					await runTest({items}, async (driver) => {
						assert.equal(await driver.$$('.label').get(0).text(), 'Bob');
						assert.equal(await driver.$$('.label').get(1).text(), 'David');
					});
				});
			});

			describe('text()', () => {
				it('returns the text of all given drivers in the list', async () => {
					const items = [itemCreator('Bob'), itemCreator('David')];
					await runTest({items}, async (driver) => {
						assert.deepEqual(await driver.$$('.label').text(), ['Bob', 'David']);
					});
				});
			});

			describe('count()', () => {
				it('returns the text of all given drivers in the list', async () => {
					const items = [itemCreator('Bob'), itemCreator('David'), itemCreator('Jacob')];
					await runTest({items}, async (driver) => {
						assert.deepEqual(await driver.$$('.todo-item').count(), 3);
					});
				});
			});

			describe('map()', () => {
				it('works for text', async () => {
					const items = [itemCreator('Bob'), itemCreator('David'), itemCreator('Jacob')];
					await runTest({items}, async (driver) => {
						assert.deepEqual(await driver.$$('.todo-item .label').map((bd) => bd.text()), ['Bob', 'David', 'Jacob']);
					});
				});

				it('passes index', async () => {
					const items = [itemCreator('Bob'), itemCreator('David'), itemCreator('Jacob')];
					await runTest({items}, async (driver) => {
						const idx = await driver.$$('.todo-item').map((_, i) => Promise.resolve(i));
						assert.deepEqual(idx, [0, 1, 2]);
					});
				});
			});

			describe('filter()', () => {
				it('works', async () => {
					const items = [itemCreator('Bob', true), itemCreator('David'), itemCreator('Jacob', true)];
					await runTest({items}, async (driver) => {
						const completed = await driver.$$('.todo-item').filter((item) => item.$('.completed').exists());
						assert.deepEqual(await completed.count(), 2);
					});
				});
			});

			describe('scrollIntoView()', () => {
				it('works', async () => {
					const items = Array.from(Array(150).keys()).map(value => itemCreator(value.toString()));
					await runTest({items}, async (driver) => {
						if (driver.type !== 'react') {
							const footer: UniDriver = await driver.$('footer');

							assert.isNotTrue(await footer.isDisplayed(), 'Footer is displayed :(');
							await footer.scrollIntoView();
							assert.isTrue(await footer.isDisplayed(), 'Displayed, unfortunately');
						}

						assert.isTrue(true);
					});
				});
			});

		});

	});
};
