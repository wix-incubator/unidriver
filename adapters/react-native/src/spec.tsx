import * as React from 'react';
import { Button, View, TextInput, ScrollView, TouchableOpacity, Text } from 'react-native';
import { create as render, act, ReactTestRenderer } from 'react-test-renderer';
import { reactNativeUniDriver } from '.';
import * as sinon from 'sinon';
import { assert } from 'chai';

const spy = sinon.spy;

const mockOnPress = spy();
const mockOnChange = spy();
const mockOnScroll = spy();
const mockOnFocus = spy();
const mockLongPress = spy();


const renderApp = async () => {
  const Comp = () => {
    const [value, setValue] = React.useState('Value');

    React.useEffect(() => {
      Promise.resolve().then(() => setValue('Value'));
    }, []);

    return (
      <View>
        <Button testID='button' title='Hello' onPress={mockOnPress} />
        <TextInput value='Value' testID='input' onFocus={mockOnFocus} onTouchStart={mockOnPress} onChangeText={mockOnChange} />
        <TextInput value={value} testID='editable' onChangeText={(text) => setValue(text)} />
        <ScrollView
          testID='scroll'
          onMomentumScrollBegin={mockOnScroll}
          onMomentumScrollEnd={mockOnScroll}
          onScrollBeginDrag={mockOnScroll}
          onScrollEndDrag={mockOnScroll}
          onScroll={mockOnScroll}
        />
        <TouchableOpacity testID='opacity' onLongPress={mockLongPress}>
          <Text>Hello</Text>
          <Text>There</Text>
        </TouchableOpacity>
        <View testID='view' />
        <View testID='view' />
      </View>
    );
  }
  let component: ReactTestRenderer;
  await act(async () => {
    component = render(<Comp />);
  });
  return component!.root;
}

const renderAppAndCreateDriver = async () => {
  const component = await renderApp();
  const driver = reactNativeUniDriver(component);
  return driver;
};

describe('React Native Driver', () => {

  describe('$', () => {
    it('retrives a single element', async () => {
      const driver = await renderAppAndCreateDriver();
      const element = driver.$('button');

      assert.isTrue(await element.exists());
    });
  });

  describe('$$', () => {
    it('retrieves multiple elements', async () => {
      const driver = await renderAppAndCreateDriver();
      const numberOfElements = await driver.$$('view').count();

      assert.equal(numberOfElements, 2);
    });
  });

  describe('press', () => {
    it('triggers onPress event', async () => {
      const driver = await renderAppAndCreateDriver();
      await driver.$('button').press();
  
      assert(mockOnPress.called);
    });
  });

  describe('longPress', () => {
    it('triggers lonPress event', async () => {
      const driver = await renderAppAndCreateDriver();
      await driver.$('opacity').longPress();

      assert(mockLongPress.called);
    });
  });

  describe('text', () => {
    it('retrieves text value', async () => {
      const driver = await renderAppAndCreateDriver();
      const textValue = await driver.$('opacity').text();
  
      assert.equal(textValue, 'Hello There');
    });
  });


  describe('enterValue', () => {
    it('triggers onChangeText event', async () => {
      const driver = await renderAppAndCreateDriver();
      const input = driver.$('input');
      
      await input.press();
      await input.enterValue('value');
  
      assert(mockOnPress.called);
      assert(mockOnFocus.called);
      assert(mockOnChange.calledWith('value'));
    });

    it('works with controlled input', async () => {
      const driver = await renderAppAndCreateDriver();
      const input = driver.$('editable');
  
      assert.equal(await input.value(), 'Value');
  
      await input.enterValue('newValue');
  
      assert.equal(await input.value(), 'newValue');
    });
  });

  describe('scroll', () => {
    it('triggers onScroll event', async () => {
      const driver = await renderAppAndCreateDriver();
      await driver.$('scroll').scroll();
  
      assert.equal(mockOnScroll.getCalls().length, 5);
    });
  });
});
