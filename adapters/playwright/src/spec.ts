import { Browser, Page, chromium, webkit, BrowserType, firefox } from 'playwright';
import {
  getTestAppUrl,
  startTestAppServer,
  SetupFn,
  runTestSuite,
} from '@unidriver/test-suite';
import { playwrightUniDriver } from './';
import { Server } from 'http';
import { assert } from 'chai';

const port = require('find-free-port-sync')();

let server: Server;
let browser: Browser;
let page: Page;

const beforeFn = async (browserType: BrowserType<Browser>) => {
  const args = process.env.CI ? ['--no-sandbox'] : [];
  const headless = !!process.env.CI;
  server = await startTestAppServer(port);
  browser = await browserType.launch({
    headless,
    args
  });
  page = await browser.newPage();
};

const afterFn = async () => {
  server.close();
  await page.close();
  await browser.close();
};

const setup: SetupFn = async (params) => {
  await page.goto(`http://localhost:${port}${getTestAppUrl(params)}`);
  const driver = playwrightUniDriver({
    page,
    selector: 'body',
  });

  const tearDown = async () => {};

  return { driver, tearDown };
};

for (const browserType of [chromium, webkit, firefox]) {
  describe('playwright', () => {
    runTestSuite({ setup, before: () => beforeFn(browserType), after: afterFn });
  });

  describe('playwright specific tests', () => {
    before(() => beforeFn(browserType));
    after(afterFn);
    describe('enterValue', () => {
      it(`doesn't attempt to clear value when shouldClear is false`, async () => {
        const { driver } = await setup({ items: [], initialText: 'hello' });
        await driver
          .$('header input')
          .enterValue(' world!', { shouldClear: false });
        assert.equal(await driver.$('header input').value(), 'hello world!');
      });
    });
  });
}
