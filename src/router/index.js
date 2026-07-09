import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const InvoiceListView = () => import('../views/InvoiceListView.vue');
const InvoiceDetailView = () => import('../views/InvoiceDetailView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const ClientsView = () => import('../views/ClientsView.vue');
const LoginView = () => import('../views/LoginView.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'InvoiceList',
    component: InvoiceListView,
    meta: { requiresAuth: true },
  },
  {
    path: '/invoice/:invoiceId',
    name: 'InvoiceDetail',
    component: InvoiceDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/clients',
    name: 'Clients',
    component: ClientsView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Firebase resolves whether a session exists asynchronously, so the very
// first navigation has to wait for that one-time answer before the guard
// can make a correct decision.
function waitForAuthReady() {
  if (store.state.auth.authReady) return Promise.resolve();
  return new Promise((resolve) => {
    const stopWatching = store.watch(
      (state) => state.auth.authReady,
      (ready) => {
        if (ready) {
          stopWatching();
          resolve();
        }
      }
    );
  });
}

router.beforeEach(async (to) => {
  await waitForAuthReady();
  const isAuthenticated = store.getters['auth/isAuthenticated'];

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'Login' && isAuthenticated) {
    return { name: 'InvoiceList' };
  }

  return true;
});

export default router;
