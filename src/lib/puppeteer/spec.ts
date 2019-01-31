import { runTestSuite }        from '../../test-suite/spec';
import { startServer, getUrl } from '../../test-suite/server';
import * as puppeteer          from 'puppeteer';
import { pupUniDriver }        from './index';
import { TodoAppSetupFn }      from '../../test-suite';
import { Server }              from 'http';
import {Browser, Page}         from 'puppeteer';

const port = 8082;

let server: Server;
let browser: Browser;
let page: Page;

const before = async () => {
	const args = process.env.CI ? ['--no-sandbox'] : [];
	const headless = !!process.env.CI;
	server = await startServer(port);
	browser = await puppeteer.launch({headless,args});
	page = await browser.newPage();
	// page.on('console', msg => console.log('PAGE LOG:', msg.text()));
};

const after = async () => {
	server.close();
	await page.close();
	await browser.close();
};

const setup: TodoAppSetupFn = async (data) => {

	await page.goto(`http://localhost:${port}${getUrl(data)}`);
	const driver = pupUniDriver(() => page.$('body'));

	const tearDown = async () => { }

	return {driver, tearDown};
}


describe('puppeteer', () => {
	runTestSuite({setup, before, after});
});


describe('puppeteer specific tests', () => {



});
