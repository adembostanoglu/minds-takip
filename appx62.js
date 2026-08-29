// V1.20.9 — Ana Panel yönetici KPI'larına aylık toplam post/video hedefleri.
(function bootDashboardMonthlyTargetsV209(){
  if(window.__mindsDashboardMonthlyTargetsV209)return;
  if(typeof renderStats!=='function'||typeof isAdmin!=='function'){
    setTimeout(bootDashboardMonthlyTargetsV209,120);return;
  }
  window.__mindsDashboardMonthlyTargetsV209=true;

  const postIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/><path d="m16 15 2 2 3-4"/></svg>';
  const videoIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/><path d="M7 3h5M9.5 1v4"/></svg>';

  function totals(){
    let firms=[];
    try{firms=typeof selectedMonthFirms==='function'?selectedMonthFirms():[];}catch(_e){}
    const ids=new Set((firms||[]).map(f=>f.id));
    const months=(state?.months||[]).filter(m=>m.month===selectedMonth&&ids.has(m.firm_id));
    return months.reduce((a,m)=>{
      a.post+=Number(m.post_quota||0);
      a.video+=Number(m.video_quota||0);
      return a;
    },{post:0,video:0});
  }

  function card(label,value,icon,tone){
    return `<div class="dash-kpi-card dash-kpi-${tone} dash-target-v209"><div class="dash-kpi-icon">${icon}</div><div class="dash-kpi-body"><div class="dash-kpi-label">${label}</div><div class="dash-kpi-value">${value}</div><div class="dash-kpi-foot">Hazırlanması gereken</div></div></div>`;
  }

  function inject(){
    if(!isAdmin())return;
    const stats=document.getElementById('stats');
    if(!stats)return;
    stats.querySelectorAll('.dash-target-v209').forEach(x=>x.remove());
    const t=totals();
    const holder=document.createElement('div');
    holder.innerHTML=card('Toplam Post Hedefi',t.post,postIcon,'gold')+card('Toplam Video Hedefi',t.video,videoIcon,'indigo');
    const nodes=[...holder.children];
    const first=stats.firstElementChild;
    if(first){
      first.insertAdjacentElement('afterend',nodes[1]);
      first.insertAdjacentElement('afterend',nodes[0]);
    }else nodes.forEach(n=>stats.appendChild(n));
  }

  const previous=renderStats;
  const wrapped=function(){
    const r=previous.apply(this,arguments);
    inject();
    return r;
  };
  try{renderStats=wrapped;}catch(_e){}
  try{window.renderStats=wrapped;}catch(_e){}

  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(inject,80);});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="dashboard"]'))setTimeout(inject,60);});
  setTimeout(inject,180);
})();
