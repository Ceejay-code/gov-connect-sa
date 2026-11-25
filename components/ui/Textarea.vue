<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "~/utils/cn";

defineOptions({ inheritAttrs: false });

const model = defineModel<string>({ default: "" });

const attrs = useAttrs();

const textareaClass = computed(() =>
  cn(
    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    attrs.class as string,
  ),
);

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <textarea v-model="model" :class="textareaClass" v-bind="forwardedAttrs" />
</template>
