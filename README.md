# eotton mongolia — онлайн дэлгүүр

Органик хөвөн хүүхдийн хувцас зардаг дэлгүүрийн бүрэн ажилладаг вэбсайт: Нүүр хуудас, Каталог, Бидний тухай, Блог, FAQ, Сагс, Хэрэглэгчийн бүртгэл, **Админ панель** (бүтээгдэхүүн, захиалга, блог, FAQ, тохиргоо удирдах).

Backend: [Firebase](https://firebase.google.com) (Firestore өгөгдлийн сан + Authentication) — үнэгүй, сервер суурилуулах шаардлагагүй.

## 1. Firebase тохируулах (5-10 минут)

1. https://console.firebase.google.com → **Add project** → нэр өгөөд үүсгэ (үнэгүй Spark төлөвлөгөө хангалттай).
2. Зүүн талын цэснээс **Build → Firestore Database → Create database** → "Start in production mode" сонго → байршил сонгоод үүсгэ.
3. **Build → Authentication → Get started → Sign-in method → Email/Password** идэвхжүүл.
4. **Project settings (⚙️) → General** хэсэгт доош гүйлгээд "Your apps" дор `</>` (Web) icon дээр дар → апп нэр өгөөд бүртгэ.
5. Гарч ирэх `firebaseConfig` объектыг хуулж, энэ репо доторх **`firebase-config.js`** файлд байгаа placeholder утгуудын оронд тавь.

## 2. Firestore Security Rules тохируулах (маш чухал!)

Firebase console → **Firestore Database → Rules** таб руу орж, доорх дүрмийг тавиад **Publish** дар:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Бүтээгдэхүүн, блог, FAQ, тохиргоо — хүн бүр уншиж болно, зөвхөн админ засаж болно
    match /products/{id}  { allow read: if true; allow write: if isAdmin(); }
    match /blog/{id}      { allow read: if true; allow write: if isAdmin(); }
    match /faqs/{id}      { allow read: if true; allow write: if isAdmin(); }
    match /settings/{id}  { allow read: if true; allow write: if isAdmin(); }

    // Захиалга — хэн ч захиалга үүсгэж болно, зөвхөн эзэн нь эсвэл админ уншиж/засаж болно
    match /orders/{id} {
      allow create: if true;
      allow read, update: if isAdmin() ||
        (request.auth != null && resource.data.customerUid == request.auth.uid);
    }

    // Хэрэглэгчийн профайл — зөвхөн өөрөө болон админ хандана
    match /customers/{uid} {
      allow create: if request.auth != null && request.auth.uid == uid;
      allow read: if isAdmin() || (request.auth != null && request.auth.uid == uid);
    }

    // admins коллекц — зөвхөн Firebase Console-с гараар засварлана (клиент талаас бичихийг хориглоно)
    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }
  }
}
```

## 3. Өөрийгөө админ болгох

1. Сайтаа нээгээд **"Бүртгүүлэх"** хуудсаар энгийн хэрэглэгчийн бүртгэл үүсгэ (өөрийн имэйл, нууц үгээрээ).
2. Firebase console → **Authentication → Users** таб руу ор → шинээр үүссэн хэрэглэгчийнхээ **User UID**-г хуул.
3. Firebase console → **Firestore Database → Data** → **Start collection** дараад коллекцийн нэрийг `admins` гэж бич.
4. Document ID талбарт дээрх UID-г буулгаад, дурын нэг талбар нэм (жишээ нь `addedAt: true`) → **Save**.
5. Одоо сайтын `#/admin` хуудсаар яг тухайн имэйл, нууц үгээрээ нэвтэрвэл админ панель нээгдэнэ.

> Дараа өөр админ нэмэхдээ мөн адил алхмуудыг давтана — шинэ хэрэглэгч бүртгүүлээд, түүний UID-г `admins` коллекцод нэмнэ.

## 4. GitHub-д оруулах

```bash
git init
git add .
git commit -m "eotton store"
git branch -M main
git remote add origin https://github.com/<таны-нэр>/<репо-нэр>.git
git push -u origin main
```

## 5. Netlify дээр байршуулах

1. https://app.netlify.com → **Add new site → Import an existing project → GitHub** сонгоод дээрх репог холбо.
2. Build command: **хоосон үлдээ** (build алхам хэрэггүй).
3. Publish directory: **`/`** (эсвэл энэ репог хаана байршуулснаас хамааран тухайн фолдер).
4. **Deploy site** дар — түр хүлээгээд линк дээрээ нээгдэнэ.

Дараа нь домэйн нэрээ холбохыг хүсвэл Netlify-н **Domain settings** хэсгээс хийж болно.

## Файлын бүтэц

```
index.html          — бүх хуудасны HTML skeleton, роутер энд ачаалагдана
style.css            — бүх загвар (өнгө, layout, responsive)
firebase-config.js   — Firebase төслийн тохиргоо (энд өөрийн key-гээ тавина)
app.js               — бүх логик: каталог, сагс, захиалга, нэвтрэлт, админ панель
```

## Ирээдүйд нэмж болох зүйлс

- **QPay эсвэл банкны автомат систем**: одоогийн `SETTINGS.paymentMethod` талбар үүнд бэлэн бүтэцтэй — checkout логикт шинэ салбар нэмээд, QPay-н API-г Netlify Function дотор дуудах хэрэгтэй болно (учир нь нууц түлхүүрийг клиент код дотор харуулж болохгүй).
- **Зургийн байршуулалт**: одоогоор эможи ашиглаж байгаа тул, жинхэнэ бүтээгдэхүүний зураг оруулахыг хүсвэл Firebase Storage эсвэл Cloudinary холбож болно.
- **Хүргэлтийн зардлыг бүс тус бүрээр өөр болгох**, купон/хямдралын код, имэйл мэдэгдэл зэргийг нэмж болно.
