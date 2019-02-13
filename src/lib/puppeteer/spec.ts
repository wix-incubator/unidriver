import {runAllTestSuites} from '../../test-suite/run-all-test-suites';
import {getUrl, startServer} from '../../test-suite/server';
import * as puppeteer from 'puppeteer';
import {Browser, Page} from 'puppeteer';
import {pupUniDriver} from './index';
import {KeyboardEventsAppSetupFn, SetupFn, TodoAppSetupFn} from '../../test-suite';
import {Server} from 'http';
import {TodoAppProps} from '../../test-suite/react-todoapp';
import {KeyboardEventsAppProps} from '../../test-suite/react-events-app';

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

// describe.only('puppeteer specific tests', () => {
//   const eventsAppSetup: KeyboardEventsAppSetupFn = commonSetup<KeyboardEventsAppProps>('events-app');
//   runAllTestSuites({keyboardEventsAppParams: {setup: eventsAppSetup, before, after}});
// });
