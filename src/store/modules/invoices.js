import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { uid } from 'uid';
import { firestoreDb } from '../../firebase/firebaseClient';
import { mapFirestoreDocToInvoice } from '../../utils/invoiceMapper';
import { getInvoiceStatus } from '../../utils/invoiceStatus';
import { DEFAULT_CURRENCY_CODE } from '../../utils/currencies';

const INVOICES_COLLECTION = 'invoices';

// Kept outside state on purpose - an unsubscribe callback isn't data,
// it's a live connection handle, and stuffing functions into a Vuex
// store fights the reactivity system rather than working with it.
let unsubscribeFromInvoicesSnapshot = null;

function sumInvoiceItemTotals(invoiceItemList) {
  let runningTotal = 0;
  let cursor = 0;
  while (cursor < invoiceItemList.length) {
    runningTotal += Number(invoiceItemList[cursor].total) || 0;
    cursor += 1;
  }
  return runningTotal;
}

export default {
  namespaced: true,

  state: () => ({
    invoiceList: [],
    invoicesLoaded: false,
  }),

  getters: {
    allInvoices(state) {
      return state.invoiceList;
    },

    invoiceByPublicId(state) {
      return (invoiceId) => state.invoiceList.find((invoice) => invoice.invoiceId === invoiceId);
    },

    // Every distinct currency actually present, so the dashboard knows
    // which totals it's even able to show.
    currenciesInUse(state) {
      const codes = new Set(state.invoiceList.map((invoice) => invoice.currencyCode || DEFAULT_CURRENCY_CODE));
      return Array.from(codes);
    },

    // Currency-scoped on purpose - adding a $500 invoice to a €500
    // invoice and calling it "1000" would just be wrong.
    totalsByStatus(state) {
      return (currencyCode) => {
        const totals = { paid: 0, pending: 0, overdue: 0, draft: 0 };
        state.invoiceList
          .filter((invoice) => (invoice.currencyCode || DEFAULT_CURRENCY_CODE) === currencyCode)
          .forEach((invoice) => {
            const amount = Number(invoice.invoiceTotal) || 0;
            const status = getInvoiceStatus(invoice);
            totals[status] = (totals[status] || 0) + amount;
          });
        return totals;
      };
    },

    // Last 6 calendar months of paid revenue, oldest first, scoped to one
    // currency - feeds the dashboard bar chart.
    monthlyPaidRevenue(state) {
      return (currencyCode) => {
        const now = new Date();
        const months = [];
        let offset = 5;
        while (offset >= 0) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
          months.push({
            key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
            label: monthDate.toLocaleDateString('en-us', { month: 'short' }),
            total: 0,
          });
          offset -= 1;
        }

        state.invoiceList.forEach((invoice) => {
          if (!invoice.invoicePaid || !invoice.invoiceDateUnix) return;
          if ((invoice.currencyCode || DEFAULT_CURRENCY_CODE) !== currencyCode) return;

          const invoiceDate = new Date(invoice.invoiceDateUnix);
          const key = `${invoiceDate.getFullYear()}-${invoiceDate.getMonth()}`;
          const bucket = months.find((month) => month.key === key);
          if (bucket) bucket.total += Number(invoice.invoiceTotal) || 0;
        });

        return months;
      };
    },
  },

  mutations: {
    SET_INVOICE_LIST(state, invoices) {
      state.invoiceList = invoices;
    },
    SET_INVOICES_LOADED(state, value) {
      state.invoicesLoaded = value;
    },
  },

  actions: {
    // Opens a live Firestore listener instead of a one-time fetch, so
    // edits made in another tab/device show up here without a refresh.
    subscribeToInvoices({ commit, rootState }) {
      if (unsubscribeFromInvoicesSnapshot) unsubscribeFromInvoicesSnapshot();

      const ownerUid = rootState.auth.currentUser?.uid;
      if (!ownerUid) {
        commit('SET_INVOICE_LIST', []);
        commit('SET_INVOICES_LOADED', true);
        return;
      }

      const invoicesQuery = query(collection(firestoreDb, INVOICES_COLLECTION), where('ownerUid', '==', ownerUid));
      unsubscribeFromInvoicesSnapshot = onSnapshot(invoicesQuery, (snapshot) => {
        commit('SET_INVOICE_LIST', snapshot.docs.map(mapFirestoreDocToInvoice));
        commit('SET_INVOICES_LOADED', true);
      });
    },

    unsubscribeFromInvoices({ commit }) {
      if (unsubscribeFromInvoicesSnapshot) {
        unsubscribeFromInvoicesSnapshot();
        unsubscribeFromInvoicesSnapshot = null;
      }
      commit('SET_INVOICE_LIST', []);
      commit('SET_INVOICES_LOADED', false);
    },

    async createInvoice({ rootState }, invoiceDraft) {
      const ownerUid = rootState.auth.currentUser?.uid;
      const invoiceTotal = sumInvoiceItemTotals(invoiceDraft.invoiceItemList);

      const payload = {
        ...invoiceDraft,
        ownerUid,
        invoiceId: uid(6),
        invoiceTotal,
        invoicePaid: false,
      };

      // No manual state mutation here - the onSnapshot listener above
      // will pick up the new document and update invoiceList itself.
      const docRef = await addDoc(collection(firestoreDb, INVOICES_COLLECTION), payload);
      return docRef.id;
    },

    async updateInvoice(_, { docId, changes }) {
      const invoiceTotal = changes.invoiceItemList
        ? sumInvoiceItemTotals(changes.invoiceItemList)
        : undefined;
      const finalChanges = invoiceTotal === undefined ? changes : { ...changes, invoiceTotal };
      await updateDoc(doc(firestoreDb, INVOICES_COLLECTION, docId), finalChanges);
    },

    async deleteInvoice(_, docId) {
      await deleteDoc(doc(firestoreDb, INVOICES_COLLECTION, docId));
    },

    // Single entry point for the status flip, replacing what used to be
    // two nearly identical actions in the original store.
    async setInvoiceStatus({ dispatch }, { docId, status }) {
      const changes = {
        invoicePaid: status === 'paid',
        invoicePending: status === 'pending' || status === 'overdue',
        invoiceDraft: status === 'draft',
      };
      await dispatch('updateInvoice', { docId, changes });
    },
  },
};
