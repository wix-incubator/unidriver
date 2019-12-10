import App from './App.svelte';

export const renderSvelteApp = (element, params) => {
  const app = new App({
    target: element,
    props: params,
  });

  return () => app.$destroy();
};
