import {assert} from 'chai';
import {RunTestFn} from '../run-all-test-suites';
import {KeyboardEventsAppProps} from '.';
import { Key, getModifiedKey } from '../../lib/key-types';

export const runTestSuite = (runTest: RunTestFn<KeyboardEventsAppProps>) => {
    describe('keyboard events', () => {
        const keys = Object.keys(Key).map(k => Key[k as any]);
        keys.forEach(async (k) => {
            it(`pressKey works for ${k}`, async () => {
                await runTest({}, async (driver) => {
                    const eventsComp = await driver.$('.events-container input');
                    await eventsComp.pressKey(k);
                    assert.equal(await driver.$('.events-container .event-key').text(), getModifiedKey(k));
                });
            });
        });
    });
};
