// V1.26.9 — Puantaj Güvenlik Katmanı UI
(function bootAttendanceSafetyV269(){
  if(window.__mindsAttendanceSafetyV269)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){
    setTimeout(bootAttendanceSafetyV269,150);return;
  }
  window.__mindsAttendanceSafetyV269=true;

  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const monthKey=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';
  const dateTR=v=>{if(!v)return '—';const [y,m,d]=String(v).slice(0,10).split('-');return d+'.'+m+'.'+y;};
  let busy=false,timer=null;

  function style(){
    if(document.getElementById('attendanceSafetyV269Style'))return;
    const s=document.createElement('style');
    s.id='attendanceSafetyV269Style';
    s.textContent=`
      .att-safety-v269{margin:0 0 14px;border:1px solid #2d393f;border-radius:14px;background:#0f161a;overflow:hidden}
      .att-safety-head-v269{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border-bottom:1px solid #29343a;background:linear-gradient(180deg,#151d21,#11181c)}
      .att-safety-head-v269 h3{margin:0;font-size:14px;color:#eef2f3}.att-safety-head-v269 p{margin:4px 0 0;color:#849198;font-size:9px}
      .att-safety-actions-v269{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
      .att-safety-grid-v269{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:12px}
      .att-safety-card-v269{border:1px solid #2b353b;border-radius:10px;background:#11181c;padding:10px}.att-safety-card-v269 small{display:block;color:#809096;font-size:8px}.att-safety-card-v269 b{display:block;font-size:18px;margin-top:5px}
      .att-safety-card-v269.good{border-color:#315a3c;background:#14241a}.att-safety-card-v269.good b{color:#8fd09b}
      .att-safety-card-v269.warn{border-color:#5c4b25;background:#211d12}.att-safety-card-v269.warn b{color:#dfc65f}
      .att-safety-card-v269.bad{border-color:#683a37;background:#211617}.att-safety-card-v269.bad b{color:#ee8179}
      .att-safety-card-v269.locked{border-color:#315570;background:#142a3f}.att-safety-card-v269.locked b{color:#86b9e4}
      .att-safety-list-v269{padding:0 12px 12px;display:grid;gap:7px}
      .att-safety-item-v269{display:grid;grid-template-columns:90px 150px 1fr auto;gap:9px;align-items:center;border:1px solid #2b353b;border-radius:9px;background:#11181c;padding:8px 10px;font-size:9px}
      .att-safety-item-v269.critical{border-color:#683a37;background:#211617}.att-safety-item-v269.warning{border-color:#5c4b25;background:#211d12}
      .att-safety-item-v269 strong{font-size:9px}.att-safety-item-v269 span{color:#a6b0b5}.att-safety-item-v269 em{font-style:normal;font-size:8px;color:#7f8d93}
      .att-safety-empty-v269{margin:0 12px 12px;border:1px solid #315a3c;background:#14241a;color:#8dd09a;border-radius:9px;padding:10px;font-size:9px;font-weight:750}
      @media(max-width:900px){.att-safety-grid-v269{grid-template-columns:repeat(2,1fr)}.att-safety-item-v269{grid-template-columns:1fr}.att-safety-actions-v269{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function host(){
    const root=document.getElementById('attendanceRootV160');if(!root)return null;
    let h=document.getElementById('attendanceSafetyV269');
    if(!h){
      h=document.createElement('section');h.id='attendanceSafetyV269';h.className='att-safety-v269';
      const head=root.querySelector('.att-head-v160');
      head?head.insertAdjacentElement('afterend',h):root.prepend(h);
    }
    return h;
  }

  async function refresh(){
    if(!admin()||busy)return;
    const h=host();if(!h)return;busy=true;style();
    const month=monthKey();
    h.innerHTML='<div class="att-safety-head-v269"><div><h3>🛡 Puantaj Sağlığı</h3><p>Çakışma, açık kayıt, fazla mesai ve ay kilidi kontrol ediliyor.</p></div></div><div class="att-safety-empty-v269">Kontrol ediliyor...</div>';
    try{
      const [health,lock]=await Promise.all([
        sb.rpc('attendance_health_preview',{p_month:month,p_person_id:null}),
        sb.from('attendance_month_locks').select('*').eq('month',month).maybeSingle()
      ]);
      if(health.error)throw health.error;if(lock.error)throw lock.error;
      const issues=health.data||[],critical=issues.filter(x=>x.severity==='critical'),warnings=issues.filter(x=>x.severity==='warning');
      const locked=!!lock.data?.locked;
      const clean=Math.max(0,(state?.profiles||[]).filter(p=>p.active&&p.role!=='admin').length-new Set(issues.map(x=>x.person_id)).size);
      h.innerHTML=`
        <div class="att-safety-head-v269">
          <div><h3>🛡 Puantaj Sağlığı</h3><p>Maaş hesabına etki edebilecek tutarsızlıkları ay kapanmadan önce kontrol eder.</p></div>
          <div class="att-safety-actions-v269">
            <span class="att-badge-v160 ${locked?'blue':'muted'}">${locked?'🔒 Ay Kilitli':'🔓 Ay Açık'}</span>
            <button class="${locked?'ghost':'primary'}" data-att-month-lock-v269="${locked?'unlock':'lock'}">${locked?'Kilidi Aç':'Ayı Kilitle'}</button>
          </div>
        </div>
        <div class="att-safety-grid-v269">
          <div class="att-safety-card-v269 bad"><small>Kritik Hata</small><b>${critical.length}</b></div>
          <div class="att-safety-card-v269 warn"><small>Kontrol Gereken</small><b>${warnings.length}</b></div>
          <div class="att-safety-card-v269 good"><small>Sorunsuz Personel</small><b>${clean}</b></div>
          <div class="att-safety-card-v269 ${locked?'locked':''}"><small>Ay Durumu</small><b>${locked?'Kilitli':'Açık'}</b></div>
        </div>
        ${issues.length?`<div class="att-safety-list-v269">${issues.slice(0,20).map(x=>`
          <div class="att-safety-item-v269 ${x.severity}">
            <strong>${esc(x.full_name)}</strong>
            <span>${dateTR(x.work_date)}</span>
            <div><strong>${esc(x.title)}</strong><br><em>${esc(x.detail)}</em></div>
            <span class="att-badge-v160 ${x.severity==='critical'?'bad':'warn'}">${x.severity==='critical'?'KRİTİK':'KONTROL'}</span>
          </div>`).join('')}</div>`:'<div class="att-safety-empty-v269">✅ Bu ay için kritik puantaj çakışması görünmüyor.</div>'}
      `;
    }catch(e){
      console.warn('Puantaj sağlık kontrolü',e);
      h.innerHTML='<div class="att-safety-empty-v269" style="border-color:#683a37;background:#211617;color:#ee8179">Puantaj sağlık kontrolü alınamadı: '+esc(e.message||e)+'</div>';
    }finally{busy=false;}
  }

  async function toggle(action){
    if(!admin())return;
    const label=action==='lock'?'Bu ayı kilitleme sebebi':'Kilidi açma sebebi';
    const reason=prompt(label+' (zorunlu):','Ay sonu puantaj kontrolü');
    if(!reason||reason.trim().length<3)return;
    try{
      const fn=action==='lock'?'attendance_lock_month':'attendance_unlock_month';
      const {error}=await sb.rpc(fn,{p_month:monthKey(),p_reason:reason.trim()});
      if(error)throw error;
      if(typeof toast==='function')toast(action==='lock'?'Puantaj ayı kilitlendi.':'Puantaj ayı tekrar açıldı.');
      refresh();
    }catch(e){
      if(typeof toast==='function')toast(e.message||String(e),true);
    }
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(refresh,180);}
  document.addEventListener('click',e=>{
    if(e.target.closest('.nav-item[data-view="attendance"],[data-att-detail],[data-att-edit-day],[data-att-overtime]'))schedule();
    const b=e.target.closest('[data-att-month-lock-v269]');
    if(b){e.preventDefault();toggle(b.dataset.attMonthLockV269);}
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker'||e.target?.id==='attPersonSelectV160')schedule();},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});

  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view')){host();}},1200);
  setTimeout(schedule,700);
})();