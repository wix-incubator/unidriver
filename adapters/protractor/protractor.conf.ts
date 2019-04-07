import { Server } from 'http';
import { browser } from 'protractor';
import { startTestAppServer } from '@unidriver/test-suite';

export const port = require('find-free-port-sync')();
let server: Server;

exports.config = {
  framework: 'jasmine',
  onPrepare() {
    browser.ignoreSynchronization = true;
  },
  capabilities: {
    'browserName': 'chrome'
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
