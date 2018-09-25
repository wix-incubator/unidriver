import { runTestSuite } from '../../test-suite/spec';
import { startServer, getUrl } from '../../test-suite/server';
import * as puppeteer from 'puppeteer';
import { goAndWait } from '../../examples/utils';
import { pupUniDriver } from './index';
import { TodoAppSetupFn } from '../../test-suite';
import { Server } from 'http';
import { Browser } from 'puppeteer';

const port = 8082;

let server: Server;
let browser: Browser;

const before = async () => {
	const args = process.env.CI ? ['--no-sandbox'] : [];
	const headless = process.env.CI ? true : false;
	server = await startServer(port);
	browser = await puppeteer.launch({headless,args});
};

const after = async () => {
	server.close();
	await browser.close();
};

const setup: TodoAppSetupFn = async (data) => {

	const page = await goAndWait(browser, `http://localhost:${port}${getUrl(data)}`);
	const driver = pupUniDriver(() => page.$('body'));

	const tearDown = async () => {
		await page.close();
	};

	return {driver, tearDown};
}


describe('puppeteer', () => {
	runTestSuite({setup, before, after});
});


describe('pupeeter specific tests', () => {



});
