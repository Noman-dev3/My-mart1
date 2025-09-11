
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCROUEYmPZY6j_UWyAo8iQMB2J8cks616s",
  authDomain: "python-to-js.firebaseapp.com",
  databaseURL: "https://python-to-js-default-rtdb.firebaseio.com",
  projectId: "python-to-js",
  storageBucket: "python-to-js.appspot.com",
  messagingSenderId: "375323927925",
  appId: "1:375323927925:web:5065bc25c4236af9f41f3c"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
