<script setup lang="ts">
withDefaults(defineProps<{
  tag: keyof HTMLElementTagNameMap,
  editing?: boolean,
}>(), { editing: false });
const model = defineModel<string | null | number>();

function updateModel(e: InputEvent) {
  const modelType = typeof model.value;
  const target = e.target as HTMLElement;
  if (modelType === "number") {
    model.value = Number(target.innerText);
  } else {
    model.value = target.innerText;
  }
}
</script>

<template>
  <component
    :is="tag"
    v-bind="$attrs"
    :class="[$style.editable, { [$style.editing]: editing }]"
    :contenteditable="editing"
    @blur="updateModel"
  >
    {{ model }}
  </component>
</template>

<style module lang="scss">
.editable {
  white-space: pre;

  &.editing {
    outline: 2px dashed currentColor;
    cursor: text;
  }
}
</style>
