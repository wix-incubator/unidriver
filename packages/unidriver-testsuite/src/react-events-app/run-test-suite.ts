import {assert} from 'chai';
import {RunTestFn} from '../run-all-test-suites';
import {KeyboardEventsAppProps} from './';
import {getAllNonTextKeyTypes, getDefinitionForKeyType} from '@unidriver/core';

export const runKeyboardEventsAppTestSuite = (runTest: RunTestFn<KeyboardEventsAppProps>) => {
    describe('keyboard events', () => {
        getAllNonTextKeyTypes().forEach(async (keyType) => {
            it(`pressKey works for ${keyType}`, async () => {
                await runTest({}, async (driver) => {
                    const eventsComp = await driver.$('.keyboard-events input');
                    await eventsComp.pressKey(keyType as any);
                    const def = getDefinitionForKeyType(keyType);
                    assert.equal(await driver.$('.keyboard-event-data .event-key').text(), def.key);
                    assert.equal(await driver.$('.keyboard-event-data .event-keycode').text(), def.keyCode.toString());
                });
            });
        });
    });

    describe('mouse events', () => {
        it('press works', async () => {
            await runTest({}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.press();
                assert.include(await driver.$$('.mouse-event-data .event-type').text(), 'mousedown');
            });
        });

        it('release works', async () => {
            await runTest({}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.release();
                assert.include(await driver.$$('.mouse-event-data .event-type').text(), 'mouseup');
            });
        });

        it('move works', async () => {
            await runTest({}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.moveTo(eventsComp);
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mousemove');
            });
        });
    });
};
