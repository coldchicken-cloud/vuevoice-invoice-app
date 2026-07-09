<template>
  <div class="auth-screen flex flex-column">
    <div class="ambient-glow"></div>
    <div class="auth-card fade-rise-in">
      <SealLogo :size="48" animated class="brand-mark" />
      <h1>{{ mode === 'login' ? 'Welcome back' : 'Create your account' }}</h1>
      <p class="subtitle">
        {{ mode === 'login' ? 'Sign in to manage your invoices.' : 'Set up Vuevoice for your business.' }}
      </p>

      <form @submit.prevent="handleSubmit" class="auth-form flex flex-column">
        <div class="input flex flex-column">
          <label for="email">Email</label>
          <input required type="email" id="email" v-model="email" autocomplete="email" />
        </div>
        <div class="input flex flex-column">
          <label for="password">Password</label>
          <input
            required
            type="password"
            id="password"
            v-model="password"
            minlength="6"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button type="submit" class="purple" :disabled="isSubmitting">
          {{ isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account' }}
        </button>
      </form>

      <p class="toggle-mode">
        <template v-if="mode === 'login'">
          New to Vuevoice?
          <button type="button" @click="mode = 'register'">Create an account</button>
        </template>
        <template v-else>
          Already have an account?
          <button type="button" @click="mode = 'login'">Sign in</button>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import SealLogo from '@/components/common/SealLogo.vue';

const store = useStore();
const router = useRouter();
const route = useRoute();

const mode = ref('login');
const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

function friendlyAuthError(code) {
  const messages = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with that email already exists.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/invalid-email': 'That email address looks off - double check it.',
  };
  return messages[code] || 'Something went wrong. Please try again.';
}

async function handleSubmit() {
  isSubmitting.value = true;
  errorMessage.value = '';
  try {
    if (mode.value === 'login') {
      await store.dispatch('auth/loginWithEmail', { email: email.value, password: password.value });
    } else {
      await store.dispatch('auth/registerWithEmail', { email: email.value, password: password.value });
    }
    router.push(route.query.redirect || { name: 'InvoiceList' });
  } catch (error) {
    errorMessage.value = friendlyAuthError(error.code);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.auth-screen {
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 640px;
  height: 640px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--color-accent-soft) 0%, transparent 65%);
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-input-border);
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: var(--shadow-panel);
  text-align: center;

  .brand-mark {
    margin-bottom: 20px;
  }

  h1 {
    color: var(--color-text);
    font-size: 22px;
  }

  .subtitle {
    color: var(--color-text-secondary);
    font-size: 13px;
    margin-top: 8px;
    margin-bottom: 32px;
  }

  .auth-form {
    text-align: left;
    gap: 16px;

    .input {
      gap: 6px;
    }

    label {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    input {
      background-color: var(--color-input-bg);
      border: 1px solid var(--color-input-border, var(--color-text-muted));
      color: var(--color-text);
      border-radius: 4px;
      padding: 12px;

      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }

    button {
      margin-top: 8px;
      width: 100%;

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  .error-message {
    color: var(--color-danger);
    font-size: 12px;
  }

  .toggle-mode {
    margin-top: 24px;
    font-size: 13px;
    color: var(--color-text-secondary);

    button {
      background: none;
      border: none;
      color: var(--color-accent);
      cursor: pointer;
      padding: 0 0 0 4px;
      margin: 0;
      font-size: 13px;
    }
  }
}
</style>
