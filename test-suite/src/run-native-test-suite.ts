import { assert } from 'chai';
import { MobileUniDriver } from '@unidriver/core';
import { TestAppProps } from './types';
import { MobileTestSuiteParams } from '.';

export const runTestSuite = (params: MobileTestSuiteParams) => {

	const {setup, before: beforeFn, after: afterFn } = params;

	if (beforeFn) {
		before(() => beforeFn());
	}

	if (afterFn) {
		after(() => afterFn());
	}


	const runTest = async (init: TestAppProps, test: (driver: MobileUniDriver) => Promise<any>) => {
		const {driver, tearDown} = await setup(init);

		try {
			return test(driver).then(async () => await tearDown(),
			async (e) => {
				await tearDown();
				throw e;
			});
		} catch (e){
			await tearDown();
		}
  };

  describe('$', () => {
    describe('press()', () => {
      it('works', async () => {
        await runTest({items: [], initialText: ''}, async (driver) => {
          await driver.$('.todo-app header input').enterValue('bob');
          await driver.$('.add').press();

          assert.equal(await driver.$('.count').text(), '1');
          assert.equal(await driver.$('.label').text(), 'bob');
      });
      });
    });
  });
}
