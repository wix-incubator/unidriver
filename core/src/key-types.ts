import {keyDefinitions, PuppeteerEventDefinition} from './puppeteer-us-keyboard-layout';

export type KeyDefinitionType = keyof typeof keyDefinitions;

const nonTextKeyTypes: KeyDefinitionType[] = [
    'Backspace', 'Tab', 'Enter', 'Pause', 'Escape', 'PageUp', 'PageDown', 'End', 'Home',
    'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Insert', 'Delete', 'Semicolon', 'Space',
    // 'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Shift', 'Control', 'Alt', 'Meta'
];

const normalizeEventData = ({key, keyCode}: PuppeteerEventDefinition) => ({ key, keyCode });

export const getDefinitionForKeyType = (keyType: KeyDefinitionType) => normalizeEventData(keyDefinitions[keyType] as PuppeteerEventDefinition);

export const getAllNonTextKeyTypes = () => (Object.keys(keyDefinitions) as KeyDefinitionType[]).filter(keyType => nonTextKeyTypes.includes(keyType)) as KeyDefinitionType[];
