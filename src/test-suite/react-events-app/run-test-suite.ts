import {assert} from 'chai';
import {RunTestFn} from '../run-all-test-suites';
import {KeyboardEventsAppProps} from '.';
import {getAllNonTextKeyTypes, getDefinitionForKeyType} from '../../lib/key-types';

export const runTestSuite = (runTest: RunTestFn<KeyboardEventsAppProps>) => {
    describe('keyboard events', () => {
        getAllNonTextKeyTypes().forEach(async (keyType) => {
            it(`pressKey works for ${keyType}`, async () => {
                await runTest({}, async (driver) => {
                    const eventsComp = await driver.$('.events-container input');
                    await eventsComp.pressKey(keyType);
                    const def = getDefinitionForKeyType(keyType);
                    assert.equal(await driver.$('.events-container .event-key').text(), def.key);
                    assert.equal(await driver.$('.events-container .event-keycode').text(), def.keyCode.toString());
                });
            });
        });
    });
};
