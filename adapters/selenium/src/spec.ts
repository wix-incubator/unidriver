require('chromedriver');
import { seleniumUniDriver } from './';
import { Server } from 'http';
import { ThenableWebDriver, Builder, WebElement, By } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import {
  SetupFn,
  runTestSuite,
  startTestAppServer,
  getTestAppUrl,
} from '@unidriver/test-suite';
import { assert } from 'chai';

const port = require('find-free-port-sync')();

let server: Server;
let wd: ThenableWebDriver;

const beforeFn = async () => {
  const headless = !!process.env.CI;
  const chromeOptions = new chrome.Options();

  if (headless) {
    chromeOptions.headless();
  }

  server = await startTestAppServer(port);
  wd = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  await wd.get(`http://localhost:${port}${getTestAppUrl({})}`);

  const driver = seleniumUniDriver(() => {
    const el: any = wd.findElement(By.css('body'));
    return el as Promise<WebElement>;
  });

  await driver.wait();
};

const afterFn = async () => {
  server.close();
  await wd.quit();
};

const setup: SetupFn = async (data) => {
  await wd.get(`http://localhost:${port}${getTestAppUrl(data)}`);
  const driver = seleniumUniDriver(() => {
    const el: any = wd.findElement(By.css('body'));
    return el as Promise<WebElement>;
  });

  const tearDown = async () => {
    // await wd.close();
  };

  await driver.wait();

  return { driver, tearDown };
};

describe('selenium', () => {
  runTestSuite({ setup, before: beforeFn, after: afterFn });
});

describe('selenium specific tests', () => {
  before(beforeFn);
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
