import { startServer, getUrl } from '../../test-suite/server';
import { seleniumUniDriver } from './index';
import { TodoAppSetupFn, KeyboardEventsAppSetupFn, SetupFn } from '../../test-suite';
import { Server } from 'http';
import { ThenableWebDriver, Builder, WebElement, By } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import {runAllTestSuites} from '../../test-suite/run-all-test-suites';
import { TodoAppProps } from '../../test-suite/react-todoapp';
import { KeyboardEventsAppProps } from '../../test-suite/react-events-app';

const port = 8082;

let server: Server;
let wd: ThenableWebDriver;

const before = async () => {
	const headless = !!process.env.CI;
	const chromeOptions = new chrome.Options();

	if (headless) {
		chromeOptions.headless();
	}

	server = await startServer(port);
	wd = new Builder()
		.forBrowser('chrome')
		.setChromeOptions(chromeOptions)
		.build();
};

const after = async () => {
	server.close();
	await wd.quit();
};

const commonSetup = <P>(path: string): SetupFn<P> => async (data) => {
	await wd.get(`http://localhost:${port}${getUrl(path, data)}`);
	const driver = seleniumUniDriver(() => {
		const el: any = wd.findElement(By.css('body'));
		return el as Promise<WebElement>
	});

	const tearDown = async () => {
		// await wd.close();
	};

	return {driver, tearDown};
}

describe('selenium', () => {
	const todoAppSetup: TodoAppSetupFn = commonSetup<TodoAppProps>('todo-app');
	const eventsAppSetup: KeyboardEventsAppSetupFn = commonSetup<KeyboardEventsAppProps>('events-app');

	runAllTestSuites({todoAppParams: {setup: todoAppSetup, before, after},
		keyboardEventsAppParams: {setup: eventsAppSetup, before, after}});
});


describe('selenium specific tests', () => {



});
