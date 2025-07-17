// js/firebaseConfig.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAkwrV-roOMxuBhVjwLoBYq17YPl5kaDJg",
    authDomain: "ikenbako-28697.firebaseapp.com",
    projectId: "ikenbako-28697",
    storageBucket: "ikenbako-28697.firebasestorage.app",
    messagingSenderId: "336819870479",
    appId: "1:336819870479:web:7ecbca02ff3e3b5534bc7a"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
