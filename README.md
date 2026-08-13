# eotton mongolia — онлайн дэлгүүр

Органик хөвөн хүүхдийн хувцас зардаг дэлгүүрийн бүрэн ажилладаг вэбсайт: Нүүр хуудас, Каталог, Бидний тухай, Блог, FAQ, Сагс, Хэрэглэгчийн бүртгэл, **Админ панель** (бүтээгдэхүүн, захиалга, блог, FAQ, тохиргоо удирдах).

Backend: [Firebase](https://firebase.google.com) (Firestore өгөгдлийн сан + Authentication) — үнэгүй, сервер суурилуулах шаардлагагүй.

## 1. Firebase тохируулах (5-10 минут)

1. https://console.firebase.google.com → **Add project** → нэр өгөөд үүсгэ (үнэгүй Spark төлөвлөгөө хангалттай).
2. Зүүн талын цэснээс **Build → Firestore Database → Create database** → "Start in production mode" сонго → байршил сонгоод үүсгэ.
3. **Build → Authentication → Get started → Sign-in method → Email/Password** идэвхжүүл.
4. **Project settings (⚙️) → General** хэсэгт доош гүйлгээд "Your apps" дор `</>` (Web) icon дээр дар → апп нэр өгөөд бүртгэ.
5. Гарч ирэх `firebaseConfig` объектыг хуулж, энэ репо доторх **`firebase-config.js`** файлд байгаа placeholder утгуудын оронд тавь.

## 3. Firestore Security Rules тохируулах (маш чухал!)

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

    // admins коллекц — клиент код (браузер) огт бичиж болохгүй.
    // Зөвхөн серверийн Netlify Function (Firebase Admin SDK) л энд бичиж чадна.
    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }
  }
}
```

## 4. Админ нэвтрэлтийг тохируулах (нууц үг + Firebase Admin SDK)

Админ хэсэг рүү орохын тулд ганц нууц үг оруулна — энэ нууц үг **браузерийн код дотор огт байхгүй**, зөвхөн Netlify-н серверийн орчинд (Environment Variables) хадгалагдаж, Netlify Function дотор шалгагдана. Зөв бол функц Firebase-с жинхэнэ, аюулгүй нэвтрэлтийн token үүсгэж өгнө.

### 4.1 Firebase Service Account key авах

1. Firebase console → ⚙️ **Project settings → Service accounts** таб руу ор.
2. **Generate new private key** дараад баталгаажуулна уу — `.json` файл татагдана.
3. Тэр файлыг нээгээд **бүх агуулгыг нь** (нэг том JSON текст) хуул.

### 4.2 Netlify дээр Environment Variables нэмэх

Netlify dashboard → таны site → **Site configuration → Environment variables → Add a variable** дараад доорх 3 хувьсагчийг нэм:

| Key | Value |
|---|---|
| `ADMIN_ACCESS_PASSWORD` | Таны сонгосон нууц үг (жишээ нь: `MyStr0ngPass!2026`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | 4.1-д хуулсан бүтэн JSON текст |
| `ADMIN_UID` | (заавал биш) `site-admin` гэх мэт дурын үг — өгөхгүй бол автоматаар `site-admin` болно |

Хадгалсны дараа **Deploys → Trigger deploy → Clear cache and deploy site** дараад шинэ хувьсагчаа идэвхжүүл.

### 4.3 Шалгах

1. Deploy дуусмагц сайтынхаа `https://<таны-домэйн>/#/admin` хаягаар орж үзнэ (энэ линк цэсэнд байхгүй тул зөвхөн та мэднэ).
2. `ADMIN_ACCESS_PASSWORD`-оор өгсөн нууц үгээ оруулаад **Нэвтрэх** дар.
3. Админ панель нээгдвэл боллоо. Firestore-ийн `admins` коллекцод автоматаар шаардлагатай баримт бичиг үүснэ — та Firebase console-руу орж юу ч гараар хийх шаардлагагүй.

> **Аюулгүй байдлын тухай:** Энэ архитектур нь нууц үгийг зөвхөн серверийн (Netlify Function) орчинд шалгадаг тул хэн ч browser-ийн DevTools эсвэл кодоос нууц үгийг харах боломжгүй. Гэхдээ нууц үгээ хэн нэгэнтэй хуваалцахгүй, хангалттай урт, давтагдашгүй сонгохыг зөвлөж байна.


## 5. GitHub-д оруулах

```bash
git init
git add .
git commit -m "eotton store"
git branch -M main
git remote add origin https://github.com/<таны-нэр>/<репо-нэр>.git
git push -u origin main
```

## 6. Netlify дээр байршуулах

1. https://app.netlify.com → **Add new site → Import an existing project → GitHub** сонгоод дээрх репог холбо.
2. Build command: **хоосон үлдээ** (Netlify функцийн dependency-г `package.json`-с автоматаар суулгана).
3. Publish directory: **`.`** (root).
4. **Deploy site** дар.
5. Deploy дууссаны дараа заавал **4-р алхмын Environment Variables**-аа нэмээд дахин deploy хийхээ бүү март (env var нэмэхэд Netlify автоматаар дахин deploy хийдэггүй тохиолдол бий тул "Clear cache and deploy site" ашиглаарай).

Дараа нь домэйн нэрээ холбохыг хүсвэл Netlify-н **Domain settings** хэсгээс хийж болно.

## Файлын бүтэц

```
index.html                      — бүх хуудасны HTML skeleton, роутер энд ачаалагдана
style.css                       — бүх загвар (өнгө, layout, responsive)
firebase-config.js              — Firebase-ийн (нийтэд ил, нууц биш) вэб тохиргоо
app.js                          — бүх логик: каталог, сагс, захиалга, нэвтрэлт, админ панель
package.json                    — Netlify Function-ий firebase-admin dependency
netlify.toml                    — Netlify-д functions хаана байгааг заана
netlify/functions/admin-login.js — админ нууц үгийг серверийн талд шалгадаг функц
```

## Ирээдүйд нэмж болох зүйлс

- **QPay эсвэл банкны автомат систем**: одоогийн `SETTINGS.paymentMethod` талбар үүнд бэлэн бүтэцтэй — checkout логикт шинэ салбар нэмээд, QPay-н API-г Netlify Function дотор дуудах хэрэгтэй болно (учир нь нууц түлхүүрийг клиент код дотор харуулж болохгүй).
- **Зургийн байршуулалт**: одоогоор эможи ашиглаж байгаа тул, жинхэнэ бүтээгдэхүүний зураг оруулахыг хүсвэл Firebase Storage эсвэл Cloudinary холбож болно.
- **Хүргэлтийн зардлыг бүс тус бүрээр өөр болгох**, купон/хямдралын код, имэйл мэдэгдэл зэргийг нэмж болно.
