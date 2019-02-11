import {assert} from 'chai';
import {RunTestFn} from '../run-all-test-suites';
import {KeyboardEventsAppProps} from './react-keyboard-events-app';

export const runTestSuite = (runTest: RunTestFn<KeyboardEventsAppProps>) => {
    describe('$', () => {
        describe('text()', () => {
            it('returns text of a element', async () => {
                await runTest({count: 42}, async (driver) => {
                    assert.equal(await driver.$('.button').text(), '42');
                });
            });
        });
    });
};
