const SUPABASE_URL = 'https://wfcjrbdydaqtpqqhflbv.supabase.co';
const SUPABASE_KEY = 'sb_publishable__RWUuUimioKyGxqtO4LbLA_3UAcPHmy';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const el = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2,'0');
const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; };
const monthISO = (d=new Date()) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-01`;
const monthsTR=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const formatDate = v => !v ? '—' : (()=>{const [y,m,d]=String(v).slice(0,10).split('-'); return `${d}.${m}.${y}`})();
const formatDateTime = v => { if(!v) return '—'; const d=new Date(v); return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()} • ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const prettyMonth = v => { const [y,m]=String(v).slice(0,7).split('-').map(Number); return `${monthsTR[m-1]} ${y}`; };
const escapeHtml = v => String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const normalizeUsername = v => String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9._-]/g,'');
const authEmail = u => `${normalizeUsername(u)}@minds.local`;
const dateMonthISO = v => String(v||'').length>=7 ? `${String(v).slice(0,7)}-01` : '';
const defaultDateForSelectedMonth = () => selectedMonth===monthISO() ? todayISO() : `${selectedMonth.slice(0,7)}-01`;
function assertSelectedMonthDate(v,label='Tarih'){ if(!v) throw new Error(`${label} gerekli.`); if(dateMonthISO(v)!==selectedMonth) throw new Error(`${label}, seçili ay (${prettyMonth(selectedMonth)}) içinde olmalı.`); }
function friendlyError(err){ const m=String(err?.message||err||'İşlem başarısız.'); const map={historical_month_locked:'Geçmiş aylar otomatik olarak değiştirilemez.',admin_required:'Bu işlem için yönetici yetkisi gerekli.'}; if(map[m]) return map[m]; if(m.includes('duplicate key')) return 'Bu kayıt zaten mevcut.'; if(m.includes('invalid input syntax for type uuid')) return 'Personel veya firma seçimi geçersiz. Sayfayı yenileyip tekrar dene.'; if(m.includes('violates foreign key constraint')) return 'Bu kayıt başka verilerle bağlantılı. İşlem güvenli biçimde tamamlanamadı.'; if(m.includes('check constraint') && m.includes('video_count')) return 'Çekilen video içeriği en az 1 olmalı.'; return m; }

let session=null, profile=null, selectedMonth=monthISO();
let state={profiles:[],firms:[],months:[],works:[],extras:[],shoots:[],activity:[],assignments:[]};
let realtimeChannel=null, reloadTimer=null;

function toast(msg,bad=false){ const t=el('toast'); t.textContent=msg; t.style.borderColor=bad?'#6b2d32':'#485b36'; t.style.color=bad?'#ffb2ae':'#dff4c9'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),bad?5200:2600); }
function authMsg(msg,bad=false){ const n=el('authMessage'); n.textContent=msg; n.className='auth-message '+(bad?'bad':'ok'); }
function isAdmin(){ return profile?.role==='admin'; }
function person(id){ return state.profiles.find(p=>p.id===id); }
function personName(id){ return person(id)?.full_name || '—'; }
function firm(id){ return state.firms.find(f=>f.id===id); }
function currentFirmMonth(fid){ return state.months.find(m=>m.firm_id===fid && m.month===selectedMonth); }
function firmLogo(f){ if(f.logo_path){ const {data}=sb.storage.from('firm-logos').getPublicUrl(f.logo_path); return `<img class="firm-logo" src="${data.publicUrl}" alt="">`; } const s=f.name.split(' ').map(x=>x[0]).join('').slice(0,3); return `<span class="firm-logo logo-placeholder">${escapeHtml(s)}</span>`; }
function activeFirms(){ return state.firms.filter(f=>f.active).sort((a,b)=>new Date(a.list_order_at)-new Date(b.list_order_at)); }
function activeProfiles(){ return state.profiles.filter(p=>p.active); }
function assignedPeople(fid){ return state.assignments.filter(a=>a.firm_id===fid).map(a=>({a,p:person(a.person_id)})).filter(x=>x.p); }
function workReady(w){ return ['hazir','onaylandi'].includes(w.status); }
function workStatusLabel(v){ return ({bekliyor:'Bekliyor',devam_ediyor:'Devam Ediyor',hazir:'Hazır',revizede:'Revizede',onaylandi:'Onaylandı'})[v]||v; }
function shareLabel(v){ return ({paylasilmadi:'Paylaşılmadı',planlandi:'Planlandı',paylasildi:'Paylaşıldı'})[v]||v; }
function typeLabel(v){ return v==='post'?'Post':'Video'; }
function roleLabel(v){ return v==='admin'?'Yönetici':'Personel'; }
const ADMIN_VIEWS=new Set(['team','reports','archive','settings']);
function applyRoleUI(){
  const admin=isAdmin();
  document.querySelectorAll('.admin-nav').forEach(x=>x.style.display=admin?'':'none');
  document.querySelectorAll('.admin-only').forEach(x=>x.style.display=admin?'':'none');
  const labels=admin
    ? {firms:'Firmalar',works:'İş Takibi',shares:'Paylaşım Takibi',activity:'Günlük Hareketler'}
    : {firms:'Firmalarım',works:'Görevlerim',shares:'Paylaşım Bekleyenler',activity:'Günlük Hareketlerim'};
  const navLabels={firms:labels.firms,works:labels.works,shares:labels.shares,activity:labels.activity};
  Object.entries(navLabels).forEach(([view,text])=>{ const s=document.querySelector(`.nav-item[data-view="${view}"] span`); if(s)s.textContent=text; });
  if(el('firmsTitle')) el('firmsTitle').textContent=labels.firms;
  if(el('firmsDesc')) el('firmsDesc').textContent=admin?'Firma, logo, aylık paket ve ekip sorumluları.':'Sana atanmış aktif firmalar.';
  if(el('worksTitle')) el('worksTitle').textContent=labels.works;
  if(el('worksDesc')) el('worksDesc').textContent=admin?'Paket dahilindeki post ve videolar.':'Sana atanmış veya senin oluşturduğun paket işleri.';
  if(el('sharesTitle')) el('sharesTitle').textContent=labels.shares;
  if(el('activityTitle')) el('activityTitle').textContent=labels.activity;
}
function staffOwnWork(w){ return isAdmin() || w.assigned_to===profile?.id || w.created_by===profile?.id; }
function staffOwnExtra(x){ return isAdmin() || x.person_id===profile?.id; }
function staffOwnShoot(x){ return isAdmin() || x.responsible_id===profile?.id || x.created_by===profile?.id; }


async function bootstrapCheck(){
  try{
    const r=await fetch(`${SUPABASE_URL}/functions/v1/bootstrap-admin`,{headers:{'apikey':SUPABASE_KEY}});
    const j=await r.json();
    if(!r.ok) throw new Error(j.error||'Kurulum durumu okunamadı.');
    const needsSetup=!!j.needs_setup;
    el('showSetupBtn').style.display=needsSetup?'inline-block':'none';
    if(needsSetup){ el('loginBox').classList.add('hidden'); el('setupBox').classList.remove('hidden'); }
    else { el('setupBox').classList.add('hidden'); el('loginBox').classList.remove('hidden'); }
  }catch(e){ console.warn(e); authMsg('Sunucu bağlantısı kontrol edilemedi.',true); }
}

async function login(){
  authMsg(''); const username=normalizeUsername(el('loginUsername').value), password=el('loginPassword').value;
  if(!username||!password) return authMsg('Kullanıcı adı ve şifre gerekli.',true);
  const {data,error}=await sb.auth.signInWithPassword({email:authEmail(username),password});
  if(error){
    try{
      const r=await fetch(`${SUPABASE_URL}/functions/v1/bootstrap-admin`,{headers:{'apikey':SUPABASE_KEY,'Cache-Control':'no-store'}});
      const j=await r.json();
      if(r.ok && j.needs_setup){
        el('loginBox').classList.add('hidden'); el('setupBox').classList.remove('hidden');
        el('setupUsername').value=username||'mindscrt';
        return authMsg('Yönetici hesabı henüz oluşturulmamış. Şifreni İlk Kurulum ekranında belirle.',true);
      }
    }catch(_e){}
    return authMsg('Giriş başarısız. Kullanıcı adı veya şifreyi kontrol et.',true);
  }
  session=data.session; const ok=await startApp(); if(!ok) await bootstrapCheck();
}

async function setupAdmin(){
  authMsg(''); const username=normalizeUsername(el('setupUsername').value||'mindscrt'), password=el('setupPassword').value;
  if(password.length<8) return authMsg('Şifre en az 8 karakter olmalı.',true);
  try{
    const r=await fetch(`${SUPABASE_URL}/functions/v1/bootstrap-admin`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Cache-Control':'no-store'},body:JSON.stringify({username,password})});
    const j=await r.json(); if(!r.ok) throw new Error(j.error||'Kurulum başarısız');
    const {data,error}=await sb.auth.signInWithPassword({email:authEmail(username),password});
    if(error || !data.session) throw new Error('Hesap oluşturuldu ancak giriş doğrulanamadı. Lütfen tekrar dene.');
    session=data.session;
    authMsg('Yönetici hesabı oluşturuldu. Giriş yapılıyor...');
    const ok=await startApp();
    if(!ok) throw new Error('Yönetici profili doğrulanamadı.');
  }catch(e){ authMsg(e.message,true); }
}

async function startApp(){
  const {data:{user},error:userError}=await sb.auth.getUser();
  if(userError||!user){
    try{ await sb.auth.signOut({scope:'local'}); }catch(_e){}
    session=null; profile=null;
    el('appShell').classList.add('hidden'); el('authScreen').classList.remove('hidden');
    return false;
  }
  const {data:p,error}=await sb.from('profiles').select('*').eq('id',user.id).single();
  if(error||!p||!p.active){
    try{ await sb.auth.signOut({scope:'local'}); }catch(_e){}
    session=null; profile=null;
    el('appShell').classList.add('hidden'); el('authScreen').classList.remove('hidden');
    authMsg('Bu oturum geçersiz veya hesap aktif değil.',true);
    return false;
  }
  profile=p; el('authScreen').classList.add('hidden'); el('appShell').classList.remove('hidden');
  el('sideName').textContent=p.full_name; el('sideRole').textContent=roleLabel(p.role); el('sideAvatar').textContent=(p.full_name||'M').charAt(0).toUpperCase();
  applyRoleUI();
  if(isAdmin()) { const r=await sb.rpc('ensure_month',{target_month:monthISO()}); if(r.error) console.warn(r.error); }
  await loadData(); subscribeRealtime();
  return true;
}

async function loadData({silent=false}={}){
  const results=await Promise.all([
    sb.from('profiles').select('*').order('created_at'),
    sb.from('firms').select('*').order('list_order_at'),
    sb.from('firm_months').select('*').order('month',{ascending:false}),
    sb.from('works').select('*').order('created_at',{ascending:false}),
    sb.from('extra_works').select('*').order('created_at',{ascending:false}),
    sb.from('shoots').select('*').order('shoot_date',{ascending:false}),
    sb.from('activity_log').select('*').order('created_at',{ascending:false}).limit(200),
    sb.from('firm_assignments').select('*')
  ]);
  const keys=['profiles','firms','months','works','extras','shoots','activity','assignments'];
  let hadError=false;
  results.forEach((r,i)=>{ if(r.error){ hadError=true; console.warn(keys[i],r.error); } else state[keys[i]]=r.data||[]; });
  renderAll();
  if(hadError&&!silent) toast('Bazı veriler sunucudan alınamadı. Mevcut kayıtlar ekranda korundu; tekrar deneyebilirsin.',true);
  return !hadError;
}

function scheduleReload(){ clearTimeout(reloadTimer); reloadTimer=setTimeout(()=>loadData({silent:true}),180); }
function subscribeRealtime(){
  if(realtimeChannel) sb.removeChannel(realtimeChannel);
  realtimeChannel=sb.channel('minds-takip-live');
  ['firms','firm_months','works','extra_works','shoots','activity_log','profiles','firm_assignments'].forEach(table=>{
    realtimeChannel.on('postgres_changes',{event:'*',schema:'public',table},scheduleReload);
  });
  realtimeChannel.subscribe();
}
