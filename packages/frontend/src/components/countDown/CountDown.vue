<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { expiresAfter } from "instant";

const props = defineProps<{ createdAt?: number; interval?: number }>();

const expiresAt = computed(() => {
  return (props.createdAt || Date.now()) + expiresAfter;
});

const countdown = ref(expiresAt.value - Date.now());

const { pause, resume } = useIntervalFn(
  () => {
    countdown.value = expiresAt.value - Date.now();
  },
  () => props.interval || 1000,
  { immediate: !!props.createdAt }
);

watch(expiresAt, () => {
  if (props.createdAt) {
    resume();
  }
});

watch(countdown, (value) => {
  if (value < -1000 * 5) {
    pause();
  }
});

const text = computed(() => {
  if (!props.createdAt) {
    return ``;
  }
  if (countdown.value > 0) {
    return (countdown.value / 1000).toFixed(3);
  }
  if (countdown.value >= -1000 * 5) {
    return "now...";
  }
  return "server is late";
});
</script>

<template>
  <div class="tabular-nums font-extralight">{{ text }}</div>
</template>
