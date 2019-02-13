import {assert} from 'chai';
import {RunTestFn} from '../run-all-test-suites';
import {KeyboardEventsAppProps} from '.';
import {getAllNonTextKeyTypes, getDefinitionForKeyType} from '../../lib/key-types';
import { WebElement } from 'protractor';
import { ElementHandle } from 'puppeteer';

export const runTestSuite = (runTest: RunTestFn<KeyboardEventsAppProps>) => {
    describe('keyboard events', () => {
        getAllNonTextKeyTypes().forEach(async (keyType) => {
            it(`pressKey works for ${keyType}`, async () => {
                await runTest({}, async (driver) => {
                    const eventsComp = await driver.$('.keyboard-events input');
                    await eventsComp.pressKey(keyType);
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
                const nativeEventsComp = await eventsComp.getNative();
                let coordinates: {x: number, y: number};
                const offset = 50; // 100px is the size of the width/height of the button, so we focus in the middle

                await eventsComp.mouse.moveTo(eventsComp);

                switch (driver.type) {
                    case 'selenium':
                        const location = await (nativeEventsComp as WebElement).getLocation();
                        coordinates = {x: location.x + offset, y: location.y + offset};
                        break;
                    case 'puppeteer':
                        const box = await (nativeEventsComp.element as ElementHandle).boundingBox();
                        if (!!box) {
                            coordinates = {x: box.x, y: box.y}
                            break;
                        } else {
                            throw new Error('issue with getting boundingBox on target element with puppeteer');
                        }

                    default:
                        coordinates = {x: nativeEventsComp.getBoundingClientRect().left, y: nativeEventsComp.getBoundingClientRect().top}
                }
                
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mousemove');
                assert.equal(await driver.$('.mouse-event-data .event-client-x').text(), `${coordinates.x}`);
                assert.equal(await driver.$('.mouse-event-data .event-client-y').text(), `${coordinates.y}`);
            });
        });
    });
};
