import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseAuth } from '../../firebase/firebaseClient';

export default {
  namespaced: true,

  state: () => ({
    currentUser: null,
    // Stays false until Firebase has told us, once, whether a session
    // exists - the router guard waits on this before deciding anything.
    authReady: false,
    authError: null,
  }),

  getters: {
    isAuthenticated(state) {
      return Boolean(state.currentUser);
    },
  },

  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
      state.authReady = true;
    },
    SET_AUTH_ERROR(state, message) {
      state.authError = message;
    },
  },

  actions: {
    // Called once from main.js so the store always reflects Firebase's
    // own session state, including page refreshes.
    watchAuthState({ commit }) {
      onAuthStateChanged(firebaseAuth, (user) => {
        commit('SET_CURRENT_USER', user);
      });
    },

    async registerWithEmail({ commit }, { email, password }) {
      commit('SET_AUTH_ERROR', null);
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        return credential.user;
      } catch (error) {
        commit('SET_AUTH_ERROR', error.message);
        throw error;
      }
    },

    async loginWithEmail({ commit }, { email, password }) {
      commit('SET_AUTH_ERROR', null);
      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        return credential.user;
      } catch (error) {
        commit('SET_AUTH_ERROR', error.message);
        throw error;
      }
    },

    async logout() {
      await signOut(firebaseAuth);
    },
  },
};
