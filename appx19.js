// V1.13.2.1 — safe August 2026 training/test marker, no MutationObserver loop.
(function bootPerformanceTrainingMonthV11321(){
  if(window.__mindsPerformanceTrainingV11321) return;
  window.__mindsPerformanceTrainingV11321=true;

  function apply(){
    if(typeof selectedMonth==='undefined') return false;
    const body=document.getElementById('performanceBodyV113');
    if(!body) return false;

    let note=document.getElementById('performanceTrainingMonthV1132');
    const isTraining=selectedMonth==='2026-08-01';
    if(!isTraining){ if(note) note.remove(); return true; }

    if(!note){
      note=document.createElement('div');
      note.id='performanceTrainingMonthV1132';
      note.className='info-banner';
      note.style.marginBottom='12px';
      note.innerHTML='<b>🧪 Eğitim / Test Ayı:</b> Ağustos 2026 puanları yalnızca sistemi denemek içindir. Bu ay resmi “Ayın Personeli” seçimi ve 🏆 ödül rozeti oluşturulmaz. İlk resmi performans ayı Eylül 2026’dır.';
      body.prepend(note);
    }

    const leader=body.querySelector('.performance-leader-v113');
    if(leader && leader.dataset.trainingMarked!=='1'){
      leader.dataset.trainingMarked='1';
      const ps=leader.querySelectorAll('p');
      if(ps[0]) ps[0].textContent='Test Sıralaması · Ağustos 2026';
      if(ps.length>1) ps[ps.length-1].textContent='Bu sıralama eğitim amaçlıdır; resmi ödül üretmez.';
    }
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(apply() || tries>=30) clearInterval(timer);
  },150);

  document.addEventListener('change',e=>{
    if(e.target?.id==='monthPicker') setTimeout(apply,120);
  });
})();