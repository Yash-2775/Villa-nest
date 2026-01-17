import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCNL_IRN3J_NcfEUu8-yW5xFfbvSQgk2Q8",
  authDomain: "villanest-68c70.firebaseapp.com",
  projectId: "villanest-68c70",
  storageBucket: "villanest-68c70.firebasestorage.app",
  messagingSenderId: "472810466052",
  appId: "1:472810466052:web:85cc383e89200b3e887e51",
};

// ✅ Prevent duplicate Firebase initialization
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
