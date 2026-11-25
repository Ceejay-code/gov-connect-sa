<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "~/utils/cn";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const labelClass = computed(() =>
  cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    attrs.class as string,
  ),
);

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <label :class="labelClass" v-bind="forwardedAttrs">
    <slot />
  </label>
</template>
