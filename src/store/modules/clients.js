import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { firestoreDb } from '../../firebase/firebaseClient';

const CLIENTS_COLLECTION = 'clients';

let unsubscribeFromClientsSnapshot = null;

function mapClientDoc(docSnapshot) {
  const data = docSnapshot.data();
  return {
    docId: docSnapshot.id,
    name: data.name,
    email: data.email,
    streetAddress: data.streetAddress,
    city: data.city,
    zipCode: data.zipCode,
    country: data.country,
  };
}

export default {
  namespaced: true,

  state: () => ({
    clientList: [],
    clientsLoaded: false,
  }),

  getters: {
    allClients(state) {
      return state.clientList;
    },
    clientById(state) {
      return (docId) => state.clientList.find((client) => client.docId === docId);
    },
  },

  mutations: {
    SET_CLIENT_LIST(state, clients) {
      state.clientList = clients;
    },
    SET_CLIENTS_LOADED(state, value) {
      state.clientsLoaded = value;
    },
  },

  actions: {
    subscribeToClients({ commit, rootState }) {
      if (unsubscribeFromClientsSnapshot) unsubscribeFromClientsSnapshot();

      const ownerUid = rootState.auth.currentUser?.uid;
      if (!ownerUid) {
        commit('SET_CLIENT_LIST', []);
        commit('SET_CLIENTS_LOADED', true);
        return;
      }

      const clientsQuery = query(collection(firestoreDb, CLIENTS_COLLECTION), where('ownerUid', '==', ownerUid));
      unsubscribeFromClientsSnapshot = onSnapshot(clientsQuery, (snapshot) => {
        commit('SET_CLIENT_LIST', snapshot.docs.map(mapClientDoc));
        commit('SET_CLIENTS_LOADED', true);
      });
    },

    unsubscribeFromClients({ commit }) {
      if (unsubscribeFromClientsSnapshot) {
        unsubscribeFromClientsSnapshot();
        unsubscribeFromClientsSnapshot = null;
      }
      commit('SET_CLIENT_LIST', []);
      commit('SET_CLIENTS_LOADED', false);
    },

    // Handles both create and update - callers just pass a docId (or not).
    async saveClient({ rootState }, clientPayload) {
      const ownerUid = rootState.auth.currentUser?.uid;

      if (clientPayload.docId) {
        const { docId, ...changes } = clientPayload;
        await updateDoc(doc(firestoreDb, CLIENTS_COLLECTION, docId), changes);
        return docId;
      }

      const docRef = await addDoc(collection(firestoreDb, CLIENTS_COLLECTION), { ...clientPayload, ownerUid });
      return docRef.id;
    },

    async deleteClient(_, docId) {
      await deleteDoc(doc(firestoreDb, CLIENTS_COLLECTION, docId));
    },
  },
};
