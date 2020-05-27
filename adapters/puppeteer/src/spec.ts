import * as puppeteer from 'puppeteer';
import { assert } from 'chai';
import { Browser, Page } from 'puppeteer';
import {
  getTestAppUrl,
  startTestAppServer,
  SetupFn,
  runTestSuite,
} from '@unidriver/test-suite';
import { itemCreator } from '@unidriver/test-suite/dist/utils';
import { pupUniDriver } from './';
import { Server } from 'http';

const port = require('find-free-port-sync')();

let server: Server;
let browser: Browser;
let page: Page;

const before = async () => {
  const args = process.env.CI ? ['--no-sandbox'] : [];
  const headless = !!process.env.CI;
  server = await startTestAppServer(port);
  browser = await puppeteer.launch({ headless, args });
  page = await browser.newPage();
};

const after = async () => {
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

  const tearDown = async () => {};

  return { driver, tearDown };
};

describe('puppeteer', () => {
  runTestSuite({ setup, before, after });
});

describe('puppeteer specific tests', () => {
  beforeEach(() => before());

  afterEach(() => after());

  describe('attr', () => {
    it('should target scoped element and not the page', async () => {
      const { driver } = await setup({
        items: [itemCreator({ label: 'Bob' })],
      });

      const item = await driver.$('.todo-item');
      assert.equal(await item.$('.label').text(), 'Bob');

      assert.equal(await item.$('button').hasClass('toggle'), true);
      assert.equal(await item.$('button').attr('className'), 'toggle');
    });
  });
});
