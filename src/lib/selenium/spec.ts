import { runTestSuite } from '../../test-suite/spec';
import { startServer, getUrl } from '../../test-suite/server';
import { seleniumUniDriver } from './index';
import { TodoAppSetupFn } from '../../test-suite';
import { Server } from 'http';
import { ThenableWebDriver, Builder, WebElement, By } from 'selenium-webdriver';

const port = 8082;

let server: Server;
let wd: ThenableWebDriver;

const before = async () => {
	server = await startServer(port);
	wd = new Builder()
	.forBrowser('chrome')
	.build();
};

const after = async () => {
	server.close();
	await wd.quit();
};

const setup: TodoAppSetupFn = async (data) => {

	await wd.get(`http://localhost:${port}${getUrl(data)}`);
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
	runTestSuite({setup, before, after});
});


describe('selenium specific tests', () => {



});
