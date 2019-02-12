import {assert} from 'chai';
import {RunTestFn} from '../run-all-test-suites';
import {KeyboardEventsAppProps} from '.';
import { Key, getModifiedKey } from '../../lib/key-types';
import { delay } from 'q';

export const runTestSuite = (runTest: RunTestFn<KeyboardEventsAppProps>) => {
    describe('keyboard events', () => {
        it('pressKey works for all keys', async () => {
            await runTest({}, async (driver) => {
                const keys = Object.keys(Key).map(k => Key[k as any]);
                const eventsComp = await driver.$('.events-container input')
                const promises = keys.map(async (k) => {
                    await eventsComp.pressKey(k);
                    await delay(400);
                });
                await Promise.all(promises);

                await delay(1000);

                assert.includeDeepMembers(await driver.$$('.event-key').text(), keys.map(getModifiedKey));
            });
        }).timeout(15000);
    });
};
