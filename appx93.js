// V1.25.5 — Admin-only annual leave balance and fragmented leave usage tracking.
(function bootAnnualLeaveV255(){
  if(window.__mindsAnnualLeaveV255)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof isAdmin!=='function'||typeof openModal!=='function'){
    setTimeout(bootAnnualLeaveV255,160);return;
  }
  if(!isAdmin())return;
  window.__mindsAnnualLeaveV255=true;

  let balances=[],entries=[],year=new Date().getFullYear(),busy=false,realtime=null;
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const staff=()=>typeof activeProfiles==='function'?activeProfiles().filter(p=>p.role!=='admin'):(state.profiles||[]).filter(p=>p.active&&p.role!=='admin');
  const person=id=>(state.profiles||[]).find(p=>String(p.id)===String(id));
  const fmt=n=>{const x=Number(n||0);return Number.isInteger(x)?String(x):x.toLocaleString('tr-TR',{maximumFractionDigits:2});};
  const fmtDate=v=>typeof formatDate==='function'?formatDate(v):String(v||'').slice(0,10);
  const todayTR=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const yearStart=y=>`${y}-01-01`;
  const yearEnd=y=>`${y}-12-31`;

  function installStyle(){
    if(document.getElementById('annualLeaveV255Style'))return;
    const s=document.createElement('style');s.id='annualLeaveV255Style';s.textContent=`
      #annualLeave .annual-head-v255{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
      #annualLeave .annual-actions-v255{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      #annualLeaveYearV255{min-width:110px}
      #annualLeaveCardsV255{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:11px;margin:12px 0 16px}
      #annualLeave .annual-card-v255{border:1px solid #29343a;border-radius:13px;background:linear-gradient(145deg,#11181c,#0d1316);padding:14px}
      #annualLeave .annual-card-top-v255{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
      #annualLeave .annual-card-v255 h3{margin:0;font-size:14px}.annual-role-v255{color:#849198;font-size:9px;margin-top:4px}
      #annualLeave .annual-grid-v255{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}
      #annualLeave .annual-mini-v255{border:1px solid #273137;border-radius:9px;background:#0f1518;padding:9px}
      #annualLeave .annual-mini-v255 small{display:block;color:#829097;font-size:8px;margin-bottom:4px}
      #annualLeave .annual-mini-v255 b{font-size:17px}.annual-mini-v255.used b{color:#e5bf66}.annual-mini-v255.left b{color:#8bd47c}.annual-mini-v255.negative b{color:#ef8585}
      #annualLeave .annual-card-actions-v255{display:flex;gap:6px;margin-top:11px;flex-wrap:wrap}
      #annualLeave .annual-card-actions-v255 button{font-size:9px;padding:7px 9px}
      #annualLeave .annual-entry-note-v255{max-width:330px;white-space:normal;color:#89969c;font-size:9px}
      #annualLeave .annual-empty-v255{padding:26px;text-align:center;color:#7b888e}
      @media(max-width:760px){#annualLeaveCardsV255{grid-template-columns:1fr}#annualLeave .annual-actions-v255{width:100%}#annualLeaveYearV255{flex:1}#annualLeave .table-wrap{overflow:auto}}
    `;document.head.appendChild(s);
  }

  function ensureUi(){
    installStyle();
    let nav=document.querySelector('.nav-item[data-view="annualLeave"]');
    if(!nav){
      nav=document.createElement('button');
      nav.className='nav-item admin-nav';
      nav.dataset.view='annualLeave';
      nav.innerHTML='☂ <span>Yıllık İzin</span>';
      const attendance=[...document.querySelectorAll('.nav-item')].find(b=>/mesai|puantaj/i.test(b.textContent||'')||b.dataset.view==='attendance');
      if(attendance?.parentNode)attendance.insertAdjacentElement('afterend',nav);
      else document.querySelector('.sidebar nav')?.appendChild(nav);
      nav.addEventListener('click',()=>showView());
    }
    if(!document.getElementById('annualLeave')){
      const section=document.createElement('section');section.id='annualLeave';section.className='view';
      section.innerHTML=`
        <div class="annual-head-v255">
          <div><h2>Yıllık İzin</h2><p>Personelin yıllık izin hakkını, parça parça kullanımını ve kalan bakiyesini takip et.</p></div>
          <div class="annual-actions-v255">
            <select id="annualLeaveYearV255" class="select"></select>
            <button id="annualLeaveAddV255" class="primary">+ İzin Gir</button>
          </div>
        </div>
        <div class="info-banner"><b>Takip mantığı:</b> Yıllık hak + devir − kullanılan gün = kalan izin. Hak miktarını yönetici belirler; sistem yasal gün sayısı varsaymaz.</div>
        <div id="annualLeaveCardsV255"></div>
        <section class="panel">
          <div class="panel-head"><div><h3>İzin Geçmişi</h3><p>Seçili yıldaki tüm yıllık izin kullanımları</p></div></div>
          <div class="table-wrap"><table><thead><tr><th>Personel</th><th>Başlangıç</th><th>Bitiş</th><th>Kullanılan</th><th>Not</th><th>İşlem</th></tr></thead><tbody id="annualLeaveRowsV255"></tbody></table></div>
        </section>`;
      document.querySelector('main.main')?.appendChild(section);
      const ys=document.getElementById('annualLeaveYearV255');
      const now=new Date().getFullYear();
      ys.innerHTML=Array.from({length:7},(_,i)=>now+2-i).map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('');
      ys.addEventListener('change',()=>{year=Number(ys.value);load();});
      document.getElementById('annualLeaveAddV255').addEventListener('click',()=>openEntry());
    }
  }

  function showView(){
    ensureUi();
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));
    document.getElementById('annualLeave')?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
    document.querySelector('.nav-item[data-view="annualLeave"]')?.classList.add('active');
    const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');
    if(t)t.textContent='Yıllık İzin';
    if(s)s.textContent='Personel izin hakları, kullanımlar ve kalan bakiyeler.';
    load();
  }

  function balanceFor(pid){return balances.find(b=>String(b.person_id)===String(pid));}
  function usedFor(pid){return entries.filter(e=>String(e.person_id)===String(pid)).reduce((n,e)=>n+Number(e.days_used||0),0);}

  function render(){
    ensureUi();
    const cards=document.getElementById('annualLeaveCardsV255'),rows=document.getElementById('annualLeaveRowsV255');if(!cards||!rows)return;
    const people=staff();
    cards.innerHTML=people.map(p=>{
      const b=balanceFor(p.id),ent=Number(b?.entitlement_days||0),carry=Number(b?.carryover_days||0),used=usedFor(p.id),left=ent+carry-used;
      return `<article class="annual-card-v255">
        <div class="annual-card-top-v255"><div><h3>${esc(p.full_name)}</h3><div class="annual-role-v255">${esc(p.job_title||'Personel')}</div></div><span class="badge yellow">${year}</span></div>
        <div class="annual-grid-v255">
          <div class="annual-mini-v255"><small>Toplam Hak</small><b>${fmt(ent+carry)}</b></div>
          <div class="annual-mini-v255 used"><small>Kullanılan</small><b>${fmt(used)}</b></div>
          <div class="annual-mini-v255 left ${left<0?'negative':''}"><small>Kalan</small><b>${fmt(left)}</b></div>
        </div>
        <div class="annual-card-actions-v255">
          <button class="small-primary" data-annual-balance-v255="${p.id}">Hak Düzenle</button>
          <button class="ghost" data-annual-add-person-v255="${p.id}">İzin Gir</button>
        </div>
      </article>`;
    }).join('')||'<div class="annual-empty-v255">Aktif personel yok.</div>';

    const ordered=entries.slice().sort((a,b)=>String(b.start_date).localeCompare(String(a.start_date))||String(b.created_at).localeCompare(String(a.created_at)));
    rows.innerHTML=ordered.map(e=>`<tr>
      <td><b>${esc(person(e.person_id)?.full_name||'—')}</b></td>
      <td>${fmtDate(e.start_date)}</td><td>${fmtDate(e.end_date)}</td>
      <td><span class="badge yellow">${fmt(e.days_used)} gün</span></td>
      <td><div class="annual-entry-note-v255">${esc(e.note||'—')}</div></td>
      <td><div class="row-actions"><button class="small-primary" data-annual-edit-v255="${e.id}">Düzenle</button><button class="small-danger" data-annual-delete-v255="${e.id}">Sil</button></div></td>
    </tr>`).join('')||'<tr><td colspan="6" class="empty">Bu yıl için izin kaydı yok.</td></tr>';
  }

  async function load(){
    if(busy)return;busy=true;
    try{
      const [b,e]=await Promise.all([
        sb.from('annual_leave_balances').select('*').eq('leave_year',year),
        sb.from('annual_leave_entries').select('*').eq('leave_year',year).order('start_date',{ascending:false})
      ]);
      if(b.error)throw b.error;if(e.error)throw e.error;
      balances=b.data||[];entries=e.data||[];render();
    }catch(err){console.error('[Yıllık izin]',err);if(typeof toast==='function')toast('Yıllık izin verileri alınamadı: '+(err?.message||err),true);}
    finally{busy=false;}
  }

  function openBalance(pid){
    const p=person(pid),b=balanceFor(pid);if(!p)return;
    openModal(`${p.full_name} — ${year} İzin Hakkı`,`<div class="form-grid">
      <div class="field full"><label>Personel</label><input value="${esc(p.full_name)}" disabled></div>
      <div class="field"><label>Yıllık Hak (gün)</label><input name="entitlement" type="number" min="0" step="0.5" value="${Number(b?.entitlement_days||0)}" required></div>
      <div class="field"><label>Önceki Yıldan Devir</label><input name="carryover" type="number" min="0" step="0.5" value="${Number(b?.carryover_days||0)}" required></div>
      <div class="field full"><label>Not</label><textarea name="note" rows="3">${esc(b?.note||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      const entitlement=Number(fd.get('entitlement')),carryover=Number(fd.get('carryover'));
      if(!Number.isFinite(entitlement)||entitlement<0||!Number.isFinite(carryover)||carryover<0)throw new Error('İzin hakkı 0 veya daha büyük olmalı.');
      const payload={entitlement_days:entitlement,carryover_days:carryover,note:String(fd.get('note')||'').trim()||null,updated_at:new Date().toISOString()};
      if(b){const {error}=await sb.from('annual_leave_balances').update(payload).eq('id',b.id);if(error)throw error;}
      else {payload.person_id=pid;payload.leave_year=year;payload.created_by=profile.id;const {error}=await sb.from('annual_leave_balances').insert(payload);if(error)throw error;}
      await load();
    });
  }

  function openEntry(pid=null,row=null){
    const people=staff();if(!people.length)return typeof toast==='function'&&toast('Aktif personel yok.',true);
    const selected=row?.person_id||pid||people[0].id;
    const current=todayTR(),defDate=String(current).startsWith(String(year))?current:yearStart(year);
    openModal(row?'Yıllık İzni Düzenle':'Yıllık İzin Gir',`<div class="form-grid">
      <div class="field full"><label>Personel</label><select name="person" required>${people.map(p=>`<option value="${p.id}" ${String(p.id)===String(selected)?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>
      <div class="field"><label>Başlangıç Tarihi</label><input name="start" type="date" min="${yearStart(year)}" max="${yearEnd(year)}" value="${row?.start_date||defDate}" required></div>
      <div class="field"><label>Bitiş Tarihi</label><input name="end" type="date" min="${yearStart(year)}" max="${yearEnd(year)}" value="${row?.end_date||defDate}" required></div>
      <div class="field full"><label>Kullanılan İzin (gün)</label><input name="days" type="number" min="0.5" step="0.5" value="${Number(row?.days_used||1)}" required><div class="field-help">Örn. yarım gün = 0,5 · bir gün = 1 · iki gün = 2. Hafta sonu/tatil hesabını senin girdiğin gün sayısı belirler.</div></div>
      <div class="field full"><label>Not</label><textarea name="note" rows="3" placeholder="Örn. yıllık izin / şehir dışı">${esc(row?.note||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      const personId=String(fd.get('person')||''),start=String(fd.get('start')||''),end=String(fd.get('end')||''),days=Number(fd.get('days'));
      if(!personId)throw new Error('Personel seçmelisin.');
      if(!start||!end||end<start)throw new Error('Tarih aralığını kontrol et.');
      if(!start.startsWith(String(year))||!end.startsWith(String(year)))throw new Error('İzin tarihleri seçili yıl içinde olmalı.');
      if(!Number.isFinite(days)||days<=0)throw new Error('Kullanılan izin günü 0’dan büyük olmalı.');
      const payload={person_id:personId,leave_year:year,start_date:start,end_date:end,days_used:days,note:String(fd.get('note')||'').trim()||null,updated_at:new Date().toISOString()};
      if(row){const {error}=await sb.from('annual_leave_entries').update(payload).eq('id',row.id);if(error)throw error;}
      else {payload.created_by=profile.id;const {error}=await sb.from('annual_leave_entries').insert(payload);if(error)throw error;}
      await load();
    });
  }

  async function removeEntry(id){
    const row=entries.find(x=>String(x.id)===String(id));if(!row)return;
    if(!confirm(`${person(row.person_id)?.full_name||'Personel'} — ${fmt(row.days_used)} günlük izin kaydı silinsin mi?`))return;
    const {error}=await sb.from('annual_leave_entries').delete().eq('id',id);if(error)return typeof toast==='function'&&toast('İzin kaydı silinemedi: '+error.message,true);
    await load();if(typeof toast==='function')toast('İzin kaydı silindi.');
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-annual-balance-v255]');if(b){e.preventDefault();openBalance(b.dataset.annualBalanceV255);return;}
    const a=e.target.closest('[data-annual-add-person-v255]');if(a){e.preventDefault();openEntry(a.dataset.annualAddPersonV255);return;}
    const ed=e.target.closest('[data-annual-edit-v255]');if(ed){e.preventDefault();openEntry(null,entries.find(x=>String(x.id)===String(ed.dataset.annualEditV255)));return;}
    const del=e.target.closest('[data-annual-delete-v255]');if(del){e.preventDefault();removeEntry(del.dataset.annualDeleteV255);return;}
  },true);

  function subscribe(){
    if(realtime)try{sb.removeChannel(realtime)}catch(_e){}
    realtime=sb.channel('annual-leave-v255')
      .on('postgres_changes',{event:'*',schema:'public',table:'annual_leave_balances'},()=>load())
      .on('postgres_changes',{event:'*',schema:'public',table:'annual_leave_entries'},()=>load())
      .subscribe();
  }

  ensureUi();subscribe();
})();