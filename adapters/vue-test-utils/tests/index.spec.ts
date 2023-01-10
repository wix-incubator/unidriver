import { mount } from '@vue/test-utils';
import App from './app/App.vue';
import { SetupFn, runTestSuite } from '@unidriver/test-suite';

import { vueTestUtilsUniDriver } from '../src';

const setup: SetupFn = async (props: any) => {
  const wrapper = mount(App, { propsData: props });
  const driver = vueTestUtilsUniDriver(wrapper);

  const tearDown = async () => {};

  return { driver, tearDown };
};

describe('Vue base driver - test suite', () => {
  runTestSuite({
    setup,
  });
});
