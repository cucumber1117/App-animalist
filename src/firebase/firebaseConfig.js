// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDTDiAGbCKSkNZLn-AI8iBM3p81PErVVG8',
  authDomain: 'appanimelist.firebaseapp.com',
  projectId: 'appanimelist',
  storageBucket: 'appanimelist.appspot.com',
  messagingSenderId: '154171206123',
  appId: '1:154171206123:web:2ac72e54badfa19d5351ae',
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);

// 必要なサービスを取得
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
