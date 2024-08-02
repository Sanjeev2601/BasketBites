// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7XIPpEnV50UeXpsN9pOGqFVwgJe8zxK8",
  authDomain: "pantry-tracker-1c28b.firebaseapp.com",
  projectId: "pantry-tracker-1c28b",
  storageBucket: "pantry-tracker-1c28b.appspot.com",
  messagingSenderId: "216468856079",
  appId: "1:216468856079:web:5402b5e34c514140d0b27a",
  measurementId: "G-QEL00B3NY1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}