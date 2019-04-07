import { browser, $} from 'protractor';
import { SetupFn, runTestSuite, getTestAppUrl } from '@unidriver/test-suite';
import { protractorUniDriver } from '.';

import { port } from '../protractor.conf';

const setup: SetupFn = async (data) => {
	await browser.get(`http://localhost:${port}${getTestAppUrl(data)}`);
	const driver = protractorUniDriver(() => Promise.resolve($('body')));
  const tearDown = async () => {};
	return {driver, tearDown};
};

describe('protractor', () => {
	
	runTestSuite({setup});

});

describe('protractor specific tests', () => {

});


