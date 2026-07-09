const THEME_STORAGE_KEY = 'vuevoice.theme';

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  } catch (error) {
    return 'dark';
  }
}

export default {
  namespaced: true,

  state: () => ({
    theme: readStoredTheme(),
    invoiceEditorOpen: false,
    discardConfirmOpen: false,
    // null while creating a brand new invoice; the docId of the invoice
    // being edited otherwise. Replaces a separate boolean flag - there's
    // never a case where we need "editing" without knowing *which* one.
    editingInvoiceDocId: null,
  }),

  getters: {
    isLightTheme(state) {
      return state.theme === 'light';
    },
    isEditingInvoice(state) {
      return state.editingInvoiceDocId !== null;
    },
  },

  mutations: {
    SET_THEME(state, theme) {
      state.theme = theme;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        // Storage can be unavailable (private browsing, quota) - the app
        // still works, it just won't remember the preference.
      }
    },
    SET_INVOICE_EDITOR_OPEN(state, value) {
      state.invoiceEditorOpen = value;
    },
    SET_DISCARD_CONFIRM_OPEN(state, value) {
      state.discardConfirmOpen = value;
    },
    SET_EDITING_INVOICE_DOC_ID(state, docId) {
      state.editingInvoiceDocId = docId;
    },
  },

  actions: {
    toggleTheme({ state, commit }) {
      commit('SET_THEME', state.theme === 'dark' ? 'light' : 'dark');
    },
  },
};
