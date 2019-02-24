require('chromedriver');
import { startServer } from './server';
import * as puppeteer from 'puppeteer';
import { ThenableWebDriver, Builder } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { defaultUrl, freePort } from './utils';
let server: any = null;
let browser: puppeteer.Browser;
let wd: ThenableWebDriver;

before(async function () {
	this.timeout(20000);
	server = await startServer(freePort);
	browser = await puppeteer.launch();

	// cache init stuff
	const cachePup = async () => {
		const page = await browser.newPage();
		await page.goto(defaultUrl, {waitUntil: 'networkidle2'});
		await page.close();
	};

	const cacheWd = async () => wd.get(defaultUrl);

	const chromeOptions = new chrome.Options();
	if (!!process.env.CI) {
		chromeOptions.headless();
	}

	wd = new Builder()
		.forBrowser('chrome')
		.setChromeOptions(chromeOptions)
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

