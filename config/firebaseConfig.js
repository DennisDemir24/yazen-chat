// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9ISaUvBm8jTMGmEWTZYq0i0-8NTu179Y",
  authDomain: "mymoney-14f10.firebaseapp.com",
  projectId: "mymoney-14f10",
  storageBucket: "mymoney-14f10.appspot.com",
  messagingSenderId: "313856507003",
  appId: "1:313856507003:web:b74d458a684e22b28bf6de"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

