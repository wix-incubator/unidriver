<template>
  <div
    class="todo-item"
    :class="{ active: isActive, done: item.completed }"
    :data-value="item.id"
    :style="style"
    @mouseleave="onBlur"
    @mouseover="onFocus"
    @focus="onFocus"
    @blur="onBlur"
  >
    <label>
      <input
        type="checkbox"
        :checked="item.completed"
      >
    </label>
    <span class="label">{{ item.label }}</span>
    <span
      v-if="item.completed"
      class="completed"
    >
      Completed!
    </span>
    <button
      class="toggle"
      @click="onToggle"
    >
      Toggle
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';

type TodoItem = {
  label: string;
  completed: boolean;
  id?: string;
};

export default defineComponent({
  name: 'TodoItem',

  props: {
    item: {
      type: Object as PropType<TodoItem>,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    style() {
      return {
        backgroundColor: this.isActive ? 'red' : 'transparent',
      };
    },
  },

  methods: {
    onFocus() {
      this.$emit('focus');
    },

    onBlur() {
      this.$emit('blur');
    },

    onToggle() {
      this.$emit('toggle');
    },
  },
});

</script>
