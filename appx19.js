// V1.13.2 — August 2026 training/test month marker. Official awards start September 2026.
(function bootPerformanceTrainingMonthV1132(){
  if(typeof selectedMonth==='undefined'){
    setTimeout(bootPerformanceTrainingMonthV1132,120);
    return;
  }
  if(window.__mindsPerformanceTrainingV1132) return;
  window.__mindsPerformanceTrainingV1132=true;

  function apply(){
    const body=document.getElementById('performanceBodyV113');
    if(!body) return;
    let note=document.getElementById('performanceTrainingMonthV1132');
    const isTraining=selectedMonth==='2026-08-01';
    if(!isTraining){ if(note) note.remove(); return; }
    if(!note){
      note=document.createElement('div');
      note.id='performanceTrainingMonthV1132';
      note.className='info-banner';
      note.style.marginBottom='12px';
      body.prepend(note);
    }
    note.innerHTML='<b>🧪 Eğitim / Test Ayı:</b> Ağustos 2026 puanları yalnızca sistemi denemek içindir. Bu ay resmi “Ayın Personeli” seçimi ve 🏆 ödül rozeti oluşturulmaz. İlk resmi performans ayı Eylül 2026’dır.';

    const leader=body.querySelector('.performance-leader-v113');
    if(leader){
      const ps=leader.querySelectorAll('p');
      if(ps[0]) ps[0].textContent='Test Sıralaması · Ağustos 2026';
      if(ps.length>1) ps[ps.length-1].textContent='Bu sıralama eğitim amaçlıdır; resmi ödül üretmez.';
    }
  }

  const obs=new MutationObserver(()=>apply());
  obs.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('change',e=>{ if(e.target?.id==='monthPicker') setTimeout(apply,80); });
  setTimeout(apply,200);
})();