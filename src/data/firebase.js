import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0NMQ77E_2KogoZKtpwlDYf7QvJ6doJYA",
  authDomain: "bdt-collect.firebaseapp.com",
  projectId: "bdt-collect",
  storageBucket: "bdt-collect.firebasestorage.app",
  messagingSenderId: "585117205650",
  appId: "1:585117205650:web:7f724d6f7ad3211793124b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});
