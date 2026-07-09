// Central place where the app talks to Firebase.
//
// Config now comes entirely from environment variables (see .env.example)
// instead of being hardcoded, so every deployment points at its own
// Firebase project rather than sharing one.

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDE0dUpDIQkgrGQYIRKpZw_IFtnk11BsSQ",
  authDomain: "vuevoice-798f9.firebaseapp.com",
  projectId: "vuevoice-798f9",
  storageBucket: "vuevoice-798f9.firebasestorage.app",
  messagingSenderId: "331747810253",
  appId: "1:331747810253:web:c4a8015087383c85604284"
};

if (!firebaseConfig.apiKey) {
  // Fail loudly in the console rather than silently hitting an
  // unconfigured backend - this trips people up constantly.
  // eslint-disable-next-line no-console
  console.warn(
    '[Vuevoice] No Firebase config found. Copy .env.example to .env.local and fill in your project credentials.'
  );
}

const firebaseApp = initializeApp(firebaseConfig);

export const firestoreDb = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
export default firebaseApp;
