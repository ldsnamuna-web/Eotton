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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
