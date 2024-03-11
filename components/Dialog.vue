<script setup lang="ts">
import useMousePosition, { getPagePos, type MouseTouchEvent } from "~/composables/useMousePosition";

const open = defineModel<boolean>("open", { default: true });

const dims = ref({
  w: Math.min((window?.innerWidth || 1000) * 0.75, 900),
  h: Math.min((window?.innerHeight || 1000) * 0.75, 900),
});
const dragging = ref(false);

const resizing = ref(0);
const TOP = 1;
const RIGHT = 1 << 1;
const BOTTOM = 1 << 2;
const LEFT = 1 << 3;
const MIN_DIM = 240;

const cursor = useMousePosition();
const offset = ref({ x: 0, y: 0 });
const pos = ref({
  x: ((window?.innerWidth || 0) - dims.value.w) / 2,
  y: ((window?.innerHeight || 0) - dims.value.h) / 2,
});

watchEffect(() => {
  if (dragging.value) {
    pos.value = { x: cursor.value.x - offset.value.x, y: cursor.value.y - offset.value.y };
  }

  if (resizing.value & (LEFT | RIGHT)) {
    let change = cursor.value.x - offset.value.x;
    change = resizing.value & RIGHT ? change : -change;
    if (!(change < 0 && dims.value.w + change < MIN_DIM)) {
      dims.value.w += change;
      pos.value.x += resizing.value & LEFT ? -change : 0;
      offset.value.x = cursor.value.x;
    }
  }

  if (resizing.value & (TOP | BOTTOM)) {
    let change = cursor.value.y - offset.value.y;
    change = resizing.value & BOTTOM ? change : -change;
    if (!(change < 0 && dims.value.h + change < MIN_DIM)) {
      dims.value.h += change;
      pos.value.y += resizing.value & TOP ? -change : 0;
      offset.value.y = cursor.value.y;
    }
  }
});

function clickOn(e: MouseTouchEvent) {
  if (!( e.currentTarget instanceof HTMLElement && e.target instanceof HTMLElement )) {
    return;
  }
  if ("dialogDrag" in e.target.dataset) {
    return dragOn(e, e.currentTarget);
  }
  if ("resize" in e.target.dataset) {
    return resize(e, e.currentTarget, e.target);
  }
}

function clickOff() {
  dragging.value = false;
  resizing.value = 0;
}

function dragOn(e: MouseTouchEvent, dialog: HTMLElement) {
  const { clientX, clientY } = getPagePos(e);
  offset.value = { x: clientX - dialog.offsetLeft, y: clientY - dialog.offsetTop };
  dragging.value = true;
}

function resize(e: MouseTouchEvent, dialog: HTMLElement, el: HTMLElement) {
  dims.value = { w: dialog.offsetWidth, h: dialog.offsetHeight };
  const { resize: r = "" } = el.dataset;
  let screenX = cursor.value.x;
  let screenY = cursor.value.y;
  if (window.TouchEvent && e instanceof TouchEvent) {
    const t = getPagePos(e);
    screenX = t.screenX;
    screenY = t.screenY;
  }

  let firstCondition = r.endsWith("right");
  if (firstCondition || r.endsWith("left")) {
    offset.value.x = screenX;
    resizing.value |= firstCondition ? RIGHT : LEFT;
  }

  firstCondition = r.startsWith("top");
  if (firstCondition || r.startsWith("bottom")) {
    offset.value.y = screenY;
    resizing.value |= firstCondition ? TOP : BOTTOM;
  }
}
</script>

<template>
  <Teleport
    v-if="open"
    to="[data-layer=dialog]"
  >
    <div
      :class="[$style.dialog, 'grid', 'box', 'no-overflow', 'no-padding']"
      :style="{
        '--x': `${pos.x}px`,
        '--y': `${pos.y}px`,
        '--w': `${dims.w}px`,
        '--h': `${dims.h}px`,
      }"
      tabindex="0"
      @mousedown.left="clickOn"
      @touchstart="clickOn"
      @mouseup="clickOff"
      @touchend="clickOff"
    >
      <header
        :class="['box-bg1', 'center-text', 'no-select', { [$style.dragging]: dragging }]"
        data-dialog-drag
      >
        <h1>󰇜</h1>
      </header>
      <section
        :class="['box', { 'no-select': resizing }]"
        v-bind="$attrs"
      >
        <slot />
      </section>
      <div data-resize="top" />
      <div data-resize="right" />
      <div data-resize="bottom" />
      <div data-resize="left" />
      <div data-resize="top-left" />
      <div data-resize="top-right" />
      <div data-resize="bottom-right" />
      <div data-resize="bottom-left" />
    </div>
  </Teleport>
</template>

<style module lang="scss">
.dialog {
  top: var(--y);
  left: var(--x);
  width: var(--w);
  height: var(--h);
  margin: 0;
  border: 0.5px solid;
  gap: 0;
  grid-template-rows: auto 1fr;
  min-width: 240px;
  min-height: 240px;
  --resize-area: 10px;

  &:focus {
    z-index: 1;
  }

  &, [data-resize] {
    position: absolute;
  }

  [data-resize], header {
    touch-action: none;
  }

  [data-resize=top], [data-resize=bottom] {
    left: 0;
    height: var(--resize-area);
    width: 100%;
    cursor: ns-resize;
  }

  [data-resize=left], [data-resize=right] {
    top: 0;
    width: var(--resize-area);
    height: 100%;
    cursor: ew-resize;
  }

  [data-resize=top], [data-resize=top-right], [data-resize=top-left] {
    top: 0;
  }

  [data-resize=right], [data-resize=top-right], [data-resize=bottom-right] {
    right: 0;
  }

  [data-resize=bottom], [data-resize=bottom-right], [data-resize=bottom-left] {
    bottom: 0;
  }

  [data-resize=left], [data-resize=top-left], [data-resize=bottom-left] {
    left: 0;
  }

  [data-resize=top-right] {
    cursor: ne-resize;
  }

  [data-resize=top-left] {
    cursor: nw-resize;
  }

  [data-resize=bottom-right] {
    cursor: se-resize;
  }

  [data-resize=bottom-left] {
    cursor: sw-resize;
  }

  [data-resize=top-right], [data-resize=top-left], [data-resize=bottom-right], [data-resize=bottom-left] {
    width: var(--resize-area);
    height: var(--resize-area);
  }

  header {
    cursor: grab;

    & * {
      pointer-events: none;
      line-height: 0.75;
    }

    &.dragging {
      cursor: grabbing;
    }
  }

  section {
    overflow: hidden auto;
  }
}
</style>
