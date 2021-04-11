import App from './App.svelte';

export const renderSvelteApp = (element, params = {}) => {
  const app = new App({
    target: element,
    props: {
      initialItems: params.items,
      initialText: params.initialText,
      inputDisabled: params.inputDisabled,
      inputReadOnly: params.inputReadOnly,
    },
  });

  return () => app.$destroy();
};
