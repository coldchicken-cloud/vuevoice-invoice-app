<template>
  <div class="spinner-overlay">
    <span class="spinner-ring"></span>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.spinner-overlay {
  top: 0;
  left: 0;
  z-index: 101;
  height: 100%;
  width: 100%;
  background-color: var(--color-overlay);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;

  @keyframes spin {
    to {
      transform: rotateZ(360deg);
    }
  }

  .spinner-ring {
    display: block;
    width: 60px;
    height: 60px;
    margin: 0 auto;
    border: 3px solid transparent;
    border-top-color: #fff;
    border-bottom-color: #fff;
    border-radius: 50%;
    animation: spin ease 1000ms infinite;
  }
}
</style>
