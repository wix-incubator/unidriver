import * as React from 'react';
import { Button, View, TextInput, ScrollView } from 'react-native';
import { create as render } from 'react-test-renderer';
import { reactNativeUniDriver } from '.';
import * as sinon from 'sinon';
import { assert } from 'chai';

const spy = sinon.spy;

const mockOnPress = spy();
const mockOnChange = spy();
const mockOnScroll = spy();
const mockOnFocus = spy();


const renderApp = () => {
  const Comp = () => {
    return (
      <View>
        <Button testID="button" title="Hello" onPress={mockOnPress} />
        <TextInput testID="input" onFocus={mockOnFocus} onTouchStart={mockOnPress} onChangeText={mockOnChange} />
        <ScrollView testID="scroll" onScroll={mockOnScroll} />
      </View>
    );
  }
  return render(<Comp />).root;
}

const renderAppAndCreateDriver = () => {
  const component = renderApp();
  const driver = reactNativeUniDriver(component);
  return driver;
};

describe('React Native Driver', () => {
  it('Presses', async () => {
    const driver = renderAppAndCreateDriver();
    await driver.$('button').press();

    assert(mockOnPress.called);
  });

  it('Types', async () => {
    const driver = renderAppAndCreateDriver();
    const input = driver.$('input');
    
    await input.press()
    await input.enterValue('value');

    assert(mockOnPress.called);
    assert(mockOnFocus.called);
    assert(mockOnChange.calledWith('value'));
  });

  it('Scrolls', async () => {
    const driver = renderAppAndCreateDriver();
    await driver.$('scroll').scroll();

    assert(mockOnScroll.called);
  });
});
