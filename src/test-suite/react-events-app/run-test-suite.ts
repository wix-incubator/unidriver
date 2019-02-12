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
                    const eventsComp = await driver.$('.keyboard-events input');
                    await eventsComp.pressKey(k);
                    assert.equal(await driver.$('.keyboard-event-data .event-key').text(), getModifiedKey(k));
                });
            });
        });
    });

    describe('mouse events', () => {
        it('press works', async () => {
            await runTest({}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.press();
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mousedown');
            });
        });

        it('release works', async () => {
            await runTest({}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.release();
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mouseup');
            });
        });

        it('move works', async () => {
            await runTest({}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                const coordinates = {x: 10, y: 15};
                if (eventsComp.mouse.move) {
                    await eventsComp.mouse.move(coordinates);
                }

                assert.deepEqual(await driver.$('.mouse-event-data .event-type').text(), 'mousemove');
                assert.equal(await driver.$('.mouse-event-data .event-client-x').text(), `${coordinates.x}`);
                assert.equal(await driver.$('.mouse-event-data .event-client-y').text(), `${coordinates.y}`);
            });
        });
    });
};
