/* ==========================================================================
   eotton mongolia — Firebase-powered store
   Firestore collections used:
     products/{id}   -> {name, category, price, oldPrice, stock, icon, desc, badge}
     blog/{id}       -> {title, date, icon, excerpt, body}
     faqs/{id}       -> {q, a}
     settings/payment-> {bankName, accountNumber, accountHolder, paymentNote, paymentMethod}
     orders/{id}     -> {customerUid, name, email, phone, address, items, total, status, createdAt}
     customers/{uid} -> {name, email, joined}
     admins/{uid}    -> {addedAt}   (presence of doc = user is an admin)
   ========================================================================== */

const CATS = [
  {id:'bodysuit', name:'Боди', icon:'👶'},
  {id:'shirts', name:'Цамц', icon:'👕'},
  {id:'pants', name:'Өмд', icon:'👖'},
  {id:'dresses', name:'Даашинз', icon:'👗'},
  {id:'outerwear', name:'Гадуур хувцас', icon:'🧥'},
  {id:'accessories', name:'Малгай, дагалдах', icon:'🧢'},
  {id:'underwear', name:'Дотуур хувцас', icon:'🩲'},
  {id:'sleepwear', name:'Пижам', icon:'🌙'},
  {id:'newarrivals', name:'Шинэ ирц', icon:'✨'},
  {id:'sale', name:'Хямдрал', icon:'🏷️'},
];

const SEED_SETTINGS = {
  paymentMethod: 'bank_transfer',
  bankName: 'Хаан банк',
  accountNumber: '5012345678',
  accountHolder: 'Eotton Mongolia ХХК',
  paymentNote: 'Захиалгын нийт дүнгээ дээрх дансанд шилжүүлээд, шилжүүлгийн баримтын зургийг Facebook/Instagram-аар илгээнэ үү. Бид шилжүүлгийг баталгаажуулмагц захиалгыг боловсруулж эхэлнэ.'
};

const SEED_PRODUCTS = [
  {name:'Органик хөвөн боди 3ш багц', category:'bodysuit', price:45000, oldPrice:0, icon:'👶', stock:24, badge:'', desc:'100% органик хөвөн даавуугаар хийсэн, нярай хүүхдийн зөөлөн арьсанд ээлтэй 3ш боди багц.'},
  {name:'Зөөлөн хөвөн цамц', category:'shirts', price:38000, oldPrice:0, icon:'👕', stock:18, badge:'best', desc:'Өдөр тутмын хэрэглээнд тохиромжтой, амьсгалдаг зөөлөн хөвөн цамц.'},
  {name:'Уян харимхай өмд', category:'pants', price:42000, oldPrice:0, icon:'👖', stock:15, badge:'', desc:'Хөдөлгөөнд саадгүй, өргөтгөх боломжтой бүсэлхийтэй органик хөвөн өмд.'},
  {name:'Хавар намрын даашинз', category:'dresses', price:56000, oldPrice:0, icon:'👗', stock:10, badge:'new', desc:'Байгалийн будагтай, зөөлөн даавуун даашинз.'},
  {name:'Байгалийн өнгийн хантааз', category:'outerwear', price:68000, oldPrice:0, icon:'🧥', stock:8, badge:'', desc:'Дулаан, амьсгалдаг материалаар хийсэн гадуур хантааз.'},
  {name:'Дулаан малгай, бээлий сет', category:'accessories', price:25000, oldPrice:0, icon:'🧢', stock:30, badge:'', desc:'Хөвөн даавуугаар доторлосон, дулаан малгай, бээлийн иж бүрдэл.'},
  {name:'Шөнийн зөөлөн пижам', category:'sleepwear', price:35000, oldPrice:0, icon:'🌙', stock:20, badge:'', desc:'Хэт зөөлөн, амьсгалдаг даавуугаар хийсэн пижам.'},
  {name:'Хөвөн дотуур хувцасны багц', category:'underwear', price:22000, oldPrice:0, icon:'🩲', stock:26, badge:'', desc:'Арьсанд шууд хүрэх материал тул 100% органик хөвөн ашигласан.'},
  {name:'Newborn эхлэл багц (5 нэгж)', category:'newarrivals', price:75000, oldPrice:0, icon:'✨', stock:12, badge:'new', desc:'Шинэ нярайд зориулсан 5 нэгжтэй бүрэн иж бүрдэл.'},
  {name:'Зуны хөнгөн ролик өмд', category:'sale', price:30000, oldPrice:40000, icon:'👖', stock:14, badge:'sale', desc:'Зуны улиралд тохиромжтой хөнгөн даавуун өмд. Одоогоор хямдралтай!'},
  {name:'Уяатай зөөлөн малгай', category:'accessories', price:15000, oldPrice:0, icon:'🧢', stock:22, badge:'', desc:'Наранаас хамгаалах, зөөлөн уяатай хөвөн малгай.'},
  {name:'Хүрэм даавуун куртка', category:'outerwear', price:72000, oldPrice:88000, icon:'🧥', stock:6, badge:'sale', desc:'Хүйтэн улиралд зориулсан дулаан, органик доторлогоотой куртка.'},
];

const SEED_BLOG = [
  {title:'Яагаад органик хөвөн сонгох вэ?', date:'2026-06-02', icon:'🌱', excerpt:'Органик хөвөн нь ердийн хөвөнгөөс юугаараа ялгаатай, хүүхдийн эрүүл мэндэд ямар ач холбогдолтойг тайлбарлав.', body:'Органик хөвөн нь ургамал хамгаалах бодис, хиймэл бордоо ашиглахгүйгээр тариалагддаг тул хүүхдийн зөөлөн арьсанд аюулгүй байдаг.\n\nМөн органик хөвөн тариалалт нь хөрс, ус, орчны экосистемд ээлтэй тул тогтвортой хөгжлийг дэмждэг. eotton дэлгүүрийн бүх бүтээгдэхүүн GOTS сертификаттай, 100% органик хөвөнгөөр хийгддэг.'},
  {title:'Нярай хүүхдийн арьсанд тохирсон материал сонгох зөвлөгөө', date:'2026-06-18', icon:'🍼', excerpt:'Нярай хүүхдийн хувцас сонгохдоо анхаарах ёстой 5 гол зүйлийг хуваалцлаа.', body:'Нярай хүүхдийн арьс маш нимгэн, мэдрэмтгий тул хувцас сонгохдоо материалын чанар, оёдлын гөлгөр байдал, амьсгалдах чадвар, химийн үнэргүй байх, угаалгад тэсвэртэй байдлыг анхаарах хэрэгтэй.'},
  {title:'eotton-ий үйлдвэрлэлийн түүх', date:'2026-07-05', icon:'📖', excerpt:'Манай брэнд хэрхэн үүсэж, өнөөдрийг хүртэл ямар зарчмаар ажилладгийг танилцуулж байна.', body:'eotton mongolia нь 2023 онд эцэг эхийн хувиар өөрсдийн хүүхдэдээ зориулж эхэлсэн жижиг санаанаас өнөөдрийн бэлэн дэлгүүр болтлоо хөгжсөн. Бид эхнээсээ л зөвхөн органик, аюулгүй материал ашиглах зарчмыг баримталж ирсэн.'},
];

const SEED_FAQ = [
  {q:'Таны бүтээгдэхүүн ямар материалаар хийгддэг вэ?', a:'Бид зөвхөн GOTS сертификаттай 100% органик хөвөн ашигладаг бөгөөд химийн будаг, хортой бодис ашигладаггүй.'},
  {q:'Хүргэлт хэдэн хоногт хийгддэг вэ?', a:'Улаанбаатар хотод 1-2 хоног, орон нутагт 3-5 хоногт хүргэгдэнэ.'},
  {q:'Хэмжээгээ хэрхэн сонгох вэ?', a:'Хүүхдийн нас, өндөр, жинд тохируулан хэмжээний хүснэгтийг бүтээгдэхүүний хуудаснаас харах боломжтой.'},
  {q:'Буцаалт, солилт хийж болох уу?', a:'Бүтээгдэхүүнийг 7 хоногийн дотор, шошготой, хэрэглэгдээгүй байдалд буцаах боломжтой.'},
  {q:'Ямар төлбөрийн хэлбэрүүд боломжтой вэ?', a:'Одоогоор дансаар шилжүүлэх боломжтой. Захиалга баталгаажуулах хуудсанд дансны дугаар харагдана.'},
];

/* ============ STATE ============ */
let PRODUCTS = [], BLOG = [], FAQS = [], ORDERS = [], SETTINGS = {}, CUSTOMERS = [];
let CURRENT_USER = null;     // firebase auth user object or null
let CURRENT_PROFILE = null;  // customers/{uid} doc data
let IS_ADMIN = false;
let CART = [];
let authReady = false;
let authReadyResolve;
const authReadyPromise = new Promise(res => authReadyResolve = res);

function fmt(n){ return Number(n||0).toLocaleString('mn-MN') + '₮'; }
function catName(id){ const c = CATS.find(c=>c.id===id); return c? c.name : id; }
function cardBg(cat){
  const map = {bodysuit:'#EAF0DF', shirts:'#E7ECF5', pants:'#F3EEE0', dresses:'#F6E7EB', outerwear:'#E4E9DD', accessories:'#F0E6DA', underwear:'#EDEBE0', sleepwear:'#E3E5F0', newarrivals:'#F3E9D6', sale:'#FBE3E0'};
  return map[cat]||'#F0EDE2';
}

/* ============ CART (localStorage — works fine on a real deployed site) ============ */
function loadCart(){ try{ CART = JSON.parse(localStorage.getItem('eotton_cart')||'[]'); }catch(e){ CART = []; } }
function saveCart(){ localStorage.setItem('eotton_cart', JSON.stringify(CART)); updateCartBadge(); }
function updateCartBadge(){
  const el = document.getElementById('cartBadge');
  if(el) el.textContent = CART.reduce((s,i)=>s+i.qty,0);
}
function addToCart(pid, qty=1){
  const existing = CART.find(i=>i.productId===pid);
  if(existing){ existing.qty += qty; } else { CART.push({productId:pid, qty}); }
  saveCart();
  flashToast('Сагсанд нэмэгдлээ ✓');
}
function removeFromCart(pid){ CART = CART.filter(i=>i.productId!==pid); saveCart(); renderCart(); }
function setCartQty(pid, qty){
  const it = CART.find(i=>i.productId===pid);
  if(!it) return;
  it.qty = Math.max(1, qty);
  saveCart();
  renderCart();
}

let toastTimer;
function flashToast(msg){
  let t = document.getElementById('toastEl');
  if(!t){
    t = document.createElement('div');
    t.id='toastEl';
    t.style.cssText = 'position:fixed; bottom:26px; left:50%; transform:translateX(-50%); background:#1C2A20; color:#fff; padding:12px 22px; border-radius:24px; font-size:13.5px; z-index:500; box-shadow:0 8px 20px rgba(0,0,0,.2); opacity:0; transition:opacity .2s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.style.opacity='0'; }, 1800);
}

/* ============ FIRESTORE HELPERS ============ */
async function fetchAll(collectionName){
  const snap = await db.collection(collectionName).get();
  return snap.docs.map(d=>({id:d.id, ...d.data()}));
}
async function seedIfEmpty(collectionName, seedArr){
  const snap = await db.collection(collectionName).limit(1).get();
  if(snap.empty){
    const batch = db.batch();
    seedArr.forEach(item=>{
      const ref = db.collection(collectionName).doc();
      batch.set(ref, item);
    });
    await batch.commit();
  }
}
async function loadStoreData(){
  await seedIfEmpty('products', SEED_PRODUCTS);
  await seedIfEmpty('blog', SEED_BLOG);
  await seedIfEmpty('faqs', SEED_FAQ);

  const settingsDoc = await db.collection('settings').doc('payment').get();
  if(settingsDoc.exists){ SETTINGS = settingsDoc.data(); }
  else { SETTINGS = SEED_SETTINGS; await db.collection('settings').doc('payment').set(SETTINGS); }

  PRODUCTS = await fetchAll('products');
  BLOG = await fetchAll('blog');
  FAQS = await fetchAll('faqs');
}

/* ============ AUTH ============ */
auth.onAuthStateChanged(async (user)=>{
  CURRENT_USER = user;
  if(user){
    IS_ADMIN = await checkIsAdmin(user.uid);
    try{
      const p = await db.collection('customers').doc(user.uid).get();
      CURRENT_PROFILE = p.exists ? p.data() : null;
    }catch(e){ CURRENT_PROFILE = null; }
  } else {
    IS_ADMIN = false;
    CURRENT_PROFILE = null;
  }
  if(!authReady){ authReady = true; authReadyResolve(); }
  updateHeaderAuthState();
  if(location.hash.startsWith('#/admin') || location.hash.startsWith('#/account')){ router(); }
});

async function checkIsAdmin(uid){
  try{
    const doc = await db.collection('admins').doc(uid).get();
    return doc.exists;
  }catch(e){ return false; }
}

async function registerCustomer(name, email, password){
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await db.collection('customers').doc(cred.user.uid).set({
    name, email, joined: new Date().toISOString().slice(0,10)
  });
  CURRENT_PROFILE = {name, email, joined:new Date().toISOString().slice(0,10)};
}
async function loginCustomer(email, password){
  await auth.signInWithEmailAndPassword(email, password);
}
async function logoutUser(){
  await auth.signOut();
  go('#/');
}

function updateHeaderAuthState(){
  const acc = document.getElementById('accountIcon');
  if(!acc) return;
  acc.title = CURRENT_USER ? (CURRENT_PROFILE ? CURRENT_PROFILE.name : CURRENT_USER.email) : 'Нэвтрэх / Бүртгүүлэх';
}

/* ============ ROUTER ============ */
const app = document.getElementById('app');

function currentRoute(){
  const hash = location.hash.replace('#/','').replace('#','');
  return hash.split('?')[0].split('/').filter(Boolean);
}
function queryParams(){
  const q = location.hash.split('?')[1];
  const p = {};
  if(q) q.split('&').forEach(pair=>{ const [k,v]=pair.split('='); p[k]=decodeURIComponent(v||''); });
  return p;
}
function go(hash){ location.hash = hash; }

async function router(){
  const parts = currentRoute();
  const q = queryParams();
  highlightNav(parts[0]||'home');
  window.scrollTo(0,0);

  if(parts.length===0){ renderHome(); }
  else if(parts[0]==='catalog'){ renderCatalog(q); }
  else if(parts[0]==='product' && parts[1]){ renderProduct(parts[1]); }
  else if(parts[0]==='about'){ renderAbout(); }
  else if(parts[0]==='blog' && parts[1]){ renderBlogPost(parts[1]); }
  else if(parts[0]==='blog'){ renderBlogList(); }
  else if(parts[0]==='faq'){ renderFAQ(); }
  else if(parts[0]==='cart'){ renderCart(); }
  else if(parts[0]==='login'){ renderLogin(); }
  else if(parts[0]==='register'){ renderRegister(); }
  else if(parts[0]==='account'){ renderAccount(); }
  else if(parts[0]==='checkout'){ renderCheckout(); }
  else if(parts[0]==='admin'){ renderAdmin(parts[1]||'dashboard'); }
  else { renderHome(); }
}
window.addEventListener('hashchange', router);

function highlightNav(route){
  document.querySelectorAll('nav.main-links a').forEach(a=>{
    a.classList.toggle('active', a.dataset.route===route);
  });
  const nav = document.getElementById('mainNav');
  if(nav) nav.classList.remove('open');
}

function doSearch(){
  const v = document.getElementById('searchInput').value.trim();
  go('#/catalog?search='+encodeURIComponent(v));
}

function loadingHTML(msg){
  return `<div class="wrap" style="padding:100px 0; text-align:center; color:var(--ink-soft);">${msg||'Ачааллаж байна...'}</div>`;
}

/* ============ PAGE: HOME ============ */
function renderHome(){
  const bestsellers = PRODUCTS.slice(0,4);
  app.innerHTML = `
    <section class="hero" style="padding:0;">
      <div class="hero-tex"></div>
      <div class="hero-inner">
        <h1>Органик хувцас<br><em>таны бяцхан хүүхдэд</em></h1>
        <a href="#/catalog" class="cta">Бүтээгдэхүүн үзэх →</a>
      </div>
    </section>

    <section>
      <div class="wrap">
        <div class="eyebrow">Ангилал</div>
        <h2 class="section-title">Ангилалаар хайх</h2>
        <div class="cat-grid">
          ${CATS.map(c=>`
            <div class="cat-item" onclick="go('#/catalog?cat=${c.id}')">
              <div class="cat-icon">${c.icon}</div>
              <div class="cat-label">${c.name}</div>
            </div>`).join('')}
        </div>
        <button class="see-all" onclick="go('#/catalog')">Бүх ангилал</button>
      </div>
    </section>

    <section style="padding-top:10px;">
      <div class="wrap">
        <div class="prod-head">
          <div>
            <div class="eyebrow">Онцлох</div>
            <h2 class="section-title">Хамгийн их зарагдсан</h2>
          </div>
          <button class="see-all" style="margin:0;" onclick="go('#/catalog')">Бүгдийг үзэх</button>
        </div>
        <div class="prod-grid">${bestsellers.map(productCard).join('') || loadingHTML()}</div>
      </div>
    </section>

    <section>
      <div class="wrap">
        <div class="eyebrow" style="text-align:center;">Яагаад eotton</div>
        <h2 class="section-title" style="text-align:center;">Бидний зарчим</h2>
        <div class="values">
          <div class="value-item"><div class="value-icon">🍁</div>Байгалийн гаралтай</div>
          <div class="value-item"><div class="value-icon">🌍</div>Байгальд ээлтэй</div>
          <div class="value-item"><div class="value-icon">🪷</div>Зөөлөн, амьсгалдаг</div>
          <div class="value-item"><div class="value-icon">🌱</div>Хортой бодисгүй</div>
          <div class="value-item"><div class="value-icon">🎀</div>Минимал загвар</div>
          <div class="value-item"><div class="value-icon">🩵</div>Урт удаан хугацаанд</div>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="wrap band-inner">
        <div class="band-text">
          <div class="eyebrow">Бидний тухай</div>
          <h2 class="section-title">Зөвхөн цэвэрийг, хайртай үрсдээ</h2>
          <p>eotton mongolia нь 0-3 насны хүүхдэд зориулсан цэвэр органик хөвөн хувцасны онлайн дэлгүүр юм. Бид хайртай үрсийнхээ нялх арьсанд зөвхөн хамгийн зөөлөн, аюулгүй материалыг хүргэхийг зорьдог.</p>
          <a href="#/about" class="link-more">Дэлгэрэнгүй унших →</a>
        </div>
        <div class="band-visual"><div class="leaf-circle">🌿</div></div>
      </div>
    </section>

    <section class="bundle-band">
      <div class="wrap">
        <div class="bundle-head">
          <div>
            <div class="eyebrow">Цаг хугацаа хэмнэх</div>
            <h2 class="section-title">Багцаа өөрөө бэлдэхгүй бол…</h2>
            <p class="section-sub">Манайхаас бэлэн иж бүрдэл сонгоорой — шуудхан захиалаад болно.</p>
          </div>
          <a href="#/catalog?cat=newarrivals" style="font-size:13px; font-weight:700; color:var(--terracotta);">Шинэ ирц үзэх →</a>
        </div>
        <div class="bundle-grid">
          ${PRODUCTS.slice(4,8).map(p=>`
            <div class="bundle-card">
              <div class="bundle-img">${p.icon}</div>
              <div class="bundle-body">
                <div class="bundle-name">${p.name}</div>
                <div class="bundle-price">${fmt(p.price)}</div>
                <button class="bundle-btn" onclick="addToCart('${p.id}')">Нэмэх</button>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function productCard(p){
  const badgeMap = {best:'Best Sellers', sale:'Sale', new:'New'};
  return `
    <div class="card">
      <a href="#/product/${p.id}" style="text-decoration:none; color:inherit;">
        ${p.badge? `<div class="badge ${p.badge==='best'?'best':''}">${badgeMap[p.badge]||p.badge}</div>`:''}
        <div class="card-img" style="background:${cardBg(p.category)}">${p.icon}</div>
      </a>
      <div class="card-body">
        <div class="card-cat">${catName(p.category)}</div>
        <a href="#/product/${p.id}" style="text-decoration:none; color:inherit;"><div class="card-name">${p.name}</div></a>
        <div class="card-bottom">
          <div class="price">${p.oldPrice? `<span class="old">${fmt(p.oldPrice)}</span>`:''}${fmt(p.price)}</div>
          <button class="add-btn" onclick="addToCart('${p.id}')" title="Сагсанд нэмэх">+</button>
        </div>
      </div>
    </div>`;
}

/* ============ PAGE: CATALOG ============ */
function renderCatalog(q){
  let filtered = PRODUCTS.slice();
  const activeCat = q.cat || '';
  const search = (q.search||'').toLowerCase();
  if(activeCat) filtered = filtered.filter(p=>p.category===activeCat);
  if(search) filtered = filtered.filter(p=>p.name.toLowerCase().includes(search));

  const sort = q.sort || 'default';
  if(sort==='price-asc') filtered.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') filtered.sort((a,b)=>b.price-a.price);
  if(sort==='name') filtered.sort((a,b)=>a.name.localeCompare(b.name));

  app.innerHTML = `
    <div class="wrap page-hero">
      <div class="breadcrumb"><a href="#/">Нүүр</a> / Бүтээгдэхүүн</div>
      <h1>Бүтээгдэхүүний каталог</h1>
    </div>
    <section style="padding-top:20px;">
      <div class="wrap catalog-layout">
        <div class="filters">
          <h4>Ангилал</h4>
          <span class="filter-opt ${!activeCat?'on':''}" onclick="go('#/catalog')">Бүгд</span>
          ${CATS.map(c=>`<span class="filter-opt ${activeCat===c.id?'on':''}" onclick="go('#/catalog?cat=${c.id}')">${c.icon} ${c.name}</span>`).join('')}
        </div>
        <div class="catalog-main">
          <div class="catalog-toolbar">
            <div class="result-count">${filtered.length} бүтээгдэхүүн олдлоо${search? ` — "${q.search}"`:''}</div>
            <select class="sortsel" onchange="go('#/catalog?${activeCat?'cat='+activeCat+'&':''}${search?'search='+encodeURIComponent(q.search)+'&':''}sort='+this.value)">
              <option value="default" ${sort==='default'?'selected':''}>Эрэмбэлэх: Санал болгосон</option>
              <option value="price-asc" ${sort==='price-asc'?'selected':''}>Үнэ: Багаас их</option>
              <option value="price-desc" ${sort==='price-desc'?'selected':''}>Үнэ: Ихээс бага</option>
              <option value="name" ${sort==='name'?'selected':''}>Нэрээр</option>
            </select>
          </div>
          ${filtered.length? `<div class="prod-grid">${filtered.map(productCard).join('')}</div>` : `
            <div class="empty-state"><div class="em-icon">🔎</div>Илэрц олдсонгүй. Өөр түлхүүр үг ашиглан хайж үзнэ үү.</div>`}
        </div>
      </div>
    </section>
  `;
}

/* ============ PAGE: PRODUCT DETAIL ============ */
let pdQty = 1;
function renderProduct(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p){ app.innerHTML = `<div class="wrap" style="padding:80px 0;">Бүтээгдэхүүн олдсонгүй. <a href="#/catalog">Каталог руу буцах</a></div>`; return; }
  pdQty = 1;
  app.innerHTML = `
    <div class="wrap page-hero">
      <div class="breadcrumb"><a href="#/">Нүүр</a> / <a href="#/catalog">Бүтээгдэхүүн</a> / ${p.name}</div>
    </div>
    <section style="padding-top:10px;">
      <div class="wrap pd-wrap">
        <div class="pd-img" style="background:${cardBg(p.category)}">${p.icon}</div>
        <div class="pd-info">
          <div class="card-cat">${catName(p.category)}</div>
          <h1>${p.name}</h1>
          <div class="pd-price">${p.oldPrice? `<span class="old" style="text-decoration:line-through; color:#a19c8c; font-weight:400; margin-right:8px;">${fmt(p.oldPrice)}</span>`:''}${fmt(p.price)}</div>
          <p class="pd-desc">${p.desc}</p>
          <div class="qty-row">
            <div class="qty-box">
              <button onclick="changePdQty(-1)">−</button>
              <span id="pdQtyLabel">1</span>
              <button onclick="changePdQty(1)">+</button>
            </div>
            <span style="font-size:13px; color:var(--ink-soft);">Үлдэгдэл: ${p.stock} ширхэг</span>
          </div>
          <button class="btn-primary" onclick="addToCart('${p.id}', pdQty); pdQty=1; document.getElementById('pdQtyLabel').textContent=1;">Сагсанд нэмэх</button>
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <h2 class="section-title" style="margin-bottom:20px;">Санал болгох бүтээгдэхүүн</h2>
        <div class="prod-grid">${PRODUCTS.filter(x=>x.category===p.category && x.id!==p.id).concat(PRODUCTS.filter(x=>x.id!==p.id)).slice(0,4).map(productCard).join('')}</div>
      </div>
    </section>
  `;
}
function changePdQty(d){
  pdQty = Math.max(1, pdQty+d);
  document.getElementById('pdQtyLabel').textContent = pdQty;
}

/* ============ PAGE: ABOUT ============ */
function renderAbout(){
  app.innerHTML = `
    <div class="wrap page-hero">
      <div class="breadcrumb"><a href="#/">Нүүр</a> / Бидний тухай</div>
      <h1>Зөвхөн цэвэрийг, хайртай үрсдээ</h1>
    </div>
    <section>
      <div class="wrap">
        <div class="about-block">
          <div class="about-visual" style="background:linear-gradient(135deg,#E7EEDA,#DDE7C9);">🌿</div>
          <div class="about-text">
            <div class="eyebrow">Эрхэм зорилго</div>
            <h2 class="section-title">Байгальд ба хүүхдэд ээлтэй</h2>
            <p>eotton mongolia нь 0-3 насны хүүхдэд зориулсан цэвэр органик хөвөн хувцасны онлайн дэлгүүр юм.</p>
            <p>Манай бүх бүтээгдэхүүн GOTS сертификаттай 100% органик хөвөнгөөр хийгддэг бөгөөд химийн будаг, хортой бодис огт ашигладаггүй.</p>
          </div>
        </div>
        <div class="about-block rev">
          <div class="about-visual" style="background:linear-gradient(135deg,#FBEFE2,#F7E3E7);">🧵</div>
          <div class="about-text">
            <div class="eyebrow">Үйлдвэрлэл</div>
            <h2 class="section-title">Гараар хийсэн, чанарын хяналттай</h2>
            <p>Манай бүтээгдэхүүн бүр жижиг цехэд гараар оёгдож, эцсийн бүтээгдэхүүн хүртэл чанарын хяналт тавигддаг.</p>
          </div>
        </div>
        <div class="about-block">
          <div class="about-visual" style="background:linear-gradient(135deg,#E4E9DD,#DCE8A6);">💚</div>
          <div class="about-text">
            <div class="eyebrow">Тогтвортой хөгжил</div>
            <h2 class="section-title">Байгальд ээлтэй сонголт</h2>
            <p>Органик хөвөн тариалалт нь хөрс, ус, орчны экосистемд ээлтэй бөгөөд бид энэ зарчмыг үйлдвэрлэлийн бүх шатанд баримталдаг.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ============ PAGE: BLOG ============ */
function renderBlogList(){
  app.innerHTML = `
    <div class="wrap page-hero">
      <div class="breadcrumb"><a href="#/">Нүүр</a> / Блог</div>
      <h1>Блог</h1>
      <p class="section-sub" style="margin-top:10px;">Органик материал, хүүхдийн арьсны арчилгаа, брэндийн мэдээллийг хуваалцаж байна.</p>
    </div>
    <section>
      <div class="wrap">
        <div class="blog-grid">
          ${BLOG.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(b=>`
            <div class="blog-card" onclick="go('#/blog/${b.id}')">
              <div class="blog-img">${b.icon}</div>
              <div class="blog-body">
                <div class="blog-date">${b.date}</div>
                <div class="blog-title">${b.title}</div>
                <div class="blog-excerpt">${b.excerpt}</div>
              </div>
            </div>`).join('') || loadingHTML()}
        </div>
      </div>
    </section>
  `;
}
function renderBlogPost(id){
  const b = BLOG.find(x=>x.id===id);
  if(!b){ renderBlogList(); return; }
  app.innerHTML = `
    <div class="wrap page-hero">
      <div class="breadcrumb"><a href="#/">Нүүр</a> / <a href="#/blog">Блог</a> / ${b.title}</div>
      <h1 style="font-size:28px;">${b.title}</h1>
      <p class="section-sub">${b.date}</p>
    </div>
    <section>
      <div class="wrap">
        <div class="blog-img" style="max-width:720px; margin:0 auto 30px; border-radius:var(--radius);">${b.icon}</div>
        <div class="article-body">
          ${(b.body||'').split('\n\n').map(p=>`<p>${p}</p>`).join('')}
        </div>
      </div>
    </section>
  `;
}

/* ============ PAGE: FAQ ============ */
function renderFAQ(){
  app.innerHTML = `
    <div class="wrap page-hero">
      <div class="breadcrumb"><a href="#/">Нүүр</a> / FAQ</div>
      <h1>Түгээмэл асуулт хариулт</h1>
    </div>
    <section>
      <div class="wrap" style="max-width:760px; margin:0 auto;">
        ${FAQS.map((f,i)=>`
          <div class="faq-item" id="faq-${i}">
            <div class="faq-q" onclick="toggleFaq(${i})"><span>${f.q}</span><span class="chev">+</span></div>
            <div class="faq-a">${f.a}</div>
          </div>`).join('') || loadingHTML()}
      </div>
    </section>
  `;
}
function toggleFaq(i){ document.getElementById('faq-'+i).classList.toggle('open'); }

/* ============ PAGE: CART ============ */
function renderCart(){
  if(CART.length===0){
    app.innerHTML = `
      <div class="wrap page-hero"><h1>Таны сагс</h1></div>
      <section><div class="wrap"><div class="empty-state"><div class="em-icon">🛍️</div>Таны сагс хоосон байна.<br><br><a class="btn-primary" style="display:inline-block; margin-top:6px;" href="#/catalog">Дэлгүүр рүү очих</a></div></div></section>`;
    return;
  }
  const items = CART.map(ci=>({...ci, p: PRODUCTS.find(p=>p.id===ci.productId)})).filter(i=>i.p);
  const subtotal = items.reduce((s,i)=>s+i.p.price*i.qty,0);
  const shipping = subtotal>0? 8000 : 0;
  const total = subtotal+shipping;

  app.innerHTML = `
    <div class="wrap page-hero"><h1>Таны сагс</h1></div>
    <section style="padding-top:10px;">
      <div class="wrap cart-layout">
        <div class="cart-items">
          ${items.map(i=>`
            <div class="cart-row">
              <div class="cart-thumb">${i.p.icon}</div>
              <div class="cart-info">
                <div class="cart-name">${i.p.name}</div>
                <div class="cart-cat">${catName(i.p.category)}</div>
                <button class="cart-remove" onclick="removeFromCart('${i.p.id}')">Хасах</button>
              </div>
              <div class="qty-box">
                <button onclick="setCartQty('${i.p.id}', ${i.qty-1})">−</button>
                <span>${i.qty}</span>
                <button onclick="setCartQty('${i.p.id}', ${i.qty+1})">+</button>
              </div>
              <div style="width:90px; text-align:right; font-weight:700; font-size:14px;">${fmt(i.p.price*i.qty)}</div>
            </div>`).join('')}
        </div>
        <div class="cart-summary">
          <h3 style="font-size:17px; margin-bottom:16px;">Захиалгын дүн</h3>
          <div class="sum-row"><span>Дэд дүн</span><span>${fmt(subtotal)}</span></div>
          <div class="sum-row"><span>Хүргэлт</span><span>${fmt(shipping)}</span></div>
          <div class="sum-total"><span>Нийт</span><span>${fmt(total)}</span></div>
          <button class="btn-primary" style="width:100%; margin-top:20px;" onclick="go('#/checkout')">Захиалах</button>
        </div>
      </div>
    </section>
  `;
}

/* ============ PAGE: CHECKOUT ============ */
function paymentInfoBox(){
  return `
    <div style="background:var(--cream-2); border:1px dashed var(--sage); border-radius:12px; padding:16px 18px; margin-top:20px;">
      <div style="font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--green-mid); margin-bottom:10px;">💳 Төлбөр шилжүүлэх данс</div>
      <div style="font-size:14px; line-height:1.9;">
        <div><b>Банк:</b> ${SETTINGS.bankName}</div>
        <div><b>Дансны дугаар:</b> ${SETTINGS.accountNumber}</div>
        <div><b>Хүлээн авагч:</b> ${SETTINGS.accountHolder}</div>
      </div>
      <div style="font-size:12.5px; color:var(--ink-soft); margin-top:10px; line-height:1.6;">${SETTINGS.paymentNote}</div>
    </div>`;
}
function renderCheckout(){
  if(CART.length===0){ go('#/cart'); return; }
  const items = CART.map(ci=>({...ci, p: PRODUCTS.find(p=>p.id===ci.productId)})).filter(i=>i.p);
  const subtotal = items.reduce((s,i)=>s+i.p.price*i.qty,0);
  const shipping = 8000;
  const total = subtotal+shipping;

  app.innerHTML = `
    <div class="wrap page-hero"><h1>Захиалга баталгаажуулах</h1></div>
    <section style="padding-top:10px;">
      <div class="wrap" style="max-width:560px; margin:0 auto;">
        <div class="auth-card">
          <div id="checkoutMsg"></div>
          <div class="field"><label>Хүлээн авагчийн нэр</label><input id="coName" value="${CURRENT_PROFILE? CURRENT_PROFILE.name : ''}"></div>
          <div class="field"><label>Утасны дугаар</label><input id="coPhone" placeholder="99001122"></div>
          <div class="field"><label>Хүргэлтийн хаяг</label><textarea id="coAddress" rows="3" placeholder="Дүүрэг, хороо, байр, тоот"></textarea></div>
          <div class="sum-row"><span>Дэд дүн</span><span>${fmt(subtotal)}</span></div>
          <div class="sum-row"><span>Хүргэлт</span><span>${fmt(shipping)}</span></div>
          <div class="sum-total"><span>Нийт төлөх</span><span>${fmt(total)}</span></div>
          ${paymentInfoBox()}
          <button class="btn-primary" style="width:100%; margin-top:20px;" id="placeOrderBtn" onclick="placeOrder(${total})">Захиалга баталгаажуулах</button>
        </div>
      </div>
    </section>
  `;
}
async function placeOrder(total){
  const name = document.getElementById('coName').value.trim();
  const phone = document.getElementById('coPhone').value.trim();
  const address = document.getElementById('coAddress').value.trim();
  const msgEl = document.getElementById('checkoutMsg');
  if(!name||!phone||!address){
    msgEl.innerHTML = `<div class="form-msg err">Бүх талбарыг бөглөнө үү.</div>`;
    return;
  }
  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true; btn.textContent = 'Илгээж байна...';
  try{
    const order = {
      customerUid: CURRENT_USER ? CURRENT_USER.uid : null,
      name, phone, address,
      email: CURRENT_USER ? CURRENT_USER.email : '',
      items: CART.map(ci=>{ const p=PRODUCTS.find(x=>x.id===ci.productId); return {name:p?p.name:'', qty:ci.qty, price:p?p.price:0}; }),
      total,
      status:'Хүлээгдэж буй',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().slice(0,10)
    };
    const ref = await db.collection('orders').add(order);
    CART = [];
    saveCart();
    app.innerHTML = `
      <div class="wrap" style="padding:70px 0 90px; text-align:center;">
        <div style="font-size:56px; margin-bottom:14px;">✅</div>
        <h1 style="font-size:26px;">Захиалга амжилттай баталгаажлаа!</h1>
        <p class="section-sub" style="margin:14px auto 26px;">Захиалгын дугаар: ${ref.id.slice(0,8)}. Одоо дараах дансанд төлбөрөө шилжүүлнэ үү — бид шилжүүлгийг хараад захиалгыг боловсруулж эхэлнэ.</p>
        <div style="max-width:420px; margin:0 auto; text-align:left;">${paymentInfoBox()}</div>
        <a class="btn-primary" style="display:inline-block; margin-top:30px;" href="#/catalog">Дэлгүүр рүү буцах</a>
      </div>`;
  }catch(e){
    console.error(e);
    msgEl.innerHTML = `<div class="form-msg err">Захиалга илгээхэд алдаа гарлаа. Firebase тохиргоо болон Firestore rules-оо шалгана уу.</div>`;
    btn.disabled = false; btn.textContent = 'Захиалга баталгаажуулах';
  }
}

/* ============ PAGE: LOGIN / REGISTER / ACCOUNT ============ */
function renderLogin(){
  app.innerHTML = `
    <section style="padding:70px 0;">
      <div class="wrap">
        <div class="auth-card">
          <h2>Нэвтрэх</h2>
          <div class="sub">Бүртгэлтэй имэйл хаягаараа нэвтэрнэ үү.</div>
          <div id="loginMsg"></div>
          <div class="field"><label>Имэйл</label><input id="loginEmail" type="email" placeholder="you@example.com"></div>
          <div class="field"><label>Нууц үг</label><input id="loginPass" type="password" placeholder="••••••••"></div>
          <button class="btn-primary" style="width:100%;" id="loginBtn" onclick="doLogin()">Нэвтрэх</button>
          <div class="auth-switch">Бүртгэлгүй юу? <a href="#/register">Бүртгүүлэх</a></div>
        </div>
      </div>
    </section>`;
}
async function doLogin(){
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const msgEl = document.getElementById('loginMsg');
  const btn = document.getElementById('loginBtn');
  if(!email||!pass){ msgEl.innerHTML = `<div class="form-msg err">Имэйл болон нууц үгээ оруулна уу.</div>`; return; }
  btn.disabled = true; btn.textContent = 'Нэвтэрч байна...';
  try{
    await loginCustomer(email, pass);
    flashToast('Тавтай морил!');
    go('#/account');
  }catch(e){
    msgEl.innerHTML = `<div class="form-msg err">Имэйл эсвэл нууц үг буруу байна.</div>`;
    btn.disabled = false; btn.textContent = 'Нэвтрэх';
  }
}
function renderRegister(){
  app.innerHTML = `
    <section style="padding:70px 0;">
      <div class="wrap">
        <div class="auth-card">
          <h2>Бүртгүүлэх</h2>
          <div class="sub">Захиалгаа хянах шинэ бүртгэл үүсгэнэ үү.</div>
          <div id="regMsg"></div>
          <div class="field"><label>Нэр</label><input id="regName" placeholder="Таны нэр"></div>
          <div class="field"><label>Имэйл</label><input id="regEmail" type="email" placeholder="you@example.com"></div>
          <div class="field"><label>Нууц үг (6+ тэмдэгт)</label><input id="regPass" type="password" placeholder="••••••••"></div>
          <button class="btn-primary" style="width:100%;" id="regBtn" onclick="doRegister()">Бүртгүүлэх</button>
          <div class="auth-switch">Бүртгэлтэй юу? <a href="#/login">Нэвтрэх</a></div>
        </div>
      </div>
    </section>`;
}
async function doRegister(){
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const msgEl = document.getElementById('regMsg');
  const btn = document.getElementById('regBtn');
  if(!name||!email||!pass){ msgEl.innerHTML = `<div class="form-msg err">Бүх талбарыг бөглөнө үү.</div>`; return; }
  btn.disabled = true; btn.textContent = 'Үүсгэж байна...';
  try{
    await registerCustomer(name, email, pass);
    flashToast('Бүртгэл үүслээ, тавтай морил!');
    go('#/account');
  }catch(e){
    let msg = 'Бүртгэл үүсгэхэд алдаа гарлаа.';
    if(e.code==='auth/email-already-in-use') msg = 'Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна.';
    if(e.code==='auth/weak-password') msg = 'Нууц үг хэт богино байна (6-с дээш тэмдэгт байх).';
    msgEl.innerHTML = `<div class="form-msg err">${msg}</div>`;
    btn.disabled = false; btn.textContent = 'Бүртгүүлэх';
  }
}
async function renderAccount(){
  await authReadyPromise;
  if(!CURRENT_USER){ go('#/login'); return; }
  app.innerHTML = loadingHTML();
  let myOrders = [];
  try{
    const snap = await db.collection('orders').where('customerUid','==',CURRENT_USER.uid).get();
    myOrders = snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  }catch(e){ console.error(e); }
  app.innerHTML = `
    <div class="wrap page-hero"><h1>Миний бүртгэл</h1></div>
    <section style="padding-top:10px;">
      <div class="wrap" style="max-width:640px; margin:0 auto;">
        <div class="auth-card" style="margin-bottom:24px;">
          <h2 style="font-size:18px;">${CURRENT_PROFILE ? CURRENT_PROFILE.name : CURRENT_USER.email}</h2>
          <div class="sub">${CURRENT_USER.email}</div>
          <button class="btn-secondary" onclick="logoutUser()">Гарах</button>
        </div>
        <h3 style="font-size:16px; margin-bottom:12px;">Захиалгын түүх</h3>
        ${myOrders.length? myOrders.map(o=>`
          <div class="cart-row" style="align-items:flex-start;">
            <div class="cart-info">
              <div class="cart-name">${o.id.slice(0,8)} — ${o.date}</div>
              <div class="cart-cat">${(o.items||[]).map(i=>i.name+' ×'+i.qty).join(', ')}</div>
              <div style="margin-top:4px;"><span class="pill-status">${o.status}</span></div>
            </div>
            <div style="font-weight:700;">${fmt(o.total)}</div>
          </div>`).join('') : `<p class="section-sub">Захиалгын түүх байхгүй байна.</p>`}
      </div>
    </section>`;
}

/* ============ ADMIN ============ */
async function renderAdmin(tab){
  await authReadyPromise;
  if(!CURRENT_USER || !IS_ADMIN){ renderAdminLogin(); return; }
  const tabs = [
    {id:'dashboard', label:'Хянах самбар'},
    {id:'products', label:'Бүтээгдэхүүн'},
    {id:'orders', label:'Захиалгууд'},
    {id:'blog', label:'Блог'},
    {id:'faq', label:'FAQ'},
    {id:'users', label:'Хэрэглэгчид'},
    {id:'settings', label:'Тохиргоо'},
  ];
  app.innerHTML = `
    <div class="admin-layout">
      <div class="admin-side">
        ${tabs.map(t=>`<button class="${tab===t.id?'on':''}" onclick="go('#/admin/${t.id}')">${t.label}</button>`).join('')}
        <button style="color:#C0392B; margin-top:20px;" onclick="logoutUser()">Гарах</button>
      </div>
      <div class="admin-main" id="adminMain">${loadingHTML()}</div>
    </div>`;
  const main = document.getElementById('adminMain');
  if(tab==='dashboard') await renderAdminDashboard(main);
  else if(tab==='products') renderAdminProducts(main);
  else if(tab==='orders') await renderAdminOrders(main);
  else if(tab==='blog') renderAdminBlog(main);
  else if(tab==='faq') renderAdminFaq(main);
  else if(tab==='users') await renderAdminUsers(main);
  else if(tab==='settings') renderAdminSettings(main);
  else await renderAdminDashboard(main);
}

function renderAdminLogin(){
  app.innerHTML = `
    <section style="padding:70px 0;">
      <div class="wrap">
        <div class="auth-card">
          <h2>Админ нэвтрэх</h2>
          <div class="sub">Энэ хэсэг зөвхөн дэлгүүрийн эзэнд зориулагдсан хязгаарлагдмал хэсэг.</div>
          <div id="adminMsg"></div>
          <div class="field"><label>Нууц үг</label><input id="adminPass" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter'){doAdminLogin();}"></div>
          <button class="btn-primary" style="width:100%;" id="adminLoginBtn" onclick="doAdminLogin()">Нэвтрэх</button>
        </div>
      </div>
    </section>`;
  const passField = document.getElementById('adminPass');
  if(passField) passField.focus();
}
async function doAdminLogin(){
  const pass = document.getElementById('adminPass').value;
  const msgEl = document.getElementById('adminMsg');
  const btn = document.getElementById('adminLoginBtn');
  if(!pass){ msgEl.innerHTML = `<div class="form-msg err">Нууц үгээ оруулна уу.</div>`; return; }
  btn.disabled = true; btn.textContent = 'Шалгаж байна...';
  try{
    const res = await fetch('/.netlify/functions/admin-login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({password: pass})
    });
    const data = await res.json();
    if(!data.ok){
      msgEl.innerHTML = `<div class="form-msg err">${data.error || 'Нууц үг буруу байна.'}</div>`;
      btn.disabled = false; btn.textContent = 'Нэвтрэх';
      return;
    }
    await auth.signInWithCustomToken(data.token);
    IS_ADMIN = true;
    flashToast('Тавтай морил!');
    go('#/admin/dashboard');
  }catch(e){
    console.error(e);
    msgEl.innerHTML = `<div class="form-msg err">Холболтын алдаа гарлаа. Дахин оролдоно уу.</div>`;
    btn.disabled = false; btn.textContent = 'Нэвтрэх';
  }
}

async function renderAdminDashboard(main){
  const ordersSnap = await db.collection('orders').get();
  const orders = ordersSnap.docs.map(d=>d.data());
  const revenue = orders.reduce((s,o)=>s+(o.total||0),0);
  const usersSnap = await db.collection('customers').get();
  main.innerHTML = `
    <div class="admin-topbar"><h2 style="font-size:22px;">Хянах самбар</h2></div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num">${PRODUCTS.length}</div><div class="stat-label">Бүтээгдэхүүн</div></div>
      <div class="stat-card"><div class="stat-num">${orders.length}</div><div class="stat-label">Захиалга</div></div>
      <div class="stat-card"><div class="stat-num">${usersSnap.size}</div><div class="stat-label">Хэрэглэгч</div></div>
      <div class="stat-card"><div class="stat-num">${fmt(revenue)}</div><div class="stat-label">Нийт орлого</div></div>
    </div>
    <h3 style="font-size:16px; margin-bottom:12px;">Сүүлийн захиалгууд</h3>
    <table class="admin-table">
      <tr><th>Дугаар</th><th>Огноо</th><th>Хэрэглэгч</th><th>Дүн</th><th>Төлөв</th></tr>
      ${orders.slice(-5).reverse().map(o=>`<tr><td>${(o.id||'').slice(0,8)}</td><td>${o.date}</td><td>${o.name}</td><td>${fmt(o.total)}</td><td><span class="pill-status">${o.status}</span></td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center; color:var(--ink-soft);">Захиалга алга байна</td></tr>'}
    </table>`;
}

function renderAdminProducts(main){
  main.innerHTML = `
    <div class="admin-topbar">
      <h2 style="font-size:22px;">Бүтээгдэхүүн</h2>
      <button class="btn-primary" onclick="openProductModal()">+ Бүтээгдэхүүн нэмэх</button>
    </div>
    <table class="admin-table">
      <tr><th></th><th>Нэр</th><th>Ангилал</th><th>Үнэ</th><th>Үлдэгдэл</th><th></th></tr>
      ${PRODUCTS.map(p=>`
        <tr>
          <td><div class="row-thumb">${p.icon}</div></td>
          <td>${p.name}</td>
          <td>${catName(p.category)}</td>
          <td>${fmt(p.price)}</td>
          <td><span class="pill-status ${p.stock<10?'low':''}">${p.stock} ш</span></td>
          <td>
            <button class="icon-link" onclick='openProductModal(${JSON.stringify(p.id)})'>Засах</button>
            <button class="icon-link del" onclick="deleteProduct('${p.id}')">Устгах</button>
          </td>
        </tr>`).join('')}
    </table>`;
}
function openProductModal(id){
  const p = id ? PRODUCTS.find(x=>x.id===id) : null;
  const bg = document.createElement('div');
  bg.className = 'admin-modal-bg';
  bg.innerHTML = `
    <div class="admin-modal">
      <h3>${p?'Бүтээгдэхүүн засах':'Шинэ бүтээгдэхүүн'}</h3>
      <div class="field"><label>Нэр</label><input id="mName" value="${p?p.name:''}"></div>
      <div class="field"><label>Ангилал</label>
        <select id="mCat">${CATS.map(c=>`<option value="${c.id}" ${p&&p.category===c.id?'selected':''}>${c.name}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Үнэ (₮)</label><input id="mPrice" type="number" value="${p?p.price:''}"></div>
      <div class="field"><label>Хуучин үнэ (заавал биш)</label><input id="mOldPrice" type="number" value="${p&&p.oldPrice?p.oldPrice:''}"></div>
      <div class="field"><label>Үлдэгдэл тоо</label><input id="mStock" type="number" value="${p?p.stock:20}"></div>
      <div class="field"><label>Эможи зураг</label><input id="mIcon" value="${p?p.icon:'👕'}"></div>
      <div class="field"><label>Тайлбар</label><textarea id="mDesc" rows="3">${p?p.desc:''}</textarea></div>
      <div class="modal-actions">
        <button class="btn-ghost" onclick="this.closest('.admin-modal-bg').remove()">Цуцлах</button>
        <button class="btn-primary" onclick="saveProduct(${p?`'${p.id}'`:'null'})">Хадгалах</button>
      </div>
    </div>`;
  document.body.appendChild(bg);
}
async function saveProduct(id){
  const name = document.getElementById('mName').value.trim();
  const category = document.getElementById('mCat').value;
  const price = parseInt(document.getElementById('mPrice').value)||0;
  const oldPrice = parseInt(document.getElementById('mOldPrice').value)||0;
  const stock = parseInt(document.getElementById('mStock').value)||0;
  const icon = document.getElementById('mIcon').value.trim()||'👕';
  const desc = document.getElementById('mDesc').value.trim();
  if(!name||!price){ flashToast('Нэр болон үнийг бөглөнө үү'); return; }
  const data = {name,category,price,oldPrice,stock,icon,desc,badge: id? (PRODUCTS.find(x=>x.id===id).badge||'') : ''};
  try{
    if(id){ await db.collection('products').doc(id).set(data,{merge:true}); }
    else{ await db.collection('products').add(data); }
    PRODUCTS = await fetchAll('products');
    document.querySelector('.admin-modal-bg').remove();
    flashToast('Хадгалагдлаа ✓');
    renderAdmin('products');
  }catch(e){ console.error(e); flashToast('Алдаа гарлаа — Firestore rules-оо шалгана уу'); }
}
async function deleteProduct(id){
  if(!confirm('Энэ бүтээгдэхүүнийг устгах уу?')) return;
  await db.collection('products').doc(id).delete();
  PRODUCTS = await fetchAll('products');
  renderAdmin('products');
}

async function renderAdminOrders(main){
  const snap = await db.collection('orders').get();
  const orders = snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  main.innerHTML = `
    <div class="admin-topbar"><h2 style="font-size:22px;">Захиалгууд</h2></div>
    <table class="admin-table">
      <tr><th>Дугаар</th><th>Огноо</th><th>Хэрэглэгч</th><th>Утас</th><th>Дүн</th><th>Төлөв</th></tr>
      ${orders.map(o=>`
        <tr>
          <td>${o.id.slice(0,8)}</td><td>${o.date}</td><td>${o.name}</td><td>${o.phone}</td><td>${fmt(o.total)}</td>
          <td>
            <select onchange="updateOrderStatus('${o.id}', this.value)">
              ${['Хүлээгдэж буй','Баталгаажсан','Хүргэгдсэн','Цуцлагдсан'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </td>
        </tr>`).join('') || '<tr><td colspan="6" style="text-align:center; color:var(--ink-soft);">Захиалга алга байна</td></tr>'}
    </table>`;
}
async function updateOrderStatus(id, status){
  await db.collection('orders').doc(id).set({status},{merge:true});
  flashToast('Төлөв шинэчлэгдлээ');
}

function renderAdminBlog(main){
  main.innerHTML = `
    <div class="admin-topbar">
      <h2 style="font-size:22px;">Блог нийтлэл</h2>
      <button class="btn-primary" onclick="openBlogModal()">+ Нийтлэл нэмэх</button>
    </div>
    <table class="admin-table">
      <tr><th></th><th>Гарчиг</th><th>Огноо</th><th></th></tr>
      ${BLOG.map(b=>`
        <tr>
          <td><div class="row-thumb">${b.icon}</div></td>
          <td>${b.title}</td>
          <td>${b.date}</td>
          <td>
            <button class="icon-link" onclick='openBlogModal(${JSON.stringify(b.id)})'>Засах</button>
            <button class="icon-link del" onclick="deleteBlog('${b.id}')">Устгах</button>
          </td>
        </tr>`).join('')}
    </table>`;
}
function openBlogModal(id){
  const b = id ? BLOG.find(x=>x.id===id) : null;
  const bg = document.createElement('div');
  bg.className = 'admin-modal-bg';
  bg.innerHTML = `
    <div class="admin-modal">
      <h3>${b?'Нийтлэл засах':'Шинэ нийтлэл'}</h3>
      <div class="field"><label>Гарчиг</label><input id="bTitle" value="${b?b.title:''}"></div>
      <div class="field"><label>Огноо</label><input id="bDate" type="date" value="${b?b.date:new Date().toISOString().slice(0,10)}"></div>
      <div class="field"><label>Эможи зураг</label><input id="bIcon" value="${b?b.icon:'📝'}"></div>
      <div class="field"><label>Товч танилцуулга</label><textarea id="bExcerpt" rows="2">${b?b.excerpt:''}</textarea></div>
      <div class="field"><label>Нийтлэлийн бүтэн агуулга</label><textarea id="bBody" rows="6">${b?b.body:''}</textarea></div>
      <div class="modal-actions">
        <button class="btn-ghost" onclick="this.closest('.admin-modal-bg').remove()">Цуцлах</button>
        <button class="btn-primary" onclick="saveBlog(${b?`'${b.id}'`:'null'})">Хадгалах</button>
      </div>
    </div>`;
  document.body.appendChild(bg);
}
async function saveBlog(id){
  const title = document.getElementById('bTitle').value.trim();
  const date = document.getElementById('bDate').value;
  const icon = document.getElementById('bIcon').value.trim()||'📝';
  const excerpt = document.getElementById('bExcerpt').value.trim();
  const body = document.getElementById('bBody').value.trim();
  if(!title){ flashToast('Гарчиг оруулна уу'); return; }
  const data = {title,date,icon,excerpt,body};
  if(id){ await db.collection('blog').doc(id).set(data,{merge:true}); }
  else{ await db.collection('blog').add(data); }
  BLOG = await fetchAll('blog');
  document.querySelector('.admin-modal-bg').remove();
  flashToast('Хадгалагдлаа ✓');
  renderAdmin('blog');
}
async function deleteBlog(id){
  if(!confirm('Энэ нийтлэлийг устгах уу?')) return;
  await db.collection('blog').doc(id).delete();
  BLOG = await fetchAll('blog');
  renderAdmin('blog');
}

function renderAdminFaq(main){
  main.innerHTML = `
    <div class="admin-topbar">
      <h2 style="font-size:22px;">Асуулт хариулт (FAQ)</h2>
      <button class="btn-primary" onclick="openFaqModal()">+ Асуулт нэмэх</button>
    </div>
    <table class="admin-table">
      <tr><th>Асуулт</th><th></th></tr>
      ${FAQS.map(f=>`
        <tr>
          <td>${f.q}</td>
          <td>
            <button class="icon-link" onclick='openFaqModal(${JSON.stringify(f.id)})'>Засах</button>
            <button class="icon-link del" onclick="deleteFaq('${f.id}')">Устгах</button>
          </td>
        </tr>`).join('')}
    </table>`;
}
function openFaqModal(id){
  const f = id ? FAQS.find(x=>x.id===id) : null;
  const bg = document.createElement('div');
  bg.className = 'admin-modal-bg';
  bg.innerHTML = `
    <div class="admin-modal">
      <h3>${f?'Асуулт засах':'Шинэ асуулт'}</h3>
      <div class="field"><label>Асуулт</label><input id="fQ" value="${f?f.q:''}"></div>
      <div class="field"><label>Хариулт</label><textarea id="fA" rows="4">${f?f.a:''}</textarea></div>
      <div class="modal-actions">
        <button class="btn-ghost" onclick="this.closest('.admin-modal-bg').remove()">Цуцлах</button>
        <button class="btn-primary" onclick="saveFaq(${f?`'${f.id}'`:'null'})">Хадгалах</button>
      </div>
    </div>`;
  document.body.appendChild(bg);
}
async function saveFaq(id){
  const q = document.getElementById('fQ').value.trim();
  const a = document.getElementById('fA').value.trim();
  if(!q||!a){ flashToast('Асуулт болон хариултаа бөглөнө үү'); return; }
  if(id){ await db.collection('faqs').doc(id).set({q,a},{merge:true}); }
  else{ await db.collection('faqs').add({q,a}); }
  FAQS = await fetchAll('faqs');
  document.querySelector('.admin-modal-bg').remove();
  flashToast('Хадгалагдлаа ✓');
  renderAdmin('faq');
}
async function deleteFaq(id){
  if(!confirm('Энэ асуултыг устгах уу?')) return;
  await db.collection('faqs').doc(id).delete();
  FAQS = await fetchAll('faqs');
  renderAdmin('faq');
}

async function renderAdminUsers(main){
  const snap = await db.collection('customers').get();
  const users = snap.docs.map(d=>({id:d.id, ...d.data()}));
  main.innerHTML = `
    <div class="admin-topbar"><h2 style="font-size:22px;">Хэрэглэгчид</h2></div>
    <table class="admin-table">
      <tr><th>Нэр</th><th>Имэйл</th><th>Бүртгүүлсэн</th></tr>
      ${users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.joined}</td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--ink-soft);">Хэрэглэгч алга байна</td></tr>'}
    </table>`;
}

function renderAdminSettings(main){
  main.innerHTML = `
    <div class="admin-topbar"><h2 style="font-size:22px;">Төлбөрийн тохиргоо</h2></div>
    <div style="max-width:480px;">
      <p class="section-sub" style="margin-bottom:20px;">Одоогоор захиалгыг дансаар шилжүүлэх байдлаар хийж байна. Ирээдүйд QPay зэрэг автомат систем нэмэхэд бэлэн бүтэцтэй.</p>
      <div class="field"><label>Банкны нэр</label><input id="sBank" value="${SETTINGS.bankName}"></div>
      <div class="field"><label>Дансны дугаар</label><input id="sAccNum" value="${SETTINGS.accountNumber}"></div>
      <div class="field"><label>Хүлээн авагчийн нэр</label><input id="sAccHolder" value="${SETTINGS.accountHolder}"></div>
      <div class="field"><label>Төлбөрийн зааварчилгаа</label><textarea id="sNote" rows="4">${SETTINGS.paymentNote}</textarea></div>
      <button class="btn-primary" onclick="saveSettings()">Хадгалах</button>
      <div id="settingsMsg" style="margin-top:14px;"></div>
    </div>`;
}
async function saveSettings(){
  SETTINGS.bankName = document.getElementById('sBank').value.trim();
  SETTINGS.accountNumber = document.getElementById('sAccNum').value.trim();
  SETTINGS.accountHolder = document.getElementById('sAccHolder').value.trim();
  SETTINGS.paymentNote = document.getElementById('sNote').value.trim();
  await db.collection('settings').doc('payment').set(SETTINGS,{merge:true});
  document.getElementById('settingsMsg').innerHTML = `<div class="form-msg ok">Хадгалагдлаа ✓</div>`;
  flashToast('Төлбөрийн мэдээлэл шинэчлэгдлээ');
}

/* ============ BOOT ============ */
(async function boot(){
  loadCart();
  updateCartBadge();
  document.getElementById('burgerBtn').addEventListener('click', ()=>{
    document.getElementById('mainNav').classList.toggle('open');
  });
  app.innerHTML = loadingHTML('Дэлгүүрийг ачааллаж байна...');
  try{
    await loadStoreData();
  }catch(e){
    console.error(e);
    app.innerHTML = `<div class="wrap" style="padding:100px 0; text-align:center;">
      <h2>Firebase холбогдоход алдаа гарлаа</h2>
      <p class="section-sub" style="margin:12px auto;">firebase-config.js файл дахь тохиргоогоо шалгана уу (README.md-г үзнэ үү).</p>
    </div>`;
    return;
  }
  router();
})();
