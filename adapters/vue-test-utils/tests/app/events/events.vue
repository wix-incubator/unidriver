<template>
  <div class="events-container">
    <div class="mouse-events">
      <button
        :style="{
          height: 100,
          width: 100,
        }"
        @mousemove="onMouseEvent"
        @mousedown="onMouseEvent"
        @mouseleave="onMouseEvent"
        @mouseup="onMouseEvent"
      >
        Mouse Events
      </button>
      <div>
        <div
          v-for="(event, idx) in mouseEvents"
          :key="idx"
          class="mouse-event-data"
        >
          <pre class="event-type">{{ event.type }}</pre>
        </div>
      </div>
    </div>
    <div class="keyboard-events">
      <input @keydown="onKeyboardEvent" value="" />
      <div>
        <div
          v-for="(event, idx) in keyboardEvents"
          :key="idx"
          class="keyboard-event-data"
        >
          <span class="event-key" :style="{ whiteSpace: 'pre' }">{{
            event.key === 'OS' ? 'Meta' : event.key
          }}</span>
          <span class="event-keycode">{{ event.keyCode }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

const normalizeKeyName = (key: string) => {
  const keyMap = {
    Up: 'ArrowUp',
    Left: 'ArrowLeft',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Esc: 'Escape',
  } as Record<string, string>;

  return keyMap[key] || key;
};

export default defineComponent({
  name: 'EventsApp',

  data() {
    return {
      mouseEvents: [] as any[],
      keyboardEvents: [] as any[],
    };
  },

  methods: {
    onMouseEvent(event: MouseEvent) {
      const eventObj = {
        ...event,
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
      };
      this.mouseEvents = [...this.mouseEvents, eventObj];
    },

    onKeyboardEvent(event: KeyboardEvent) {
      const eventObj = {
        ...event,
        type: event.type,
        key: normalizeKeyName(event.key),
        keyCode: event.keyCode,
      };
      this.keyboardEvents = [...this.keyboardEvents, eventObj];
    },
  },
});
</script>
