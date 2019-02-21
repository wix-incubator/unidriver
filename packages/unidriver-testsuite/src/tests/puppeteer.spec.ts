import * as puppeteer from 'puppeteer';
import {Browser, Page} from 'puppeteer';
import {getUrl, startServer} from '../server';
import {pupUniDriver} from '@unidriver/puppeteer';
import {Server} from 'http';
import {KeyboardEventsAppSetupFn, TodoAppSetupFn, SetupFn} from '../';
import {runAllTestSuites} from '../run-all-test-suites';
import { TodoAppProps } from '../react-todoapp';
import { KeyboardEventsAppProps } from '../react-events-app';

const port = 8082;

let server: Server;
let browser: Browser;
let page: Page;

const before = async () => {
  const args = process.env.CI ? ['--no-sandbox'] : [];
  const headless = !!process.env.CI;
  server = await startServer(port);
  browser = await puppeteer.launch({headless, args});
  page = await browser.newPage();
};

const after = async () => {
  server.close();
  await page.close();
  await browser.close();
};

const commonSetup = <P>(path: string): SetupFn<P> => async (data) => {
    await page.goto(`http://localhost:${port}${getUrl<P>(path, data)}`);
    const driver = pupUniDriver({
        page,
        selector: 'body'
    });

    const tearDown = async () => {};

    return {driver, tearDown};
};

describe('puppeteer', () => {
	const todoAppSetup: TodoAppSetupFn = commonSetup<TodoAppProps>('todo-app');
	const eventsAppSetup: KeyboardEventsAppSetupFn = commonSetup<KeyboardEventsAppProps>('events-app');

	runAllTestSuites({todoAppParams: {setup: todoAppSetup, before, after},
		keyboardEventsAppParams: {setup: eventsAppSetup, before, after}});
});

describe('puppeteer specific tests', () => {
  
});
