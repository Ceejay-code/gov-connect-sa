<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const isNotFound = computed(() => props.error?.statusCode === 404);

function handleGoHome() {
  clearError({ redirect: "/" });
}

function handleRetry() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <div v-if="isNotFound" class="max-w-md text-center">
      <h1 class="text-7xl font-bold text-foreground">404</h1>
      <h2 class="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="mt-6">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          @click.prevent="handleGoHome"
        >
          Go home
        </NuxtLink>
      </div>
    </div>

    <div v-else class="max-w-md text-center">
      <h1 class="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Something went wrong on our end. You can try refreshing or head back home.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          @click="handleRetry"
        >
          Try again
        </button>
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          @click.prevent="handleGoHome"
        >
          Go home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
