<template>
  <header class="side-nav flex">
    <router-link :to="{ name: 'InvoiceList' }" class="branding nav-link flex">
      <SealLogo :size="34" />
    </router-link>

    <nav class="primary-links flex flex-column">
      <router-link :to="{ name: 'InvoiceList' }" class="nav-link link-item" :class="{ active: route.name === 'InvoiceList' }">
        Invoices
      </router-link>
      <router-link :to="{ name: 'Dashboard' }" class="nav-link link-item" :class="{ active: route.name === 'Dashboard' }">
        Dashboard
      </router-link>
      <router-link :to="{ name: 'Clients' }" class="nav-link link-item" :class="{ active: route.name === 'Clients' }">
        Clients
      </router-link>
    </nav>

    <div class="side-nav-footer flex">
      <button
        type="button"
        class="icon-button"
        :aria-label="isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'"
        @click="toggleTheme"
      >
        <transition name="icon-swap" mode="out-in">
          <img :key="isLightTheme" :src="isLightTheme ? sunIcon : moonIcon" alt="" />
        </transition>
      </button>
      <button type="button" class="icon-button" aria-label="Log out" @click="handleLogout">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path
            d="M7 2H4a2 2 0 00-2 2v12a2 2 0 002 2h3M13 14l4-4-4-4M17 10H7"
            stroke="#7E88C3"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import moonIcon from '@/assets/icons/icon-moon.svg';
import sunIcon from '@/assets/icons/icon-sun.svg';
import SealLogo from '@/components/common/SealLogo.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const isLightTheme = computed(() => store.getters['ui/isLightTheme']);

function toggleTheme() {
  store.dispatch('ui/toggleTheme');
}

async function handleLogout() {
  await store.dispatch('auth/logout');
  router.push({ name: 'Login' });
}
</script>

<style lang="scss" scoped>
.side-nav {
  position: relative;
  z-index: 99;
  flex-direction: row;
  align-items: center;
  background-color: var(--color-surface);
  justify-content: space-between;

  @media (min-width: 900px) {
    min-height: 100%;
    min-width: 90px;
    flex-direction: column;
    justify-content: flex-start;
    border-radius: 0 20px 20px 0;
  }

  .branding {
    border-radius: 0 20px 20px 0;
    background: linear-gradient(135deg, var(--color-surface-alt), var(--color-page-bg));
    justify-content: center;
    align-items: center;
    padding: 22px;
    transition: filter 0.2s ease;

    @media (min-width: 900px) {
      width: 100%;
    }

    &:hover {
      filter: brightness(1.15);
    }
  }

  .primary-links {
    display: none;

    @media (min-width: 900px) {
      display: flex;
      margin-top: 32px;
      gap: 24px;
      flex: 1;
      align-items: center;
    }

    .link-item {
      writing-mode: vertical-rl;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--color-text-muted);
      padding: 8px 0;
      position: relative;
      transition: color 0.2s ease;

      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 50%;
        width: 3px;
        height: 0;
        border-radius: 4px;
        background-color: var(--color-accent);
        transform: translateY(-50%);
        transition: height 0.25s var(--ease-premium);
      }

      &:hover {
        color: var(--color-text-secondary);
      }

      &.active {
        color: var(--color-accent);

        &::before {
          height: 28px;
        }
      }
    }
  }

  .side-nav-footer {
    align-items: center;
    padding: 12px;
    gap: 8px;

    @media (min-width: 900px) {
      flex-direction: column;
      padding-bottom: 24px;
    }

    .icon-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      margin: 0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease, transform 0.2s var(--ease-premium);

      &:hover {
        background-color: var(--color-accent-soft);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0) scale(0.94);
      }

      img {
        width: 18px;
        height: 18px;
      }
    }
  }
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: transform 0.25s var(--ease-premium), opacity 0.2s ease;
}
.icon-swap-enter-from {
  transform: rotate(-90deg) scale(0.6);
  opacity: 0;
}
.icon-swap-leave-to {
  transform: rotate(90deg) scale(0.6);
  opacity: 0;
}
</style>
