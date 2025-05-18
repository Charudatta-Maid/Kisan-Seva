// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBFOMe7Pab0ZNAYgsVwR5CoJte9ZEqkCFE',
  authDomain: 'kisansevaapp-475c5.firebaseapp.com',
  projectId: 'kisansevaapp-475c5',
  storageBucket: 'kisansevaapp-475c5.appspot.com',
  messagingSenderId: '91516116440',
  appId: '1:91516116440:android:59c08b43daf318737166ad',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ compatible with Expo Go
const db = getFirestore(app);

export { app, auth, db };
