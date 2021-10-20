import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import {
  getTestAppUrl,
  startTestAppServer,
  SetupFn,
  itemCreator,
  runTestSuite
} from '@unidriver/test-suite';
import { pupUniDriver } from './';
import { Server } from 'http';
import { assert } from 'chai';

const port = require('find-free-port-sync')();

let server: Server;
let browser: Browser;
let page: Page;

const beforeFn = async () => {
  const args = process.env.CI ? ['--no-sandbox'] : [];
  const headless = !!process.env.CI || undefined;
  server = await startTestAppServer(port);
  browser = await puppeteer.launch({
    headless,
    args,
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
  const driver = pupUniDriver({
    page,
    selector: 'body',
  });

  const tearDown = async () => { };

  return { driver, tearDown };
};

describe('puppeteer', () => {
  runTestSuite({ setup, before: beforeFn, after: afterFn });
});

describe('puppeteer specific tests', () => {
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
  describe('text', () => {
    it(`checking text return value when the text is empty`, async () => {
      const { driver } = await setup({ items: [itemCreator({ label: '' })], initialText: '' });
      const labelText = await driver.$$('.label').text();
      assert.equal(labelText[0], "");
    });
    it(`checking text return value when the text is not empty`, async () => {
      const { driver } = await setup({ items: [itemCreator({ label: 'hello' })], initialText: '' });
      const labelText = await driver.$$('.label').text();
      assert.equal(labelText[0], "hello");
    });
    it(`checking text return value when the component doesn't have textContent property`, async () => {
      const { driver } = await setup({ items: [], initialText: 'hello' });
      
      let textThatDoesNotExists = await driver.$('header input').text();
      assert.equal(textThatDoesNotExists, '');
    });
  });
});
