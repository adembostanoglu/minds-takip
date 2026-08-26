// V1.16.7 — firm completion colors use required package quotas; surplus/future content does not block completion
(function bootFirmCompletionColorsV117(){
  if(window.__mindsFirmCompletionColorsV117) return;
  if(typeof firmMetrics!=='function' || typeof activeFirms!=='function'){
    setTimeout(bootFirmCompletionColorsV117,100);
    return;
  }
  window.__mindsFirmCompletionColorsV117=true;

  function statusForMetrics(m){
    if(!m) return 'progress';
    const pq=Number(m.pq||0), vq=Number(m.vq||0);
    const hasPackage=(pq+vq)>0;
    const packageDone=Number(m.post||0)>=pq && Number(m.video||0)>=vq;
    // Completion is based on the contracted package only. Surplus content prepared for a future month
    // may remain unshared without turning an otherwise completed firm yellow.
    const requiredSharesDone=Number(m.sharedPost||0)>=pq && Number(m.sharedVideo||0)>=vq;
    if(hasPackage && packageDone && requiredSharesDone) return 'done';
    if(hasPackage && packageDone && !requiredSharesDone) return 'waiting';
    return 'progress';
  }

  function apply(){
    const cards=[...document.querySelectorAll('#firmCards .firm-card')];
    const firms=activeFirms();
    cards.forEach((card,i)=>{
      if(card.classList.contains('passive-card')) return;
      const f=firms[i];
      if(!f) return;
      const status=statusForMetrics(firmMetrics(f.id));

      card.classList.remove('firm-done-v115','firm-waiting-v115','firm-progress-v115');
      card.classList.add(status==='done'?'firm-done-v115':status==='waiting'?'firm-waiting-v115':'firm-progress-v115');

      card.querySelectorAll('.firm-status-badge-v115').forEach(x=>x.remove());

      card.classList.remove('status-done','status-waiting','status-progress');
      card.classList.add(`status-${status}`);
      const badge=card.querySelector('.firm-state-badge-v112');
      if(badge){
        badge.className=`firm-state-badge-v112 state-${status}`;
        badge.textContent=status==='done'?'✓ Tamamlandı':status==='waiting'?'◷ Paylaşım Bekliyor':'◷ Devam Ediyor';
      }
    });
  }

  const st=document.createElement('style');
  st.id='firmCompletionColorsStyleV117';
  st.textContent=`
    #firmCards .firm-card{position:relative;transition:border-color .22s ease,box-shadow .22s ease,background .22s ease}
    #firmCards .firm-card.firm-done-v115{border-color:#178b34!important;background:linear-gradient(145deg,#0f1b13,#10161a)!important;box-shadow:inset 0 0 38px rgba(31,180,68,.085),0 0 0 1px rgba(70,225,102,.055)!important}
    #firmCards .firm-card.firm-waiting-v115{border-color:#9b8210!important;background:linear-gradient(145deg,#19180d,#11161a)!important;box-shadow:inset 0 0 34px rgba(223,190,28,.065)!important}
    #firmCards .firm-card.firm-progress-v115{border-color:#38444d!important;background:linear-gradient(145deg,#11171c,#0f1418)!important;box-shadow:none!important}
    #firmCards .firm-card.firm-done-v115 .firm-order{color:#68e17b!important}
    #firmCards .firm-card.firm-waiting-v115 .firm-order{color:#f0d52a!important}
  `;
  document.head.appendChild(st);

  let timer=null;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,50);};
  const root=document.getElementById('firmCards');
  if(root) new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="firms"]')) setTimeout(apply,100);});
  window.addEventListener('load',()=>setTimeout(apply,150));
  setTimeout(apply,150);
})();