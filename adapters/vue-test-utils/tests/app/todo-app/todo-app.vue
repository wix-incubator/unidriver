<template>
  <div class="todo-app">
    <header>
      <label>
        <input
          v-model="newItem"
          type="text"
          :readonly="inputReadOnly"
          :disabled="inputDisabled"
          placeholder="this is a placeholder"
          @keydown="onKeyDown"
        >
      </label>
      <button
        type="button"
        class="add"
        @click="onAdd"
        @keydown="onKeyDown"
      >
        Add
      </button>
    </header>
    <main>
      <Item
        v-for="(item, idx) in localItems"
        :key="idx"
        :item="item"
        :is-active="idx === activeItem"
        @focus="onFocus(idx)"
        @blur="onBlur()"
        @toggle="onToggle(idx)"
      />
    </main>
    <footer>
      <label>
        <input
          type="checkbox"
          checked
        >
      </label>
      Mark all as completed<br>
      Items count:
      <span class="count">{{ localItems.length }}</span>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import Item from './Item.vue';
import { TodoItem } from '@unidriver/test-suite/src/types';

export default defineComponent({
  name: 'TodoApp',

  components: {
    Item,
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

  data() {
    return {
      newItem: this.initialText,
      localItems: this.items || [],
      activeItem: -1,
    };
  },

  methods: {
    onAdd() {
      this.localItems = [...this.localItems, { label: this.newItem, completed: false }];
      this.newItem = '';
    },

    onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        this.onAdd();
      }
    },

    onFocus(index: number) {
      this.activeItem = index;
    },

    onBlur() {
      this.activeItem = -1;
    },

    onToggle(index: number) {
      const newItems = this.items.map((item, i) => i === index ? { ...item, completed: !item.completed } : item);
      this.localItems = newItems;
    },
  },
});

</script>
