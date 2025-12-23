// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqwNgQJd0Gtig74DB9eSCCWbWf8Cx3IVg",
  authDomain: "laboratori-84729.firebaseapp.com",
  projectId: "laboratori-84729",
  storageBucket: "laboratori-84729.firebasestorage.app",
  messagingSenderId: "329324790706",
  appId: "1:329324790706:web:5d43451b2208d09b455aab",
  measurementId: "G-DQS2W5TP64"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
