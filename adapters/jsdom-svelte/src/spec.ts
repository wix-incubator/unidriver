import {renderSvelteApp, SetupFn, runTestSuite} from '@unidriver/test-suite';
import {jsdomSvelteUniDriver} from './index';

const setup: SetupFn = async (params) => {
    const cleanJsdom = require('jsdom-global')();
    const div = document.createElement('div');
    document.body.appendChild(div);
    const cleanApp = renderSvelteApp(div, params);
    const driver = jsdomSvelteUniDriver(div);

    const tearDown = () => {
        cleanApp();
        cleanJsdom();
        return Promise.resolve();
    };

    return {driver, tearDown};
};
//
describe('svelte base driver - test suite', () => {
    runTestSuite({
        setup
    });
});
