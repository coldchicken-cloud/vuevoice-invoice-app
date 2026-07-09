import { onBeforeUnmount, onMounted, ref } from 'vue';

const MOBILE_BREAKPOINT_PX = 750;

/**
 * Tracks whether the viewport is currently narrower than the app's
 * supported breakpoint. Vuevoice's editing experience needs real screen
 * space, so narrow viewports get a friendly message instead of a broken
 * layout.
 */
export function useResponsiveScreen() {
  const isBelowSupportedWidth = ref(window.innerWidth <= MOBILE_BREAKPOINT_PX);

  function handleResize() {
    isBelowSupportedWidth.value = window.innerWidth <= MOBILE_BREAKPOINT_PX;
  }

  onMounted(() => window.addEventListener('resize', handleResize));
  onBeforeUnmount(() => window.removeEventListener('resize', handleResize));

  return { isBelowSupportedWidth };
}
