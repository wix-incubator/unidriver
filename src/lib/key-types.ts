/**
 * Representations of pressable keys that aren't text.  These are stored in
 * the Unicode PUA (Private Use Area) code points, 0xE000-0xF8FF.  Refer to
 * http://www.google.com.au/search?&q=unicode+pua&btnG=Search
 *
 * @enum {string}
 */
export enum Key {
  CANCEL = 'CANCEL',
  HELP = 'HELP',
  BACKSPACE = 'BACKSPACE',
  TAB = 'TAB',
  CLEAR = 'CLEAR',
  ENTER = 'ENTER',
  PAUSE = 'PAUSE',
  ESCAPE = 'ESCAPE',
  SPACE = 'SPACE',
  PAGE_UP = 'PAGE_UP',
  PAGE_DOWN = 'PAGE_DOWN',
  END = 'END',
  HOME = 'HOME',
  ARROW_LEFT = 'ARROW_LEFT',
  ARROW_UP = 'ARROW_UP',
  ARROW_RIGHT = 'ARROW_RIGHT',
  ARROW_DOWN = 'ARROW_DOWN',
  INSERT = 'INSERT',
  DELETE = 'DELETE',
  SEMICOLON = 'SEMICOLON',
  EQUALS = 'EQUALS',
  NUMPAD0 = 'NUMPAD0', // number pad keys
  NUMPAD1 = 'NUMPAD1',
  NUMPAD2 = 'NUMPAD2',
  NUMPAD3 = 'NUMPAD3',
  NUMPAD4 = 'NUMPAD4',
  NUMPAD5 = 'NUMPAD5',
  NUMPAD6 = 'NUMPAD6',
  NUMPAD7 = 'NUMPAD7',
  NUMPAD8 = 'NUMPAD8',
  NUMPAD9 = 'NUMPAD9',
  MULTIPLY = 'MULTIPLY',
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  DECIMAL = 'DECIMAL',
  DIVIDE = 'DIVIDE',
  F1 = 'F1', // function keys
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  SHIFT = 'SHIFT', // Modifier Keys
  CONTROL = 'CONTROL',
  ALT = 'ALT',
  META = 'META' // alias for Windows/Command key
}

const snakeCaseToCamelCase = (key: string) => {
  const camleCaseStr = key
    .toLocaleLowerCase()
    .replace(/(_\w)/g, m => m[1].toUpperCase());
  return camleCaseStr.charAt(0).toUpperCase() + camleCaseStr.slice(1);
};

interface KeyMapping {
  [key: string]: string;
}

const keyMapping: KeyMapping = {
  Space: ' ',
  Semicolon: ';',
  Equals: '=',
  Numpad0: 'Insert',
  Numpad1: 'End',
  Numpad2: 'ArrowDown',
  Numpad3: 'PageDown',
  Numpad4: 'ArrowLeft',
  Numpad5: 'Clear',
  Numpad6: 'ArrowRight',
  Numpad7: 'Home',
  Numpad8: 'ArrowUp',
  Numpad9: 'PageUp',
  Multiply: '*',
  Add: '+',
  Subtract: '-',
  Decimal: '\u0000',
  Divide: '/',
  Backspace: 'Backspace'
};

export const getModifiedKey = (key: string | Key) => {
  const camelCaseStr = snakeCaseToCamelCase(key);
  if (Key[key as keyof typeof Key]) {
    // special key
    if (camelCaseStr in keyMapping) {
      // needs mapping
      return keyMapping[camelCaseStr];
    }
    return camelCaseStr;
  }
  return key;
};
