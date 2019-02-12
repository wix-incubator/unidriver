import {keyDefinitions, PuppeteerEventDefinition} from './puppeteer-us-keyboard-layout';
import {KeyType} from './key-types';

const nonTextKeyTypes: KeyType[] = [
    'Cancel', 'Help', 'Backspace', 'Tab', 'Clear', 'Enter', 'Pause', 'Escape', 'Space', 'PageUp', 'PageDown', 'End', 'Home',
    'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Insert', 'Delete', 'Semicolon',
    'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Shift', 'Control', 'Alt', 'Meta'
];

export type KeyType = keyof typeof keyDefinitions;

const normalizeEventData = ({key, keyCode}: PuppeteerEventDefinition) => ({ key, keyCode });

export const getDefinitionForKeyType = (keyType: KeyType) => normalizeEventData(keyDefinitions[keyType] as PuppeteerEventDefinition);

export const getAllNonTextKeyTypes = () => (Object.keys(keyDefinitions) as KeyType[]).filter(keyType => nonTextKeyTypes.includes(keyType)) as KeyType[];
