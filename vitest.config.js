import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.js'],
    env: {
      VUE_APP_FIREBASE_API_KEY: 'test-api-key',
      VUE_APP_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VUE_APP_FIREBASE_PROJECT_ID: 'test-project',
      VUE_APP_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      VUE_APP_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
      VUE_APP_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
    },
  },
});
