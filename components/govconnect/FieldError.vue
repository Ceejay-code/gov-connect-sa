<script setup lang="ts">
defineProps<{
  id: string;
  message?: string;
}>();
</script>

<template>
  <p v-if="message" :id="id" class="mt-2 text-sm text-destructive">
    {{ message }}
  </p>
</template>
