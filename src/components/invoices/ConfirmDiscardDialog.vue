<template>
  <div class="modal flex">
    <div class="modal-content">
      <p>Are you sure you want to exit? Your changes will not be saved.</p>
      <div class="actions flex">
        <button type="button" class="purple" @click="keepEditing">Return</button>
        <button type="button" class="red" @click="discardAndClose">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';

const store = useStore();

function keepEditing() {
  store.commit('ui/SET_DISCARD_CONFIRM_OPEN', false);
}

function discardAndClose() {
  store.commit('ui/SET_DISCARD_CONFIRM_OPEN', false);
  store.commit('ui/SET_INVOICE_EDITOR_OPEN', false);
  store.commit('ui/SET_EDITING_INVOICE_DOC_ID', null);
}
</script>

<style lang="scss" scoped>
.modal {
  z-index: 200;
  position: fixed;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: var(--color-overlay);
  backdrop-filter: blur(3px);

  .modal-content {
    border-radius: 16px;
    padding: 48px 32px;
    max-width: 450px;
    background-color: var(--color-surface-alt);
    color: var(--color-text);
    box-shadow: var(--shadow-panel);
    animation: fade-rise-in 0.35s var(--ease-premium) both;

    p {
      text-align: center;
    }

    .actions {
      margin-top: 24px;
      button {
        flex: 1;
      }
    }
  }
}
</style>
