// import * as protractor from 'protractor';

// import { runTestSuite } from '../../test-suite/spec';
// import { startServer, getUrl } from '../../test-suite/server';
// import { goAndWait } from '../../examples/utils';
// import { protrUniDriver } from './index';
// import { TodoAppSetupFn } from '../../test-suite';
// import { Server } from 'http';
// ;

// const port = 8083;

// let server: Server;

// const before = async () => {
//   server = await startServer(port);
//   //How to run protractor with selenium??
// };

// const after = async () => {
// 	server.close();
// 	//await browser.close();
// };

// const setup: TodoAppSetupFn = async (data) => {

// 	const page = await goAndWait(browser, `http://localhost:${port}${getUrl(data)}`);
// 	const driver = protrUniDriver(() => page.$('body'));

// 	const tearDown = async () => {
// 		await page.close();
// 	};

// 	return {driver, tearDown};
// }


// describe('protractor', () => {
// 	runTestSuite({setup, before, after});
// });
