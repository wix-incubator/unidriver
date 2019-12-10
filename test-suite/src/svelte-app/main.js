import { renderSvelteApp } from './renderSvelteApp';

const appProps = {
  initialText: '123',
  initialItems: [{ id: 1, label: 'qwe', completed: true }],
};

renderSvelteApp(document.body, appProps);
