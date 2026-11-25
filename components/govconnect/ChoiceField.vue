<script setup lang="ts">
export interface ChoiceOption {
  label: string;
  value: string;
}

const props = defineProps<{
  name: string;
  label: string;
  modelValue: string;
  options: ChoiceOption[];
  error?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const errorId = computed(() => `${props.name}-error`);
</script>

<template>
  <fieldset :aria-describedby="error ? errorId : undefined" :aria-invalid="Boolean(error)">
    <legend class="text-sm font-semibold text-foreground">{{ label }}</legend>
    <div class="mt-3 flex flex-wrap gap-2">
      <div v-for="option in options" :key="option.value">
        <input
          :id="`${name}-${option.value}`"
          class="peer sr-only"
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="emit('update:modelValue', option.value)"
        />
        <label
          :for="`${name}-${option.value}`"
          class="inline-flex min-w-20 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-civic-green-deep peer-checked:border-civic-green-deep peer-checked:bg-civic-soft peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
        >
          {{ option.label }}
        </label>
      </div>
    </div>
    <FieldError :id="errorId" :message="error" />
  </fieldset>
</template>
