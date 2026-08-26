// V1.16.8 — Firma tamamlanma durumu paket kotasına göre hesaplanır; fazla/gelecek ay içeriği kartı sarıya çevirmez.
(function bootFirmPackageCompletionV168(){
  if(window.__mindsFirmPackageCompletionV168)return;
  if(typeof firmMetrics!=='function'||typeof activeFirms!=='function'){
    setTimeout(bootFirmPackageCompletionV168,120);return;
  }
  window.__mindsFirmPackageCompletionV168=true;

  function statusFor(m){
    const pq=Number(m?.pq||0),vq=Number(m?.vq||0);
    const hasPackage=(pq+vq)>0;
    if(!hasPackage)return 'progress';
    const productionDone=Number(m?.post||0)>=pq&&Number(m?.video||0)>=vq;
    const requiredSharesDone=Number(m?.sharedPost||0)>=pq&&Number(m?.sharedVideo||0)>=vq;
    if(productionDone&&requiredSharesDone)return 'done';
    if(productionDone)return 'waiting';
    return 'progress';
  }

  function apply(){
    const firms=activeFirms();
    document.querySelectorAll('#firmCards .firm-card').forEach((card,i)=>{
      if(card.classList.contains('passive-card'))return;
      const f=firms[i];if(!f)return;
      const status=statusFor(firmMetrics(f.id));
      card.classList.remove('status-done','status-waiting','status-progress','firm-done-v115','firm-waiting-v115','firm-progress-v115');
      card.classList.add(`status-${status}`,status==='done'?'firm-done-v115':status==='waiting'?'firm-waiting-v115':'firm-progress-v115');
      const badge=card.querySelector('.firm-state-badge-v112');
      if(badge){
        badge.className=`firm-state-badge-v112 state-${status}`;
        badge.textContent=status==='done'?'✓ Tamamlandı':status==='waiting'?'◷ Paylaşım Bekliyor':'◷ Devam Ediyor';
      }
    });
  }

  const previous=window.renderFirms;
  if(typeof previous==='function'){
    window.renderFirms=function(){const r=previous.apply(this,arguments);apply();return r;};
    try{renderFirms=window.renderFirms;}catch(_e){}
  }

  document.addEventListener('click',e=>{if(e.target.closest('[data-view="firms"]'))setTimeout(apply,80);});
  setTimeout(apply,150);
  setTimeout(apply,700);
  window.applyFirmPackageCompletionV168=apply;
})();
