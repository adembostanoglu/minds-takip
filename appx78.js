// V1.23.6 — Mesai onayı sonrası hakediş ve onaylı mesai tutarını payroll_preview'dan anında yeniler.
(function bootAttendancePayrollRefreshV236(){
  if(window.__mindsAttendancePayrollRefreshV236)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){setTimeout(bootAttendancePayrollRefreshV236,140);return;}
  window.__mindsAttendancePayrollRefreshV236=true;

  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const monthStart=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';

  function selectedPersonId(){
    const drawer=document.getElementById('attDetailDrawerV166');
    const ds=drawer?.querySelector('[data-original-id="attPersonSelectV160"]');
    if(ds?.value)return ds.value;
    const real=[...document.querySelectorAll('#attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    return real?.value||'';
  }

  function patchSummary(root,p){
    root?.querySelectorAll('.att-detail-item-v160').forEach(card=>{
      const label=card.querySelector('small')?.textContent?.trim();
      const value=card.querySelector('b');if(!value)return;
      if(label==='Maaş')value.textContent=money(p.monthly_salary);
      else if(label==='Saatlik')value.textContent=money(p.hourly_rate);
      else if(label==='Geç Kalma Kesintisi')value.textContent='-'+money(p.late_deduction);
      else if(label==='Onaylı Mesai')value.textContent='+'+money(p.overtime_amount);
      else if(label==='Ücretsiz İzin')value.textContent='-'+money(p.unpaid_leave_deduction);
      else if(label==='Hakediş')value.textContent=money(p.payable_amount);
    });
  }

  function patchPayrollRow(pid,p){
    const btn=document.querySelector(`#attendance [data-att-detail="${CSS.escape(pid)}"]`);const tr=btn?.closest('tr'),table=tr?.closest('table');if(!tr||!table)return;
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
    const fm=heads.indexOf('fm onaylı'),hak=heads.indexOf('hakediş');
    if(fm>=0&&tr.children[fm])tr.children[fm].textContent=minsText(p.overtime_minutes_approved);
    if(hak>=0&&tr.children[hak])tr.children[hak].textContent=money(p.payable_amount);
  }

  async function refreshPayroll(){
    if(!admin())return;
    const pid=selectedPersonId();if(!pid)return;
    try{
      const {data,error}=await sb.rpc('payroll_preview',{p_month:monthStart(),p_person_id:pid});
      if(error)throw error;const p=Array.isArray(data)?data[0]:data;if(!p)return;
      patchSummary(document.getElementById('attDetailDrawerV166'),p);
      const native=document.getElementById('attendance');if(native)patchSummary(native,p);
      patchPayrollRow(pid,p);
    }catch(e){console.warn('Hakediş anlık yenileme',e);}
  }

  function schedule(){[260,650,1100].forEach(ms=>setTimeout(refreshPayroll,ms));}
  document.addEventListener('click',e=>{
    if(e.target.closest('#attDetailDrawerV166 [data-v235-normal],#attDetailDrawerV166 [data-v235-manual-id],#attDetailDrawerV166 [data-v235-manual-date]'))schedule();
  },true);
})();
