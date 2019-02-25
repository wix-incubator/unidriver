import { Browser, Page } from 'puppeteer';

export const freePort = require('find-free-port-sync')();
export const defaultUrl = `http://localhost:${freePort}`;

export const goAndWait = async (browser: Browser, url: string = defaultUrl): Promise<Page> => {
	const page = await browser.newPage();
	await page.goto(url, {waitUntil: 'networkidle2'});
	return page;
};
