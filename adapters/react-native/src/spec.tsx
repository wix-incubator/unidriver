import * as React from 'react';
import { Button, View, TextInput, ScrollView } from 'react-native';
import { create as render } from 'react-test-renderer';
import { reactNativeUniDriver } from '.';

const mockOnPress = jest.fn();
const mockOnChange = jest.fn();
const mockOnScroll = jest.fn();
const mockOnFocus = jest.fn();


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

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('Types', async () => {
    const driver = renderAppAndCreateDriver();
    const input = driver.$('input');
    
    await input.press()
    await input.enterValue('value');

    expect(mockOnPress).toHaveBeenCalled();
    expect(mockOnFocus).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('value');
  });

  it('Scrolls', async () => {
    const driver = renderAppAndCreateDriver();
    await driver.$('scroll').scroll();

    expect(mockOnScroll).toHaveBeenCalled();
  });
});
