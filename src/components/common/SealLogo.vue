<template>
  <svg
    class="seal-logo"
    :class="{ 'seal-logo--animated': animated }"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e4c88a" />
        <stop offset="100%" stop-color="#a9824b" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" :fill="`url(#${gradientId})`" />
    <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
    <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-dasharray="2 3" />
    <text x="32" y="42" text-anchor="middle" font-family="Fraunces, serif" font-weight="600" font-size="28" fill="#1b1408">
      V
    </text>
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 32,
  },
  animated: {
    type: Boolean,
    default: false,
  },
});

// Unique id so multiple logos on one page don't collide on the same
// <linearGradient> reference.
const gradientId = `seal-gradient-${Math.random().toString(36).slice(2, 9)}`;
</script>

<style scoped>
.seal-logo--animated {
  animation: seal-in 0.6s var(--ease-premium) both;
}
</style>
