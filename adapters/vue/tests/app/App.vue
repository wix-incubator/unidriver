<template>
  <div>
    <TodoApp :items="items" :initialText="initialText" :inputReadOnly="inputReadOnly" :inputDisabled="inputDisabled" />
    <Events />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import TodoApp from './todo-app/todo-app.vue';
import Events from './events/events.vue';
import { TodoItem } from '@unidriver/test-suite/src/types';

export default defineComponent({
  name: 'App',
  components: {
    TodoApp,
    Events,
  },
  props: {
    inputReadOnly: {
      type: Boolean,
      default: false,
    },
    inputDisabled: {
      type: Boolean,
      default: false,
    },
    initialText: {
      type: String,
      default: '',
    },
    items: {
      type: Array as PropType<TodoItem[]>,
      default: () => [],
    },
  },
});
</script>
