require('chromedriver');
import { startServer } from './server';
import * as puppeteer from 'puppeteer';
import { ThenableWebDriver, Builder } from 'selenium-webdriver';
import { defaultUrl } from './utils';
let server: any = null;
let browser: puppeteer.Browser;
let wd: ThenableWebDriver;

before(async function () {
	this.timeout(20000);
	server = await startServer(8082);
	browser = await puppeteer.launch();

	// cache init stuff
	const cachePup = async () => {
		const page = await browser.newPage();
		await page.goto(defaultUrl, {waitUntil: 'networkidle2'});
		await page.close();
	};

	const cacheWd = async () => wd.get(defaultUrl);

	wd = new Builder()
		.forBrowser('chrome')
		.build();

	await Promise.all([cachePup(), cacheWd()]);
});

after(async () => {
	server.close();
	wd.quit();
	browser.close();
});



export const getWd = () => wd;
export const getBrowser = () => browser;

