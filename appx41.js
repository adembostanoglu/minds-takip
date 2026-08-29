// V1.21.4 — Mesai ekranında yönetici hesaplarını personel listelerinden gizler; observer kendi DOM değişikliklerinde yeniden tetiklenmez.
(function bootAttendanceStaffOnlyV214(){
  if(window.__mindsAttendanceStaffOnlyV214)return;
  window.__mindsAttendanceStaffOnlyV214=true;

  let rootObserver=null,rootObserved=null,rootPending=false;
  let modalObserver=null,modalObserved=null,modalPending=false;

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
      if(badge&&badge.textContent!==`${count} personel`)badge.textContent=`${count} personel`;
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
    const set=(label,val)=>{const c=byLabel(label),b=c?.querySelector('b');if(b&&b.textContent!==String(val))b.textContent=String(val);};
    set('Ofiste',office);set('Sahada',field);set('İzin / Rapor',away);set('Henüz Giriş Yok',missing);
    const pp=payrollPanel();
    if(pp){
      const total=[...pp.querySelectorAll('tbody .money-strong')].reduce((s,el)=>s+parseTRY(el.textContent),0);
      const tc=cards.find(c=>c.querySelector('small')?.textContent.includes('Toplam Hakediş'));
      const b=tc?.querySelector('b'),txt=fmtTRY(total);if(b&&b.textContent!==txt)b.textContent=txt;
    }
  }

  function stripDrawerAdmin(){
    stripSelects(document);
    const drawer=document.getElementById('attDetailDrawerV166');
    if(!drawer)return;
    const h=drawer.querySelector('.att-drawer-head-v166 h3');
    if(h&&adminNames().has(h.textContent.replace('• Detay','').trim().toLocaleLowerCase('tr-TR'))){
      drawer.classList.remove('open');document.getElementById('attDetailBackdropV166')?.classList.remove('open');
    }
  }

  function apply(){
    stripPayrollRows();stripTodayRows();stripSelects(document);stripDrawerAdmin();refreshTopKpis();
  }

  function observeRoot(root){
    if(!rootObserver)rootObserver=new MutationObserver(()=>{
      if(rootPending||document.hidden)return;
      rootPending=true;
      requestAnimationFrame(()=>{
        rootPending=false;
        const current=document.getElementById('attendanceRootV160');
        rootObserver.disconnect();
        try{apply();}finally{
          if(current?.isConnected){rootObserved=current;rootObserver.observe(current,{childList:true,subtree:true});}
        }
      });
    });
    rootObserver.disconnect();rootObserved=root;rootObserver.observe(root,{childList:true,subtree:true});
  }

  function watchRoot(){
    const root=document.getElementById('attendanceRootV160');
    if(!root)return;
    if(rootObserved!==root)observeRoot(root);
  }

  function observeModal(form){
    if(!modalObserver)modalObserver=new MutationObserver(()=>{
      if(modalPending)return;modalPending=true;
      requestAnimationFrame(()=>{
        modalPending=false;modalObserver.disconnect();
        try{stripSelects(form);}finally{if(form.isConnected){modalObserved=form;modalObserver.observe(form,{childList:true,subtree:true});}}
      });
    });
    modalObserver.disconnect();modalObserved=form;modalObserver.observe(form,{childList:true,subtree:true});
  }

  function watchModal(){const form=document.getElementById('modalForm');if(form&&modalObserved!==form)observeModal(form);}
  function scheduleApply(){
    [40,180,520].forEach(ms=>setTimeout(()=>{watchRoot();watchModal();apply();},ms));
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="attendance"],#attendanceRootV160,[data-att-detail],[data-att-edit-day],[data-att-overtime],#attClockInV160,#attClockOutV160'))scheduleApply();
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]'))scheduleApply();},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleApply();});
  setTimeout(scheduleApply,500);
})();