import { onBeforeUnmount, ref, watch } from 'vue';

/**
 * Animates a ref's displayed value from its previous number to a new one
 * whenever the source changes, instead of just snapping to the new total.
 * Respects prefers-reduced-motion by jumping straight to the end value.
 *
 * @param {import('vue').Ref<number>} sourceRef
 * @param {number} durationMs
 */
export function useCountUp(sourceRef, durationMs = 700) {
  const displayValue = ref(sourceRef.value || 0);
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  let animationFrameId = null;

  function animateTo(targetValue) {
    if (prefersReducedMotion) {
      displayValue.value = targetValue;
      return;
    }

    const startValue = displayValue.value;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out-cubic
      displayValue.value = startValue + (targetValue - startValue) * eased;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        displayValue.value = targetValue;
      }
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(step);
  }

  watch(sourceRef, (newValue) => animateTo(Number(newValue) || 0));

  onBeforeUnmount(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  });

  return { displayValue };
}
