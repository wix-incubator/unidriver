import {assert} from 'chai';
import {UniDriver, getAllNonTextKeyTypes, getDefinitionForKeyType, isMultipleElementsWithLocatorError, isNoElementWithLocatorError} from '@unidriver/core';
import { TestSuiteParams } from '.';
import { itemCreator } from './utils';
import { TestAppProps } from './types';

export const runTestSuite = (params: TestSuiteParams) => {

	const {setup, before: beforeFn, after: afterFn } = params;

	if (beforeFn) {
		before(() => beforeFn());
	}

	if (afterFn) {
		after(() => afterFn());
	}


	const runTest = async (init: TestAppProps, test: (driver: UniDriver) => Promise<any>) => {
		const {driver, tearDown} = await setup(init);

		try {
			return test(driver).then(async () => await tearDown(),
			async (e) => {
				await tearDown();
				throw e;
			});
		} catch (e){
			await tearDown();
		}
	};

    describe('$', () => {
        describe('text()', () => {
            it('returns text of a element', async () => {
					await runTest({items: [itemCreator({label: 'Bob'})]}, async (driver) => {
                    assert.equal(await driver.$('.label').text(), 'Bob');
                    assert.equal(await driver.$('.count').text(), '1');
                });
            });

            it('returns text of a element with nested selector', async () => {
					await runTest({items: [itemCreator({label: 'Buy milk'})]}, async (driver) => {
                    assert.equal(await driver.$('.todo-item').$('.label').text(), 'Buy milk');
                });
            });

            it('is lazy', async () => {
                await runTest({items: []}, async (driver) => {

                    // we predefine the locator.
                    const item = driver.$('.todo-item').$('.label');

                    await driver.$('header input').enterValue('Some value');
                    await driver.$('.add').click();
                    assert.equal(await item.text(), 'Some value');
                });
            });
        });

        describe('value()', () => {
            it('returns value of given input', async () => {
                await runTest({items: [], initialText: 'Bob'}, async (driver) => {
                    assert.equal(await driver.$('header input').value(), 'Bob');
                });
            });
        });

        describe('enterValue()', () => {
            it('works', async () => {
                await runTest({items: [], initialText: ''}, async (driver) => {
                    await driver.$('header input').enterValue('hey there');
                    assert.equal(await driver.$('header input').value(), 'hey there');
                });
            });
        });

        describe('click()', () => {
            it('works', async () => {
                await runTest({items: [], initialText: ''}, async (driver) => {
                    await driver.$('.todo-app header input').enterValue('bob');
                    await driver.$('.add').click();

                    assert.equal(await driver.$('.count').text(), '1');
                    assert.equal(await driver.$('.label').text(), 'bob');
                });
            });
        });

        describe('hover()', () => {
            it('works', async () => {
					await runTest({items: [itemCreator({label: 'Bob'}), itemCreator({label: 'David'})]}, async (driver) => {
                    const bd = await driver.$$('.todo-item').get(1);
                    await bd.hover();
                    assert.equal(await bd.hasClass('active'), true);
                });
            });
        });

        describe('exists()', () => {

            it('returns true when an element exists', async () => {
                await runTest({items: []}, async (driver) => {
                    assert.equal(await driver.$('.count').exists(), true);
                    assert.equal(await driver.$('.add').exists(), true);
                });
            });

            it('returns false when an element does not exist', async () => {
                await runTest({items: []}, async (driver) => {
                    assert.equal(await driver.$('.tootim').exists(), false);
                    assert.equal(await driver.$('#arnold-schwarzenegger').exists(), false);
                });
			});

			it('rejects the promise with an error when more than 1 element exists', async () => {
				const items = [
					itemCreator({label: 'a'}),
					itemCreator({label: 'b'})
				];
                await runTest({items}, async (driver) => {

					const error = await (driver.$('.todo-item').exists().catch((e: any) => e));
					assert.equal(isMultipleElementsWithLocatorError(error), true);
                });
            });

        });

        describe('hasClass()', () => {
            it('has full class name', async () => {
                await runTest({items: [itemCreator({label: 'Bob'})]}, async (driver) => {
                    assert.equal(await driver.$('.label').hasClass('label'), true);
                });
            });

            it('returns true when there are multiple class names', async () => {
                await runTest({items: [itemCreator({label: 'Bob'}), itemCreator({label: 'David'})]}, async (driver) => {
                    const bd = await driver.$$('.todo-item').get(1);
                    await bd.hover();
                    assert.equal(await bd.hasClass('todo-item'), true);
                    assert.equal(await bd.hasClass('active'), true);
                });
            });

            it('returns false for partial class name', async () => {
                await runTest({items: [itemCreator({label: 'Bob'})]}, async (driver) => {
                    assert.equal(await driver.$('.label').hasClass('lab'), false);
                });
            });

            it('returns false when element has no class attribute', async () => {
                await runTest({items: [itemCreator({label: 'Bob'})]}, async (driver) => {
                    assert.equal(await driver.$('footer').hasClass('whatever'), false);
                });
            });
        });

        describe('getNative()', () => {
            it('returns a native element for advanced usages', async () => {
                await runTest({items: []}, async (driver) => {
                    const native = await driver.getNative();
                    assert.isDefined(native);
                });
            });
        });

        describe('pressKey()', () => {
            it('single key works', async () => {
                await runTest({items: [], initialText: ''}, async (driver) => {
                    await driver.$('.todo-app header input').enterValue('bob');
                    await driver.$('.add').pressKey('Enter');
                    assert.equal(await driver.$('.count').text(), '1');
                    assert.equal(await driver.$('.label').text(), 'bob');
                });
            });
        });

        describe('attr()', () => {
            it('returns null if attr does not exist', async () => {
                const items = [itemCreator({ label: 'Bob', completed: false })];
                await runTest({ items }, async driver => {
                    assert.deepEqual(await driver.$('.todo-item').attr('data-value'), null);
                });
            });

            it('returns attribute value', async () => {
                const items = [
                    itemCreator({ label: 'Bob', completed: false, id: 'bob' })
                ];
                await runTest({ items }, async driver => {
                    assert.deepEqual(await driver.$('.todo-item').attr('data-value'), 'bob');
                });
            });

            it('returns empty string', async () => {
                const items = [
                    itemCreator({ label: 'Bob', completed: false, id: '' })
                ];
                await runTest({ items }, async driver => {
                    assert.deepEqual(await driver.$('.todo-item').attr('data-value'), '');
                });
            });

            it('gets correct attribute [when] $ is deep nested', async () => {
              await runTest({items: [itemCreator({ label: 'Bob' })]}, async (driver) => {

                  const item = await driver.$('.todo-item');
          
                  assert.equal(await item.$('button').hasClass('toggle'), true);
                  assert.equal(await item.$('button').attr('class'), 'toggle');
              });
          });
		    });

        describe('_prop()', () => {
          it('should return placeholder value', async () => {
            await runTest({items: [], initialText: ''}, async (driver) => {
              assert.equal(await driver.$('header input')._prop('placeholder'), 'this is a placeholder');
            });
          });

          it('should return null for undefined prop', async () => {
            await runTest({items: [], initialText: ''}, async (driver) => {
              assert.equal(await driver.$('header input')._prop('dummyProp'), null);
            });
          });

          it('should return true for checked checkbox', async () => {
            await runTest({items: [], initialText: ''}, async (driver) => {
              assert.equal(await driver.$('footer input')._prop('checked'), true);
            });
          });
        })

		it('rejects with the right error on action when an element does not exist given locator', async () => {
			await runTest({items: []}, async (driver) => {
				const err = await (driver.$('.fdgfdgfdg').text().catch((e: any) => e));
				assert.equal(isNoElementWithLocatorError(err), true);
			});
		});

		it('rejects with the right error on action when an more than 1 element exist given locator', async () => {
			const items = [
				itemCreator({label: 'a'}),
				itemCreator({label: 'b'})
			];
			await runTest({items}, async (driver) => {
				const err = await (driver.$('.todo-item').text().catch((e: any) => e));
				assert.equal(isMultipleElementsWithLocatorError(err), true);
			});
		});
    });

    describe('$$', () => {
        describe('get()', () => {
            it('returns single driver in the required position', async () => {
					const items = [itemCreator({label: 'Bob'}), itemCreator({label: 'David'})];
                await runTest({items}, async (driver) => {
                    assert.equal(await driver.$$('.label').get(0).text(), 'Bob');
                    assert.equal(await driver.$$('.label').get(1).text(), 'David');
                });
			});

			it('exists() works properly on elements from `.get`', async () => {
				await runTest({items: []}, async (driver) => {
					assert.equal(await driver.$$('.some-elem-bla-bla').get(0).exists(), false);
					assert.equal(await driver.$$('.add').get(0).exists(), true);
				});
			});
        });

        describe('text()', () => {
            it('returns the text of all given drivers in the list', async () => {
					const items = [itemCreator({label: 'Bob'}), itemCreator({label: 'David'})];
                await runTest({items}, async (driver) => {
                    assert.deepEqual(await driver.$$('.label').text(), ['Bob', 'David']);
                });
            });
        });

        describe('count()', () => {
            it('returns the text of all given drivers in the list', async () => {
					const items = [itemCreator({label: 'Bob'}), itemCreator({label: 'David'}), itemCreator({label: 'Jacob'})];
                await runTest({items}, async (driver) => {
                    assert.deepEqual(await driver.$$('.todo-item').count(), 3);
                });
            });
		});

        describe('map()', () => {
            it('works for text', async () => {
					const items = [itemCreator({label: 'Bob'}), itemCreator({label: 'David'}), itemCreator({label: 'Jacob'})];
                await runTest({items}, async (driver) => {
                    assert.deepEqual(await driver.$$('.todo-item .label').map((bd) => bd.text()), ['Bob', 'David', 'Jacob']);
                });
            });

            it('passes index', async () => {
					const items = [itemCreator({label: 'Bob'}), itemCreator({label: 'David'}), itemCreator({label: 'Jacob'})];
                await runTest({items}, async (driver) => {
                    const idx = await driver.$$('.todo-item').map((_, i) => Promise.resolve(i));
                    assert.deepEqual(idx, [0, 1, 2]);
                });
            });
        });

        describe('filter()', () => {
            it('works', async () => {
					const items = [itemCreator({label: 'Bob', completed: true}), itemCreator({label: 'David'}), itemCreator({label: 'Jacob',completed: true})];
                await runTest({items}, async (driver) => {
                    const completed = await driver.$$('.todo-item').filter((item) => item.$('.completed').exists());
                    assert.deepEqual(await completed.count(), 2);
                });
            });
        });

        describe('scrollIntoView()', () => {
            it('works', async () => {
                const items = Array.from(Array(150).keys()).map(value => itemCreator({label: value.toString()}));
                await runTest({items}, async (driver) => {
                    if (driver.type !== 'react' && driver.type !== 'svelte') {
                        const footer: UniDriver = await driver.$('footer');

                        assert.isNotTrue(await footer.isDisplayed(), 'Footer is displayed :(');
                        await footer.scrollIntoView();
                        assert.isTrue(await footer.isDisplayed(), 'Displayed, unfortunately');
                    }

                    assert.isTrue(true);
                });
            });
        });

	});

	describe('keyboard events', () => {

        getAllNonTextKeyTypes().forEach(async (keyType) => {
            it(`pressKey works for ${keyType}`, async () => {
			await runTest({items: []}, async (driver) => {
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
            await runTest({items: []}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.press();
                assert.include(await driver.$$('.mouse-event-data .event-type').text(), 'mousedown');
            });
        });

        it('with deep nested selector press works', async () => {
            await runTest({items: []}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events').$('button');
                await eventsComp.mouse.moveTo(eventsComp);
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mousemove');
            });
        })

        it('release works', async () => {
            await runTest({items: []}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.release();
                assert.include(await driver.$$('.mouse-event-data .event-type').text(), 'mouseup');
            });
        });

        it('with deep nested selector release works', async () => {
            await runTest({items: []}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events').$('button');
                await eventsComp.mouse.moveTo(eventsComp);
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mouseup');
            });
        })

        it('move works', async () => {
            await runTest({items: []}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events button');
                await eventsComp.mouse.moveTo(eventsComp);
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mousemove');
            });
        });

        it('with deep nested selector move works', async () => {
            await runTest({items: []}, async (driver) => {
                const eventsComp = await driver.$('.mouse-events').$('button');
                await eventsComp.mouse.moveTo(eventsComp);
                assert.equal(await driver.$('.mouse-event-data .event-type').text(), 'mousemove');
            });
        })
    });
};
