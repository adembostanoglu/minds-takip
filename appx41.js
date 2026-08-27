// V1.17.6 — Mesai ekranında yönetici hesaplarını personel listelerinden gizler.
(function bootAttendanceStaffOnlyV176(){
  if(window.__mindsAttendanceStaffOnlyV176)return;
  window.__mindsAttendanceStaffOnlyV176=true;

  const adminIds=()=>new Set((state?.profiles||[]).filter(p=>p.role==='admin').map(p=>String(p.id)));
  const adminNames=()=>new Set((state?.profiles||[]).filter(p=>p.role==='admin').map(p=>String(p.full_name||'').trim().toLocaleLowerCase('tr-TR')));

  function isAdminOption(opt){
    const ids=adminIds(),names=adminNames();
    return ids.has(String(opt.value||'')) || names.has(String(opt.textContent||'').trim().toLocaleLowerCase('tr-TR'));
  }

  function stripSelects(scope=document){
    scope.querySelectorAll('#attPersonSelectV160,#attDrawerPersonV166,select[name="person_id"]').forEach(sel=>{
      [...sel.options].forEach(opt=>{if(isAdminOption(opt))opt.remove();});
      if(sel.selectedIndex<0 && sel.options.length)sel.selectedIndex=0;
    });
  }

  function parseTRY(text){
    const s=String(text||'').replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',','.');
    const n=Number(s);return Number.isFinite(n)?n:0;
  }
  function fmtTRY(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n||0));}

  function payrollPanel(){
    return [...document.querySelectorAll('#attendanceRootV160 .att-panel-v160')].find(p=>p.querySelector('.att-panel-head-v160 h3')?.textContent.trim()==='Aylık Puantaj & Hakediş');
  }
  function todayPanel(){
    return [...document.querySelectorAll('#attendanceRootV160 .att-panel-v160')].find(p=>p.querySelector('.att-panel-head-v160 h3')?.textContent.trim()==='Bugün Ekip Durumu');
  }

  function stripPayrollRows(){
    const ids=adminIds();
    document.querySelectorAll('#attendanceRootV160 [data-att-detail]').forEach(btn=>{
      if(ids.has(String(btn.dataset.attDetail||'')))btn.closest('tr')?.remove();
    });
    const panel=payrollPanel();
    if(panel){
      const count=panel.querySelectorAll('tbody [data-att-detail]').length;
      const badge=panel.querySelector('.att-panel-head-v160 .att-badge-v160');
      if(badge)badge.textContent=`${count} personel`;
    }
  }

  function stripTodayRows(){
    const names=adminNames(),panel=todayPanel();
    if(!panel)return;
    const body=panel.querySelector('.att-panel-body-v160');
    if(!body)return;
    [...body.children].forEach(row=>{
      const name=row.querySelector('b')?.textContent.trim().toLocaleLowerCase('tr-TR');
      if(name&&names.has(name))row.remove();
    });
  }

  function refreshTopKpis(){
    const cards=[...document.querySelectorAll('#attendanceRootV160 .att-team-stat-v160')];
    if(!cards.length)return;
    const byLabel=label=>cards.find(c=>c.querySelector('small')?.textContent.trim().includes(label));

    const panel=todayPanel(),rows=panel?[...panel.querySelector('.att-panel-body-v160')?.children||[]]:[];
    let office=0,field=0,away=0,missing=0;
    rows.forEach(row=>{
      const t=String(row.querySelector('.att-badge-v160')?.textContent||'');
      if(t==='Ofiste')office++;
      else if(t.includes('Saha'))field++;
      else if(t.includes('Henüz giriş'))missing++;
      else if(!t.includes('Çıkış'))away++;
    });
    const set=(label,val)=>{const c=byLabel(label);const b=c?.querySelector('b');if(b)b.textContent=String(val);};
    set('Ofiste',office);set('Sahada',field);set('İzin / Rapor',away);set('Henüz Giriş Yok',missing);

    const pp=payrollPanel();
    if(pp){
      const total=[...pp.querySelectorAll('tbody .money-strong')].reduce((s,el)=>s+parseTRY(el.textContent),0);
      const tc=cards.find(c=>c.querySelector('small')?.textContent.includes('Toplam Hakediş'));
      const b=tc?.querySelector('b');if(b)b.textContent=fmtTRY(total);
    }
  }

  function stripDrawerAdmin(){
    stripSelects(document);
    const drawer=document.getElementById('attDetailDrawerV166');
    if(!drawer)return;
    const h=drawer.querySelector('.att-drawer-head-v166 h3');
    if(h&&adminNames().has(h.textContent.replace('• Detay','').trim().toLocaleLowerCase('tr-TR'))){
      drawer.classList.remove('open');
      document.getElementById('attDetailBackdropV166')?.classList.remove('open');
    }
  }

  function apply(){
    stripPayrollRows();
    stripTodayRows();
    stripSelects(document);
    stripDrawerAdmin();
    refreshTopKpis();
  }

  function watchRoot(){
    const root=document.getElementById('attendanceRootV160');
    if(!root||root.dataset.staffOnlyV176)return;
    root.dataset.staffOnlyV176='1';
    let pending=false;
    new MutationObserver(()=>{
      if(pending)return;pending=true;
      requestAnimationFrame(()=>{pending=false;apply();});
    }).observe(root,{childList:true,subtree:true});
  }

  function watchModal(){
    const form=document.getElementById('modalForm');
    if(!form||form.dataset.staffOnlyV176)return;
    form.dataset.staffOnlyV176='1';
    new MutationObserver(()=>stripSelects(form)).observe(form,{childList:true,subtree:true});
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="attendance"],#attendanceRootV160,[data-att-detail]')){
      setTimeout(()=>{watchRoot();watchModal();apply();},40);
      setTimeout(apply,220);
    }
  },true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>setTimeout(apply,220),true);
  setTimeout(()=>{watchRoot();watchModal();apply();},500);
})();
