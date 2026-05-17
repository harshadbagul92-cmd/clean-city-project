// ============================================================
//  CleanNashik — Complete JavaScript Backend
//  Features: Auth, Camera, GPS, Reports, Admin Portal,
//            Profiles, News, Tracker, Quiz, Charts, FAQ
// ============================================================

/* ──────────────── DATA STORE ──────────────── */
const DB = {
  get users()    { return JSON.parse(localStorage.getItem('cn_users')    || '[]'); },
  get reports()  { return JSON.parse(localStorage.getItem('cn_reports')  || '[]'); },
  get news()     { return JSON.parse(localStorage.getItem('cn_news')     || '[]'); },
  get offenders(){ return JSON.parse(localStorage.getItem('cn_offenders')|| '[]'); },
  get activity() { return JSON.parse(localStorage.getItem('cn_activity') || '[]'); },
  get current()  { return localStorage.getItem('cn_current')             || null;  },

  save(key, data){ localStorage.setItem('cn_' + key, JSON.stringify(data)); },
  addUser(u)     { const a = this.users;   a.push(u);   this.save('users', a); },
  addReport(r)   { const a = this.reports; a.push(r);   this.save('reports', a); },
  addNews(n)     { const a = this.news;    a.push(n);   this.save('news', a); },
  addOffender(o) { const a = this.offenders; a.push(o); this.save('offenders', a); },
  addActivity(t) {
    const a = this.activity;
    a.unshift({ text: t, time: new Date().toLocaleString() });
    if (a.length > 60) a.length = 60;
    this.save('activity', a);
  },
  updateReport(id, changes) {
    const a = this.reports;
    const i = a.findIndex(r => r.id === id);
    if (i > -1) { Object.assign(a[i], changes); this.save('reports', a); }
  },
  updateUser(name, changes) {
    const a = this.users;
    const i = a.findIndex(u => u.name.toLowerCase() === name.toLowerCase());
    if (i > -1) { Object.assign(a[i], changes); this.save('users', a); }
  },
  setCurrent(n)  { localStorage.setItem('cn_current', n); },
  clearCurrent() { localStorage.removeItem('cn_current'); }
};

/* ──────────────── SEED DATA ──────────────── */
function seedData() {
  if (DB.reports.length) return;

  DB.save('users', [
    { name: 'Ravi Patil',    points: 120, reports: 5, quizzes: 3, joined: new Date().toISOString() },
    { name: 'Priya Sharma',  points: 90,  reports: 4, quizzes: 2, joined: new Date().toISOString() },
    { name: 'Amit Gaikwad',  points: 65,  reports: 3, quizzes: 1, joined: new Date().toISOString() },
    { name: 'Sneha More',    points: 50,  reports: 2, quizzes: 2, joined: new Date().toISOString() },
  ]);

  DB.save('reports', [
    { id:'r1', name:'Ravi Patil',   area:'Panchavati',   landmark:'Near Ram Wadi', desc:'Overflowing garbage bin near the bridge.', severity:'high',   gps:'20.0059, 73.7897', image:null, status:'resolved', resolvedAt:'2 days ago', ts: new Date(Date.now()-172800000).toISOString() },
    { id:'r2', name:'Priya Sharma', area:'Nashik Road',  landmark:'Main Market',   desc:'Plastic bags scattered on road.', severity:'medium', gps:'20.0142, 73.7836', image:null, status:'pending',  ts: new Date(Date.now()-86400000).toISOString() },
    { id:'r3', name:'Amit Gaikwad', area:'Dwarka',       landmark:'Sector 5',      desc:'Construction debris dumped illegally.', severity:'high',   gps:'20.0211, 73.8102', image:null, status:'pending',  ts: new Date(Date.now()-43200000).toISOString() },
    { id:'r4', name:'Sneha More',   area:'College Road', landmark:'YCIS Gate',     desc:'Food waste left outside canteen.', severity:'low',    gps:'20.0088, 73.7751', image:null, status:'resolved', resolvedAt:'Yesterday',   ts: new Date(Date.now()-21600000).toISOString() },
  ]);

  DB.save('news', [
    { id:'n1', title:'NMC Launches New Recycling Drive', body:'Nashik Municipal Corporation announces a city-wide recycling initiative. Bring dry waste to the collection points every Saturday.', cat:'event', author:'Admin', date: new Date().toISOString() },
    { id:'n2', title:'Panchavati Clean-Up Drive Success!', body:'Over 200 citizens participated in last Sunday\'s clean-up drive in Panchavati. 1.2 tonnes of garbage was collected. Congratulations to all volunteers!', cat:'achievement', author:'Admin', date: new Date().toISOString() },
    { id:'n3', title:'New Dustbins Installed on College Road', body:'50 new colour-coded dustbins have been installed along College Road. Residents are urged to use them correctly and report any misuse.', cat:'update', author:'Admin', date: new Date().toISOString() },
  ]);

  DB.save('offenders', [
    { id:'o1', name:'Unknown Individual', area:'Nashik Road', desc:'Person filmed dumping household waste near the flyover at night.', date: new Date().toISOString() },
    { id:'o2', name:'Vehicle Owner MH-15-XX-0001', area:'Dwarka', desc:'Vehicle seen disposing construction waste illegally in Sector 5.', date: new Date().toISOString() },
  ]);

  DB.save('activity', [
    { text: '🚩 Ravi Patil reported garbage at <strong>Panchavati</strong> (High severity)', time: '2 days ago' },
    { text: '✅ Complaint at <strong>Panchavati</strong> by Ravi Patil was resolved.', time: '1 day ago' },
    { text: '🚩 Priya Sharma reported garbage at <strong>Nashik Road</strong> (Medium severity)', time: 'Yesterday' },
    { text: '🚩 Amit Gaikwad reported garbage at <strong>Dwarka</strong> (High severity)', time: '12 hours ago' },
    { text: '✅ Complaint at <strong>College Road</strong> by Sneha More was resolved.', time: '8 hours ago' },
  ]);
}

/* ──────────────── NAVIGATION ──────────────── */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const el = document.getElementById('page-' + page);
  if (el) { el.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  document.querySelectorAll('.nav-link').forEach(l => {
    if ((l.getAttribute('onclick') || '').includes("'" + page + "'")) l.classList.add('active');
  });

  // Page-specific inits
  const init = {
    home:       () => { animateStats(); renderHomeAreaCards(); renderHomeLB(); },
    report:     () => renderReportFeed(),
    segregation:() => initSeg(),
    tracker:    () => renderTracker(),
    news:       () => renderNews(),
    dashboard:  () => renderDashboard(),
    history:    () => renderHistory(),
    profile:    () => renderProfile(),
    contact:    () => renderFAQ(),
    admin:      () => { /* handled by login */ }
  };
  if (init[page]) init[page]();

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

/* ──────────────── TOAST ──────────────── */
function toast(msg, dur = 3200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ──────────────── AUTH MODAL ──────────────── */
function openAuth()  { document.getElementById('authModal').style.display = 'flex'; }
function closeAuth() { document.getElementById('authModal').style.display = 'none'; }

function switchAuth(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('regForm').style.display   = tab === 'reg'   ? 'block' : 'none';
  document.getElementById('asLogin').classList.toggle('active', tab === 'login');
  document.getElementById('asReg').classList.toggle('active',   tab === 'reg');
}

function registerUser() {
  const name = document.getElementById('rgName').value.trim();
  const msg  = document.getElementById('rgMsg');
  if (!name) { setMsg(msg, '⚠️ Please enter your name!', '#c0392b'); return; }

  const exists = DB.users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (exists) { setMsg(msg, '⚠️ Name already registered. Please login!', '#e67e22'); return; }

  DB.addUser({ name, points: 0, reports: 0, quizzes: 0, joined: new Date().toISOString() });
  DB.setCurrent(name);
  updateNavUser(name);
  setMsg(msg, `✅ Registered! Welcome, ${name}!`, '#2d7a2d');
  setTimeout(closeAuth, 1400);
  toast(`🌿 Welcome to CleanNashik, ${name}!`);
}

function loginUser() {
  const name = document.getElementById('liName').value.trim();
  const msg  = document.getElementById('liMsg');
  if (!name) { setMsg(msg, '⚠️ Please enter your name!', '#c0392b'); return; }

  const user = DB.users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) { setMsg(msg, '❌ Name not found. Please register first!', '#c0392b'); return; }

  DB.setCurrent(user.name);
  updateNavUser(user.name);
  setMsg(msg, `✅ Welcome back, ${user.name}!`, '#2d7a2d');
  setTimeout(closeAuth, 1200);
  toast(`🌿 Welcome back, ${user.name}!`);
}

function updateNavUser(name) {
  const chip = document.getElementById('userChip');
  const authBtn = document.getElementById('authBtn');
  chip.style.display = name ? 'flex' : 'none';
  authBtn.style.display = name ? 'none' : 'flex';
  if (name) {
    document.getElementById('ucAv').textContent = name.charAt(0).toUpperCase();
    document.getElementById('ucName').textContent = name.split(' ')[0];
  }
}

function setMsg(el, txt, color) {
  el.textContent = txt;
  el.style.color = color;
}

/* ──────────────── HOME PAGE ──────────────── */
function animateStats() {
  const rpts = DB.reports;
  const vals = [
    rpts.length,
    rpts.filter(r => r.status === 'resolved').length,
    DB.users.length,
    rpts.filter(r => r.status === 'resolved').length * 14
  ];
  ['st1','st2','st3','st4'].forEach((id, i) => countUp(id, vals[i]));
}

function countUp(id, target, ms = 1200) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / ms, 1);
    el.textContent = Math.round(p * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const AREAS = [
  { name: 'Panchavati',   icon: '🏙️' },
  { name: 'Nashik Road',  icon: '🛣️' },
  { name: 'Dwarka',       icon: '🏘️' },
  { name: 'College Road', icon: '🎓' }
];

function renderHomeAreaCards() {
  const grid = document.getElementById('homeAreaGrid');
  if (!grid) return;
  grid.innerHTML = AREAS.map(a => {
    const ar = DB.reports.filter(r => r.area === a.name);
    const pend = ar.filter(r => r.status === 'pending').length;
    const res  = ar.filter(r => r.status === 'resolved').length;
    const total = ar.length || 1;
    let stClass = 'st-clean', stLabel = '✅ Clean';
    if (pend >= 3) { stClass = 'st-dirty';    stLabel = '🔴 Needs Attention'; }
    else if (pend >= 1) { stClass = 'st-moderate'; stLabel = '🟡 Moderate'; }
    const pct = Math.round((res / total) * 100);
    const barColor = pct >= 80 ? '#2d7a2d' : pct >= 50 ? '#e67e22' : '#c0392b';
    return `
      <div class="area-status-card" onclick="showPage('tracker')">
        <div class="asc-top">
          <span class="asc-name">${a.icon} ${a.name}</span>
          <span class="asc-badge ${stClass}">${stLabel}</span>
        </div>
        <div class="asc-info">Reports: ${total-1} | Pending: ${pend} | Resolved: ${res}</div>
        <div class="asc-bar"><div class="asc-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
      </div>`;
  }).join('');
}

function renderHomeLB() {
  const el = document.getElementById('homeLB');
  if (!el) return;
  const sorted = DB.users.slice().sort((a, b) => b.points - a.points).slice(0, 5);
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
  el.innerHTML = sorted.length
    ? sorted.map((u, i) => `
        <div class="lb-row">
          <span class="lb-rank">${medals[i]}</span>
          <span class="lb-name">${u.name}</span>
          <span class="lb-meta">📋 ${u.reports || 0} reports</span>
          <span class="lb-pts">${u.points || 0} pts</span>
        </div>`).join('')
    : '<p style="text-align:center;color:var(--text-lt);padding:20px">Register and report to appear here!</p>';
}

/* ──────────────── TIPS CAROUSEL ──────────────── */
let tipIdx = 0;
function showTip(i) {
  document.querySelectorAll('.tip-sl').forEach((t, j) => t.classList.toggle('active-tip', j === i));
}
function nextTip() { const t = document.querySelectorAll('.tip-sl'); tipIdx = (tipIdx + 1) % t.length; showTip(tipIdx); }
function prevTip() { const t = document.querySelectorAll('.tip-sl'); tipIdx = (tipIdx - 1 + t.length) % t.length; showTip(tipIdx); }
setInterval(nextTip, 5000);

/* ──────────────── CAMERA ──────────────── */
let camStream = null, capturedImage = null;

function openCam() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
    .then(stream => {
      camStream = stream;
      const v = document.getElementById('camFeed');
      v.srcObject = stream;
      v.style.display = 'block';
      document.getElementById('snapBtn').style.display = 'flex';
      document.getElementById('camSnap').style.display = 'none';
      document.getElementById('retakeBtn').style.display = 'none';
      toast('📸 Camera opened! Position and snap.');
    })
    .catch(() => toast('❌ Camera access denied. Please allow camera permissions.'));
}

function snap() {
  const v = document.getElementById('camFeed');
  const c = document.getElementById('camCanvas');
  const img = document.getElementById('camSnap');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  capturedImage = c.toDataURL('image/jpeg', 0.75);
  img.src = capturedImage; img.style.display = 'block';
  v.style.display = 'none';
  document.getElementById('snapBtn').style.display = 'none';
  document.getElementById('retakeBtn').style.display = 'flex';
  stopCam();
  toast('✅ Photo captured!');
}

function retake() {
  capturedImage = null;
  document.getElementById('camSnap').style.display = 'none';
  document.getElementById('retakeBtn').style.display = 'none';
  openCam();
}

function stopCam() {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
}

function uploadPic(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    capturedImage = ev.target.result;
    const img = document.getElementById('camSnap');
    img.src = capturedImage; img.style.display = 'block';
    document.getElementById('camFeed').style.display = 'none';
    toast('📷 Photo uploaded!');
  };
  reader.readAsDataURL(file);
}

/* ──────────────── GPS ──────────────── */
function getGPS() {
  const out = document.getElementById('gpsOut');
  const val = document.getElementById('gpsVal');
  if (!navigator.geolocation) { out.textContent = '❌ Geolocation not supported.'; return; }
  out.textContent = '🔍 Detecting your location...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(5), lng = pos.coords.longitude.toFixed(5);
      val.value = `${lat}, ${lng}`;
      out.textContent = `✅ GPS: ${lat}, ${lng}`;
      toast('📍 Location detected!');
    },
    () => {
      out.textContent = '❌ Location access denied. Please enable GPS.';
      toast('❌ GPS access denied.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* ──────────────── SUBMIT REPORT ──────────────── */
function submitReport() {
  const name     = document.getElementById('rName').value.trim();
  const area     = document.getElementById('rArea').value;
  const landmark = document.getElementById('rLandmark').value.trim();
  const desc     = document.getElementById('rDesc').value.trim();
  const sev      = document.getElementById('rSev').value;
  const gps      = document.getElementById('gpsVal').value || 'Not detected';

  if (!name) { toast('⚠️ Please enter your name!');        return; }
  if (!area) { toast('⚠️ Please select an area!');         return; }
  if (!desc) { toast('⚠️ Please add a description!');      return; }

  const rpt = {
    id: 'r' + Date.now(), name, area, landmark, desc,
    severity: sev, gps, image: capturedImage || null,
    status: 'pending', ts: new Date().toISOString()
  };
  DB.addReport(rpt);

  // Award points
  const user = DB.users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (user) { DB.updateUser(name, { points: user.points + 20, reports: (user.reports || 0) + 1 }); }
  else { DB.addUser({ name, points: 20, reports: 1, quizzes: 0, joined: new Date().toISOString() }); }

  DB.addActivity(`🚩 ${name} reported garbage at <strong>${area}</strong> (${sev} severity)`);
  renderReportFeed();
  toast('✅ Report submitted! +20 points awarded');

  // Reset form
  ['rName','rLandmark','rDesc','gpsVal'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('rArea').value = '';
  document.getElementById('gpsOut').textContent = '';
  capturedImage = null;
  document.getElementById('camSnap').style.display = 'none';
  document.getElementById('camFeed').style.display = 'none';
  document.getElementById('snapBtn').style.display = 'none';
  document.getElementById('retakeBtn').style.display = 'none';
  stopCam();
}

function renderReportFeed() {
  const el = document.getElementById('reportFeed');
  if (!el) return;
  const rpts = DB.reports;
  if (!rpts.length) { el.innerHTML = '<p style="color:var(--text-lt);text-align:center;padding:24px">No reports yet. Be the first!</p>'; return; }
  el.innerHTML = rpts.slice().reverse().map(r => `
    <div class="rpt-item">
      ${r.image ? `<img src="${r.image}" alt="Report"/>` : ''}
      <div class="rpt-top">
        <span class="rpt-name">👤 ${r.name}</span>
        <span class="badge b-${r.status}">${r.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}</span>
      </div>
      <div class="rpt-area">📍 ${r.area}${r.landmark ? ' · ' + r.landmark : ''}</div>
      <div class="rpt-desc">${r.desc}</div>
      <div class="rpt-meta">
        <span class="b-${r.severity}">⚠️ ${r.severity.toUpperCase()}</span>
        <span>📡 ${r.gps}</span>
        <span>🕒 ${new Date(r.ts).toLocaleString()}</span>
        ${r.status === 'pending'
          ? `<button class="resolve-btn" onclick="resolveReport('${r.id}')">Mark Resolved</button>`
          : `<span style="color:#155724">✅ Resolved${r.resolvedAt ? ' · ' + r.resolvedAt : ''}</span>`}
      </div>
    </div>`).join('');
}

function resolveReport(id) {
  const r = DB.reports.find(x => x.id === id);
  if (!r) return;
  DB.updateReport(id, { status: 'resolved', resolvedAt: new Date().toLocaleString() });
  DB.addActivity(`✅ Complaint at <strong>${r.area}</strong> by ${r.name} was resolved.`);
  renderReportFeed();
  toast('✅ Marked as resolved!');
}

/* ──────────────── SEGREGATION ──────────────── */
const wasteDB = {
  wet: ['banana peel','apple core','vegetable peel','food waste','cooked food','leftovers','tea leaves','coffee grounds','eggshell','fruit peel','garden waste','grass','leaves','flowers','bread','rice','dal','curry','milk','coconut shell','onion peel','fish waste','meat waste','paper tissue'],
  dry: ['newspaper','cardboard','plastic bottle','glass bottle','tin can','magazine','paper','aluminium can','metal scrap','rubber','plastic bag','tetrapack','envelope','book','foam','carton','clothing','fabric','jute bag','wooden piece','glass jar','steel utensil','polythene'],
  hazardous: ['battery','medicine','paint','chemical','bleach','insecticide','pesticide','fertilizer','acid','oil','bulb','fluorescent tube','nail polish','hair dye','aerosol','syringe','expired medicine','lighter','matches','motor oil','detergent bottle'],
  ewaste: ['mobile phone','laptop','computer','keyboard','mouse','charger','cable','wire','circuit board','printer','scanner','television','monitor','remote control','earphone','headphone','camera','tablet','hard disk','usb drive','router','modem','set top box','washing machine','refrigerator']
};

function initSeg() {
  const fill = (id, arr) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = arr.slice(0, 9).map(i => `<li>${cap(i)}</li>`).join('');
  };
  fill('gbList', wasteDB.wet);
  fill('bbList', wasteDB.dry);
  fill('rbList', wasteDB.hazardous);
  fill('ewList', wasteDB.ewaste);
}

function doSeg() {
  const q = document.getElementById('segQ').value.trim().toLowerCase();
  const el = document.getElementById('segAns');
  if (!q) { el.innerHTML = ''; return; }

  let result = null;
  if (wasteDB.wet.some(i => i.includes(q) || q.includes(i)))
    result = { type:'Wet Waste', bin:'🟢 Green Bin', color:'#1e6e1e', tip:'Compost it or hand to organic waste collector.' };
  else if (wasteDB.dry.some(i => i.includes(q) || q.includes(i)))
    result = { type:'Dry Waste', bin:'🔵 Blue Bin', color:'#1a50a0', tip:'Clean before disposing. Supports recycling.' };
  else if (wasteDB.hazardous.some(i => i.includes(q) || q.includes(i)))
    result = { type:'Hazardous Waste', bin:'🔴 Red Bin', color:'#b02020', tip:'Handle carefully. Never mix with other waste.' };
  else if (wasteDB.ewaste.some(i => i.includes(q) || q.includes(i)))
    result = { type:'E-Waste', bin:'⚫ E-Waste Centre', color:'#222', tip:'Return to authorized e-waste collection centre.' };

  if (result) {
    el.innerHTML = `
      <div class="seg-result-box" style="border-left:6px solid ${result.color}">
        <div style="font-size:1.15rem;font-weight:800;color:${result.color};margin-bottom:5px">${result.bin}</div>
        <div style="font-size:.9rem;color:var(--text-md);margin-bottom:4px">Category: <strong>${result.type}</strong></div>
        <div style="font-size:.84rem;color:var(--text-lt)">💡 ${result.tip}</div>
      </div>`;
  } else {
    el.innerHTML = `<div class="seg-result-box" style="border-left:6px solid var(--gold)">
      <strong>Item not found in database.</strong>
      <div style="font-size:.84rem;color:var(--text-lt);margin-top:4px">When unsure, use the dry waste bin or contact your local waste authority.</div>
    </div>`;
  }
}

/* ──────────────── QUIZ ──────────────── */
const QUESTIONS = [
  { q:'Which colour bin is used for wet/organic waste?', opts:['Blue','Red','Green','Yellow'], ans:2, exp:'Green bins are for wet/organic waste like food scraps, vegetable peels and garden waste.' },
  { q:'What does "3R" stand for in waste management?', opts:['Remove, Repair, Recycle','Reduce, Reuse, Recycle','Reduce, Repair, Replace','Reuse, Rebuild, Recycle'], ans:1, exp:'3R = Reduce, Reuse, Recycle — the foundation of sustainable waste management.' },
  { q:'Which of these is classified as hazardous waste?', opts:['Banana peel','Newspaper','Old battery','Glass bottle'], ans:2, exp:'Old batteries contain toxic chemicals (lead, acid) and must go in the red/hazardous bin.' },
  { q:'E-waste includes which of the following?', opts:['Food waste','Old mobile phones','Garden clippings','Plastic bags'], ans:1, exp:'E-waste refers to discarded electronics like phones, computers, chargers, and cables.' },
  { q:'Open burning of garbage primarily causes:', opts:['Soil pollution','Air pollution','Water pollution','Noise pollution'], ans:1, exp:'Burning waste releases toxic gases, dioxins, and CO₂ causing severe air pollution.' },
  { q:'Which gas is mainly produced by decomposing organic waste in landfills?', opts:['Oxygen','Nitrogen','Methane','Hydrogen'], ans:2, exp:'Methane (CH₄) from landfills is a greenhouse gas 25× more potent than CO₂.' },
  { q:'The correct way to dispose of expired medicines is:', opts:['Flush in toilet','Throw in dry bin','Return to pharmacy/red bin','Burn them'], ans:2, exp:'Expired medicines should be returned to pharmacies or placed in hazardous waste bins.' },
  { q:'Which is recyclable dry waste?', opts:['Apple peel','Newspaper','Medicine capsule','Eggshell'], ans:1, exp:'Newspaper is recyclable dry waste — goes in the blue bin after use.' },
  { q:'Composting converts organic waste into:', opts:['Plastic','Nutrient-rich manure','Chemicals','E-waste'], ans:1, exp:'Composting converts organic/wet waste into nutrient-rich fertilizer for plants.' },
  { q:'What should you do when you spot garbage on the street?', opts:['Ignore it','Add more to it','Report it on CleanNashik','Burn it'], ans:2, exp:'Reporting garbage helps NMC respond quickly. Every report makes a difference!' },
];

let qzState = { idx: 0, score: 0, answered: [] };

function startQuiz() {
  qzState = { idx: 0, score: 0, answered: [] };
  document.getElementById('qzStart').style.display = 'none';
  document.getElementById('qzPlay').style.display  = 'block';
  document.getElementById('qzDone').style.display  = 'none';
  showQ();
}

function showQ() {
  const q = QUESTIONS[qzState.idx];
  document.getElementById('qFill').style.width = (qzState.idx / QUESTIONS.length * 100) + '%';
  document.getElementById('qCnt').textContent  = `${qzState.idx + 1} / ${QUESTIONS.length}`;
  document.getElementById('qQ').textContent    = q.q;
  document.getElementById('qFb').style.display = 'none';
  document.getElementById('qNext').style.display = 'none';
  document.getElementById('qOpts').innerHTML = q.opts.map((o, i) =>
    `<div class="qz-opt" onclick="answerQ(${i})">${o}</div>`
  ).join('');
}

function answerQ(sel) {
  const q = QUESTIONS[qzState.idx];
  const opts = document.querySelectorAll('.qz-opt');
  opts.forEach(o => o.style.pointerEvents = 'none');
  opts[q.ans].classList.add('correct');
  if (sel !== q.ans) opts[sel].classList.add('wrong');
  else qzState.score++;

  qzState.answered.push({ q: q.q, sel, ans: q.ans, exp: q.exp });
  document.getElementById('qFb').textContent = (sel === q.ans ? '✅ Correct! ' : '❌ Wrong. ') + q.exp;
  document.getElementById('qFb').style.display = 'block';
  document.getElementById('qNext').style.display = 'block';
}

function nextQ() {
  qzState.idx++;
  if (qzState.idx >= QUESTIONS.length) { finishQuiz(); return; }
  showQ();
}

function finishQuiz() {
  document.getElementById('qzPlay').style.display = 'none';
  document.getElementById('qzDone').style.display = 'block';
  const s = qzState.score, total = QUESTIONS.length, pct = s / total;
  const [badge, title] =
    pct >= .9 ? ['🏆','Eco Champion!'] :
    pct >= .7 ? ['🥇','Eco Warrior'] :
    pct >= .5 ? ['🏅','Eco Supporter'] :
               ['🌱','Eco Learner'];

  document.getElementById('qzBadge').textContent = badge;
  document.getElementById('qzTitle').textContent = title;
  document.getElementById('qzScoreTxt').textContent = `You scored ${s} out of ${total} (${Math.round(pct*100)}%)`;
  document.getElementById('qzExps').innerHTML = qzState.answered.map(a =>
    `<div class="qz-exp ${a.sel === a.ans ? 'c' : 'w'}"><strong>${a.q}</strong><br/>${a.exp}</div>`
  ).join('');

  // Award points
  const cur = DB.current;
  if (cur) {
    const user = DB.users.find(u => u.name === cur);
    if (user) DB.updateUser(cur, { points: user.points + s * 5, quizzes: (user.quizzes || 0) + 1 });
    toast(`🎉 Quiz complete! Score: ${s}/${total} · +${s * 5} points`);
  } else toast(`🎉 Quiz complete! Score: ${s}/${total}`);
}

function resetQuiz() {
  document.getElementById('qzDone').style.display  = 'none';
  document.getElementById('qzStart').style.display = 'block';
}

/* ──────────────── TRACKER ──────────────── */
function renderTracker() {
  const grid = document.getElementById('trackerGrid');
  if (!grid) return;
  grid.innerHTML = AREAS.map(a => {
    const ar   = DB.reports.filter(r => r.area === a.name);
    const pend = ar.filter(r => r.status === 'pending').length;
    const res  = ar.filter(r => r.status === 'resolved').length;
    const total = ar.length || 1;
    let stClass = 'st-clean', stLabel = '✅ Clean';
    if (pend >= 3) { stClass = 'st-dirty';    stLabel = '🔴 Needs Attention'; }
    else if (pend >= 1) { stClass = 'st-moderate'; stLabel = '🟡 Moderate'; }
    const pct = Math.round((res / total) * 100);
    const barColor = pct >= 80 ? '#2d7a2d' : pct >= 50 ? '#e67e22' : '#c0392b';
    const lastRpt  = ar.length ? new Date(ar[ar.length - 1].ts).toLocaleDateString() : 'None';
    return `
      <div class="tracker-card">
        <div class="tc-top">
          <span class="tc-name">${a.icon} ${a.name}</span>
          <span class="asc-badge ${stClass}">${stLabel}</span>
        </div>
        <div class="tc-info">
          Total Reports: <strong>${ar.length}</strong> &nbsp;|&nbsp;
          Pending: <strong>${pend}</strong> &nbsp;|&nbsp;
          Resolved: <strong>${res}</strong><br/>
          Last Report: ${lastRpt}
        </div>
        <div class="tc-bar-wrap"><div class="tc-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <div class="tc-pct">${pct}% resolved</div>
      </div>`;
  }).join('');
  renderActLog();
}

function renderActLog() {
  const el = document.getElementById('actLog');
  if (!el) return;
  const acts = DB.activity;
  if (!acts.length) { el.innerHTML = '<p style="color:var(--text-lt);text-align:center;padding:20px">No activity yet.</p>'; return; }
  el.innerHTML = acts.slice(0, 25).map(a => `
    <div class="act-entry">
      <span class="ae-ico">📌</span>
      <span class="ae-txt">${a.text}</span>
      <span class="ae-time">${a.time}</span>
    </div>`).join('');
}

/* ──────────────── NEWS ──────────────── */
function renderNews() {
  const feed = document.getElementById('newsFeed');
  if (!feed) return;
  const news = DB.news;
  if (!news.length) { feed.innerHTML = '<p style="color:var(--text-lt);padding:20px">No news yet.</p>'; }
  else {
    feed.innerHTML = news.slice().reverse().map(n => {
      const tagClass = { update:'t-update', event:'t-event', achievement:'t-achievement', alert:'t-alert', offender:'t-offender' }[n.cat] || 't-update';
      const cardClass = n.cat === 'offender' ? 'off-card' : n.cat === 'event' ? 'evt-card' : n.cat === 'achievement' ? 'ach-card' : n.cat === 'alert' ? 'alrt-card' : '';
      return `
        <div class="news-card ${cardClass}">
          <span class="n-tag ${tagClass}">${n.cat.toUpperCase()}</span>
          <h3>${n.title}</h3>
          <p>${n.body}</p>
          <div class="n-meta">
            <span>👤 ${n.author}</span>
            <span>🕒 ${new Date(n.date).toLocaleDateString()}</span>
          </div>
        </div>`;
    }).join('');
  }
  renderOffenders();
  renderNewsStats();
}

function renderOffenders() {
  const el = document.getElementById('offFeed');
  if (!el) return;
  const offs = DB.offenders;
  if (!offs.length) { el.innerHTML = '<p style="color:var(--text-lt);font-size:.84rem">No offenders on record.</p>'; return; }
  el.innerHTML = offs.map(o => `
    <div class="off-item">
      <div class="oi-av">${o.name.charAt(0).toUpperCase()}</div>
      <div class="oi-info">
        <strong>${o.name}</strong>
        <span>📍 ${o.area} · ${new Date(o.date).toLocaleDateString()}</span>
      </div>
    </div>`).join('');
}

function renderNewsStats() {
  const el = document.getElementById('newsStats');
  if (!el) return;
  const r = DB.reports;
  const items = [
    ['Total Reports', r.length],
    ['Resolved',      r.filter(x => x.status === 'resolved').length],
    ['Pending',       r.filter(x => x.status === 'pending').length],
    ['Registered Users', DB.users.length],
    ['News Articles', DB.news.length],
    ['Offender Alerts', DB.offenders.length],
  ];
  el.innerHTML = items.map(([l, v]) => `
    <div class="qs-item"><span>${l}</span><span class="qs-val">${v}</span></div>`).join('');
}

/* ──────────────── DASHBOARD ──────────────── */
function renderDashboard() {
  const r = DB.reports;
  const kpis = [
    ['Total Reports', r.length, ''],
    ['Resolved',      r.filter(x => x.status === 'resolved').length, 'k-res'],
    ['Pending',       r.filter(x => x.status === 'pending').length, 'k-pend'],
    ['Registered Users', DB.users.length, 'k-usr'],
  ];
  const row = document.getElementById('kpiRow');
  if (row) row.innerHTML = kpis.map(([l, v, c]) =>
    `<div class="kpi-card ${c}"><span class="kpi-num">${v}</span><span class="kpi-lbl">${l}</span></div>`
  ).join('');

  drawAreaChart();
  drawSevChart();
  renderFullLB();
}

function drawAreaChart() {
  const canvas = document.getElementById('areaChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#faf7f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const counts = AREAS.map(a => DB.reports.filter(r => r.area === a.name).length);
  const maxV = Math.max(...counts, 1);
  const W = 420, H = 260, padL = 44, padB = 44, padT = 20;
  const chartW = W - padL - 20, chartH = H - padB - padT;
  const bW = 44, gap = (chartW - bW * AREAS.length) / (AREAS.length + 1);

  // Grid lines
  ctx.strokeStyle = '#e8dfc9'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (i / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - 20, y); ctx.stroke();
    ctx.fillStyle = '#888870'; ctx.font = '10px Nunito'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(i / 4 * maxV), padL - 6, y + 4);
  }

  AREAS.forEach((a, i) => {
    const x = padL + gap + i * (bW + gap);
    const h = (counts[i] / maxV) * chartH;
    const y = padT + chartH - h;
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#6b7f3e'); grad.addColorStop(1, '#c8a84b');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(x, y, bW, h, 5); ctx.fill();
    ctx.fillStyle = '#2c2c1a'; ctx.font = 'bold 11px Nunito'; ctx.textAlign = 'center';
    ctx.fillText(counts[i], x + bW / 2, y - 5);
    ctx.fillStyle = '#5a5a3a'; ctx.font = '9px Nunito';
    const lbl = a.name.split(' ')[0];
    ctx.fillText(lbl, x + bW / 2, H - padB + 16);
  });
}

function drawSevChart() {
  const canvas = document.getElementById('sevChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#faf7f0'; ctx.fillRect(0, 0, canvas.width, canvas.height);

  const low  = DB.reports.filter(r => r.severity === 'low').length;
  const med  = DB.reports.filter(r => r.severity === 'medium').length;
  const high = DB.reports.filter(r => r.severity === 'high').length;
  const total = low + med + high || 1;
  const slices = [
    { val: low  / total, color: '#2d7a2d', label: `Low (${low})` },
    { val: med  / total, color: '#e67e22', label: `Med (${med})` },
    { val: high / total, color: '#c0392b', label: `High (${high})` },
  ];

  const cx = 110, cy = 120, r = 85;
  let ang = -Math.PI / 2;
  slices.forEach(s => {
    const span = s.val * 2 * Math.PI;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, ang, ang + span);
    ctx.closePath(); ctx.fillStyle = s.color; ctx.fill();
    ctx.strokeStyle = '#faf7f0'; ctx.lineWidth = 2; ctx.stroke();
    ang += span;
  });
  // Legend
  slices.forEach((s, i) => {
    ctx.fillStyle = s.color; ctx.fillRect(218, 80 + i * 28, 14, 14);
    ctx.fillStyle = '#2c2c1a'; ctx.font = '11px Nunito'; ctx.textAlign = 'left';
    ctx.fillText(s.label, 238, 92 + i * 28);
  });
}

function renderFullLB() {
  const el = document.getElementById('fullLB');
  if (!el) return;
  const sorted = DB.users.slice().sort((a, b) => b.points - a.points);
  const medals = ['🥇','🥈','🥉'];
  el.innerHTML = sorted.length
    ? sorted.map((u, i) => `
        <div class="lb-row">
          <span class="lb-rank">${medals[i] || (i + 1)}</span>
          <span class="lb-name">${u.name}</span>
          <span class="lb-meta">📋 ${u.reports || 0} reports &nbsp;🎮 ${u.quizzes || 0} quizzes</span>
          <span class="lb-pts">${u.points || 0} pts</span>
        </div>`).join('')
    : '<p style="text-align:center;color:var(--text-lt);padding:24px">No users yet. Register and report to appear here!</p>';
}

/* ──────────────── HISTORY ──────────────── */
function renderHistory() {
  const filt   = document.getElementById('hFilt').value;
  const area   = document.getElementById('hArea').value;
  const search = document.getElementById('hSearch').value.toLowerCase();
  const histOut = document.getElementById('histOut');

  let data = DB.reports;
  if (filt !== 'all')    data = data.filter(r => r.status === filt);
  if (area !== 'all')    data = data.filter(r => r.area   === area);
  if (search)            data = data.filter(r => r.name.toLowerCase().includes(search) || r.area.toLowerCase().includes(search));

  if (!data.length) {
    histOut.innerHTML = '<p style="color:var(--text-lt);text-align:center;padding:40px">No records found.</p>';
    renderHistSumm(); return;
  }

  histOut.innerHTML = `
    <div style="overflow-x:auto">
    <table class="hist-table">
      <thead>
        <tr><th>#</th><th>Who</th><th>When</th><th>What (Description)</th><th>Which Area</th><th>Landmark</th><th>Severity</th><th>GPS</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${data.slice().reverse().map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${r.name}</strong></td>
            <td style="white-space:nowrap">${new Date(r.ts).toLocaleString()}</td>
            <td>${r.desc.length > 55 ? r.desc.substring(0, 55) + '…' : r.desc}</td>
            <td>📍 ${r.area}</td>
            <td>${r.landmark || '—'}</td>
            <td class="b-${r.severity}">${r.severity.toUpperCase()}</td>
            <td style="font-size:.74rem">${r.gps}</td>
            <td><span class="badge b-${r.status}">${r.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}</span></td>
          </tr>`).join('')}
      </tbody>
    </table>
    </div>`;
  renderHistSumm();
}

function renderHistSumm() {
  const el = document.getElementById('histSumm');
  if (!el) return;
  const r = DB.reports;
  const items = [
    ['Total', r.length, ''],
    ['Resolved', r.filter(x => x.status === 'resolved').length, 'color:#2d7a2d'],
    ['Pending',  r.filter(x => x.status === 'pending').length,  'color:#e67e22'],
    ['High Severity', r.filter(x => x.severity === 'high').length, 'color:#c0392b'],
  ];
  el.innerHTML = items.map(([l, v, s]) =>
    `<div class="hs-card"><span class="hs-n" style="${s}">${v}</span><span class="hs-l">${l}</span></div>`
  ).join('');
}

/* ──────────────── ADMIN PORTAL ──────────────── */
let adminLoggedIn = false;

function adminLogin() {
  const u = document.getElementById('aUser').value.trim();
  const p = document.getElementById('aPass').value.trim();
  if (u === 'admin' && p === 'admin123') {
    adminLoggedIn = true;
    document.getElementById('adminLoginWrap').style.display = 'none';
    document.getElementById('adminDash').style.display = 'block';
    document.getElementById('abName').textContent = 'Administrator';
    document.getElementById('abStat').textContent =
      `${DB.reports.length} reports · ${DB.users.length} users · ${DB.news.length} articles`;
    adminTab('reports');
    toast('✅ Admin logged in successfully!');
  } else {
    document.getElementById('aErr').style.display = 'block';
  }
}

function adminLogout() {
  adminLoggedIn = false;
  document.getElementById('adminDash').style.display = 'none';
  document.getElementById('adminLoginWrap').style.display = 'block';
  document.getElementById('aUser').value = '';
  document.getElementById('aPass').value = '';
  document.getElementById('aErr').style.display = 'none';
  toast('Logged out from Admin Portal.');
}

function adminTab(name) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.atab-pane').forEach(p => p.style.display = 'none');
  event.currentTarget.classList.add('active');
  const pane = document.getElementById('atab-' + name);
  if (pane) pane.style.display = 'block';

  if (name === 'reports')   renderAdminReports();
  if (name === 'users')     renderAdminUsers();
  if (name === 'postnews')  renderAdminNews();
  if (name === 'offenders') renderAdminOffenders();
}

function renderAdminReports() {
  const el = document.getElementById('aRptList');
  if (!el) return;
  const rpts = DB.reports;
  if (!rpts.length) { el.innerHTML = '<p style="color:var(--text-lt)">No reports yet.</p>'; return; }
  el.innerHTML = rpts.slice().reverse().map(r => `
    <div class="admin-report-row">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong>${r.name}</strong>
        <span class="badge b-${r.status}">${r.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}</span>
      </div>
      <div style="font-size:.84rem;color:var(--text-md)">📍 ${r.area}${r.landmark ? ' · ' + r.landmark : ''}</div>
      <div style="font-size:.82rem;color:var(--text-lt)">${r.desc.substring(0, 80)}…</div>
      <div style="font-size:.78rem;color:var(--text-lt);margin-top:5px">⚠️ ${r.severity.toUpperCase()} &nbsp;|&nbsp; 📡 ${r.gps} &nbsp;|&nbsp; 🕒 ${new Date(r.ts).toLocaleString()}</div>
      ${r.status === 'pending' ? `<button class="resolve-btn" style="margin-top:8px" onclick="adminResolve('${r.id}')">✅ Mark Resolved</button>` : ''}
    </div>`).join('');
}

function adminResolve(id) {
  const r = DB.reports.find(x => x.id === id);
  if (!r) return;
  DB.updateReport(id, { status: 'resolved', resolvedAt: new Date().toLocaleString() });
  DB.addActivity(`✅ Admin resolved complaint at <strong>${r.area}</strong> by ${r.name}.`);
  renderAdminReports();
  toast('✅ Marked as resolved!');
}

function renderAdminUsers() {
  const el = document.getElementById('aUserList');
  if (!el) return;
  const users = DB.users.slice().sort((a, b) => b.points - a.points);
  if (!users.length) { el.innerHTML = '<p style="color:var(--text-lt)">No users registered yet.</p>'; return; }
  el.innerHTML = users.map((u, i) => `
    <div class="admin-user-card">
      <div class="auc-av">${u.name.charAt(0).toUpperCase()}</div>
      <div class="auc-info">
        <h4>${u.name}</h4>
        <span>📋 ${u.reports || 0} reports &nbsp;🎮 ${u.quizzes || 0} quizzes &nbsp;📅 Joined ${new Date(u.joined).toLocaleDateString()}</span>
      </div>
      <span class="auc-pts">${u.points || 0} pts</span>
    </div>`).join('');
}

function renderAdminNews() {
  const el = document.getElementById('aNewsList');
  if (!el) return;
  const news = DB.news.slice().reverse();
  if (!news.length) { el.innerHTML = '<p style="color:var(--text-lt)">No articles published yet.</p>'; return; }
  el.innerHTML = news.map(n => `
    <div class="admin-news-item">
      <div>
        <strong style="font-size:.88rem">${n.title}</strong>
        <div style="font-size:.76rem;color:var(--text-lt)">${n.cat.toUpperCase()} · ${new Date(n.date).toLocaleDateString()}</div>
      </div>
      <button class="del-btn" onclick="deleteNews('${n.id}')">Delete</button>
    </div>`).join('');
}

function postNews() {
  const title = document.getElementById('nHead').value.trim();
  const body  = document.getElementById('nBody').value.trim();
  const cat   = document.getElementById('nCat').value;
  if (!title || !body) { toast('⚠️ Fill in headline and content!'); return; }
  DB.addNews({ id: 'n' + Date.now(), title, body, cat, author: 'Admin', date: new Date().toISOString() });
  document.getElementById('nHead').value = '';
  document.getElementById('nBody').value = '';
  renderAdminNews();
  toast('✅ News article published!');
}

function deleteNews(id) {
  const news = DB.news.filter(n => n.id !== id);
  DB.save('news', news);
  renderAdminNews();
  toast('News deleted.');
}

function renderAdminOffenders() {
  const el = document.getElementById('aOffList');
  if (!el) return;
  const offs = DB.offenders.slice().reverse();
  if (!offs.length) { el.innerHTML = '<p style="color:var(--text-lt)">No offender alerts posted yet.</p>'; return; }
  el.innerHTML = offs.map(o => `
    <div class="admin-report-row">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <strong>⚠️ ${o.name}</strong>
        <span style="font-size:.76rem;color:var(--text-lt)">${new Date(o.date).toLocaleDateString()}</span>
      </div>
      <div style="font-size:.84rem;color:var(--text-md)">📍 ${o.area}</div>
      <div style="font-size:.82rem;color:var(--text-lt)">${o.desc}</div>
      <button class="del-btn" style="margin-top:8px" onclick="deleteOffender('${o.id}')">Delete Alert</button>
    </div>`).join('');
}

function addOffender() {
  const name = document.getElementById('offNm').value.trim();
  const area = document.getElementById('offAr').value;
  const desc = document.getElementById('offDsc').value.trim();
  if (!name || !desc) { toast('⚠️ Fill in all fields!'); return; }
  DB.addOffender({ id: 'o' + Date.now(), name, area, desc, date: new Date().toISOString() });
  DB.addNews({ id: 'n' + Date.now(), title: `Offender Alert: ${name}`, body: `Incident at ${area}: ${desc}`, cat: 'offender', author: 'Admin', date: new Date().toISOString() });
  document.getElementById('offNm').value  = '';
  document.getElementById('offDsc').value = '';
  renderAdminOffenders();
  toast('⚠️ Offender alert posted!');
}

function deleteOffender(id) {
  DB.save('offenders', DB.offenders.filter(o => o.id !== id));
  renderAdminOffenders();
  toast('Alert deleted.');
}

/* ──────────────── USER PROFILE ──────────────── */
function renderProfile() {
  const el = document.getElementById('profileContent');
  if (!el) return;
  const cur = DB.current;

  if (!cur) {
    el.innerHTML = `
      <div class="no-login">
        <div style="font-size:3rem;margin-bottom:12px">👤</div>
        <h2 style="font-family:var(--font-h);color:var(--olive-dk);margin-bottom:8px">You are not logged in</h2>
        <p>Login or register to view your profile, reports and achievements.</p>
        <button class="btn-submit" style="max-width:220px;margin:0 auto" onclick="openAuth()"><i class="fas fa-sign-in-alt"></i> Login / Register</button>
      </div>`;
    return;
  }

  const user = DB.users.find(u => u.name === cur) || { name: cur, points: 0, reports: 0, quizzes: 0, joined: new Date().toISOString() };
  const myReports = DB.reports.filter(r => r.name.toLowerCase() === cur.toLowerCase());
  const resolved = myReports.filter(r => r.status === 'resolved').length;
  const badge = user.points >= 100 ? '🏆' : user.points >= 50 ? '🥇' : user.points >= 20 ? '🏅' : '🌱';

  el.innerHTML = `
    <div class="profile-banner">
      <div class="pb-av">${cur.charAt(0).toUpperCase()}</div>
      <div class="pb-info">
        <h2>${user.name}</h2>
        <p>Registered CleanNashik Citizen · ${badge} Eco ${user.points >= 100 ? 'Champion' : user.points >= 50 ? 'Warrior' : 'Supporter'}</p>
        <div class="pb-stats">
          <div class="pb-stat"><strong>${user.points || 0}</strong><span>Points</span></div>
          <div class="pb-stat"><strong>${user.reports || 0}</strong><span>Reports</span></div>
          <div class="pb-stat"><strong>${resolved}</strong><span>Resolved</span></div>
          <div class="pb-stat"><strong>${user.quizzes || 0}</strong><span>Quizzes</span></div>
        </div>
      </div>
    </div>
    <div class="profile-reports">
      <h3>📋 My Reports</h3>
      ${myReports.length
        ? myReports.slice().reverse().map(r => `
            <div class="rpt-item" style="margin-bottom:12px">
              ${r.image ? `<img src="${r.image}" alt="Report" style="width:100%;max-height:140px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>` : ''}
              <div class="rpt-top">
                <span class="rpt-name">📍 ${r.area}${r.landmark ? ' · ' + r.landmark : ''}</span>
                <span class="badge b-${r.status}">${r.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}</span>
              </div>
              <div class="rpt-desc">${r.desc}</div>
              <div class="rpt-meta">
                <span class="b-${r.severity}">⚠️ ${r.severity.toUpperCase()}</span>
                <span>🕒 ${new Date(r.ts).toLocaleString()}</span>
              </div>
            </div>`).join('')
        : '<p style="color:var(--text-lt);text-align:center;padding:24px">No reports submitted yet. <a href="#" onclick="showPage(\'report\')" style="color:var(--olive)">Report garbage now!</a></p>'}
    </div>
    <div style="margin-top:20px">
      <button class="btn-submit" style="max-width:200px;background:linear-gradient(135deg,#c0392b,#e74c3c)" onclick="logoutUser()">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>`;
}

function logoutUser() {
  DB.clearCurrent();
  updateNavUser(null);
  showPage('home');
  toast('👋 Logged out successfully.');
}

/* ──────────────── FAQ ──────────────── */
function renderFAQ() {
  const faqs = [
    { q:'How do I report garbage in Nashik?',      a:'Go to the Report tab, enter your name, select area, use the camera or upload a photo, add description and submit. NMC teams respond within 24 hours.' },
    { q:'What points do I earn?',                   a:'You earn 20 points per garbage report and 5 points per correct quiz answer. Points accumulate on your profile.' },
    { q:'How do I know if my complaint was resolved?', a:'Check the Report page or History tab. Resolved complaints show a green "Resolved" badge with the resolution date.' },
    { q:'What is the difference between wet and dry waste?', a:'Wet waste is organic (food scraps, peels) — green bin. Dry waste is recyclable (paper, plastic, glass) — blue bin.' },
    { q:'How do I contact NMC Nashik?',             a:'Call 1800-233-NASHIK (Mon–Sat 9AM–6PM) or email cleannashik@nmc.gov.in. Emergency hazardous waste: 1800-123-4567 (24×7).' },
    { q:'Can I view my past reports?',              a:'Yes! Login and go to My Profile. All your submitted reports with photos and status are displayed there.' },
    { q:'What happens to e-waste?',                 a:'E-waste contains toxic metals (lead, mercury). Never put in regular bins. Take to authorized e-waste centres in Nashik.' },
    { q:'How does the Admin Portal work?',          a:'The Admin Portal (username: admin, password: admin123) allows administrators to manage reports, publish news, and post offender alerts.' },
  ];
  const el = document.getElementById('faqList');
  if (!el) return;
  el.innerHTML = faqs.map((f, i) => `
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFAQ(${i}, this)">
        ${f.q} <span>▼</span>
      </div>
      <div class="faq-a" id="fa-${i}">${f.a}</div>
    </div>`).join('');
}

function toggleFAQ(i, el) {
  const a = document.getElementById('fa-' + i);
  const isOpen = a.classList.contains('open');
  a.classList.toggle('open', !isOpen);
  el.querySelector('span').textContent = isOpen ? '▼' : '▲';
}

/* ──────────────── INIT ──────────────── */
window.addEventListener('DOMContentLoaded', () => {
  seedData();

  // Restore logged-in user
  const cur = DB.current;
  if (cur) updateNavUser(cur);

  showPage('home');
});

/* Utility */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);