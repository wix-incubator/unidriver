import { browser, $ } from 'protractor';
import { SetupFn, runTestSuite, getTestAppUrl } from '@unidriver/test-suite';
import { protractorUniDriver } from '.';
import { assert } from 'chai';

import { port } from './protractor.conf';

const setup: SetupFn = async (data) => {
  await browser.get(`http://localhost:${port}${getTestAppUrl(data)}`);
  const driver = protractorUniDriver(() => Promise.resolve($('body')));
  const tearDown = async () => {};
  return { driver, tearDown };
};

describe('protractor', () => {
  runTestSuite({ setup });
});

describe('protractor specific tests', () => {
  it(`doesn't attempt to clear value when shouldClear is false`, async () => {
    const { driver } = await setup({ items: [], initialText: 'hello' });
    await driver
      .$('header input')
      .enterValue(' world!', { shouldClear: false });
    assert.equal(await driver.$('header input').value(), 'hello world!');
  });
});
