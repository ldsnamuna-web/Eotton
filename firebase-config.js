/*
  ЗААВАР:
  1. https://console.firebase.google.com руу орж, шинэ проект үүсгэ (үнэгүй Spark төлөвлөгөө хангалттай).
  2. Project settings > General > "Your apps" хэсэгт "</>" (Web) дээр дарж апп нэмнэ.
  3. Firebase чамд өгөх "firebaseConfig" объектыг доор тавь (bucket/key утгууд нууц биш, олон нийтэд ил байж болно).
  4. Firebase console-д:
       - Build > Firestore Database > Create database (production mode) идэвхжүүл.
       - Build > Authentication > Sign-in method > Email/Password идэвхжүүл.
  5. README.md файлыг үзээд Firestore Security Rules-ыг тохируулаарай (маш чухал алхам!).
*/

const firebaseConfig = {
  apiKey: "AIzaSyBYJtM86sAhR-JBUVrF-1yDP7X-8nRN4Qg",
  authDomain: "eotton-af585.firebaseapp.com",
  projectId: "eotton-af585",
  storageBucket: "eotton-af585.firebasestorage.app",
  messagingSenderId: "1041295939382",
  appId: "1:1041295939382:web:56d75d62feefa024330597"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
