import {
  getTestAppUrl,
  startTestAppServer,
  SetupFn,
  runTestSuite,
} from '@unidriver/test-suite';
import { cypressUniDriver } from '../../src/index';
import { Server } from 'http';
const port = require('find-free-port-sync')();

let server: Server;

// TODO delete examples folder
const beforeFn = async () => {
  // TODO handle headless mode
  const headless = !!process.env.CI;
  server = await startTestAppServer(port);
  cy.visit(`http://localhost:${port}${getTestAppUrl(params)}`)
};

const afterFn = async () => {
  server.close();
};

const setup: SetupFn = async (params) => {
  const driver = cypressUniDriver(cy);

  const tearDown = async () => {};

  return { driver, tearDown };
};

describe('cypress', () => {
  runTestSuite({ setup, before: beforeFn, after: afterFn });
});
