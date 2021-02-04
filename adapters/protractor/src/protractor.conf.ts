import { Server } from 'http';
import { browser } from 'protractor';
import { startTestAppServer } from '@unidriver/test-suite';

export const port = require('find-free-port-sync')();
let server: Server;
const args = process.env.CI ? [
  '--no-sandbox',
  '--headless',
  '--disable-dev-shm-usage'
] : [];

exports.config = {
  framework: 'jasmine',
  onPrepare: async () => {
    await browser.waitForAngularEnabled(false);
  },
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': args
    }
  },
  directConnect: true,
  specs: ['./**/spec.js'],
  beforeLaunch: function () {
    startTestAppServer( port ).then(srvr => server = srvr);
  },
  afterLaunch: function () {
    server.close();
  }
}
