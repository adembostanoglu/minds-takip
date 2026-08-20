// V1.11.5 — robust firm completion colors from rendered card metrics
(function bootFirmCompletionColorsV115(){
  if(window.__mindsFirmCompletionColorsV115) return;
  window.__mindsFirmCompletionColorsV115=true;

  function parseFraction(text){
    const m=String(text||'').match(/(\d+)\s*\/\s*(\d+)/);
    return m ? {done:Number(m[1]), total:Number(m[2])} : {done:0,total:0};
  }

  function parseShared(text){
    const s=String(text||'');
    const p=s.match(/(\d+)\s*P/i);
    const v=s.match(/(\d+)\s*V/i);
    return {post:p?Number(p[1]):0, video:v?Number(v[1]):0};
  }

  function metricMap(card){
    const out={};
    card.querySelectorAll('.mini').forEach(mini=>{
      const label=(mini.querySelector('small')?.textContent||'').trim().toLocaleLowerCase('tr-TR');
      const value=(mini.querySelector('b')?.textContent||'').trim();
      if(label) out[label]=value;
    });
    return out;
  }

  function ensureBadge(card,status){
    let badge=card.querySelector('.firm-status-badge-v115');
    if(!badge){
      badge=document.createElement('span');
      badge.className='firm-status-badge-v115';
      const actions=card.querySelector('.card-actions');
      const top=card.querySelector('.firm-card-top');
      if(actions) actions.insertAdjacentElement('beforebegin',badge);
      else if(top) top.appendChild(badge);
      else card.prepend(badge);
    }
    badge.className='firm-status-badge-v115 '+status.cls;
    badge.textContent=status.text;
  }

  function evaluateCard(card){
    if(card.classList.contains('passive-card')) return;
    const m=metricMap(card);
    const post=parseFraction(m['post']);
    const video=parseFraction(m['video']);
    const shared=parseShared(m['paylaşılan']);
    const waitingRaw=m['paylaşım bekleyen'] ?? m['bekleyen'] ?? '0';
    const waiting=Number(String(waitingRaw).match(/\d+/)?.[0]||0);

    const packageDone = post.done>=post.total && video.done>=video.total;
    const sharesDone = shared.post>=post.total && shared.video>=video.total && waiting===0;

    card.classList.remove('firm-done-v115','firm-waiting-v115','firm-progress-v115');

    if(packageDone && sharesDone){
      card.classList.add('firm-done-v115');
      ensureBadge(card,{cls:'done',text:'✓ Tamamlandı'});
    }else if(packageDone && waiting>0){
      card.classList.add('firm-waiting-v115');
      ensureBadge(card,{cls:'waiting',text:'◷ Paylaşım Bekliyor'});
    }else{
      card.classList.add('firm-progress-v115');
      ensureBadge(card,{cls:'progress',text:'◷ Devam Ediyor'});
    }
  }

  function apply(){
    document.querySelectorAll('#firmCards .firm-card').forEach(evaluateCard);
  }

  const st=document.createElement('style');
  st.id='firmCompletionColorsStyleV115';
  st.textContent=`
    #firmCards .firm-card{position:relative;transition:border-color .22s ease,box-shadow .22s ease,background .22s ease}
    #firmCards .firm-card.firm-done-v115{border-color:#178b34!important;background:linear-gradient(145deg,#0f1b13,#10161a)!important;box-shadow:inset 0 0 38px rgba(31,180,68,.085),0 0 0 1px rgba(70,225,102,.055)!important}
    #firmCards .firm-card.firm-waiting-v115{border-color:#9b8210!important;background:linear-gradient(145deg,#19180d,#11161a)!important;box-shadow:inset 0 0 34px rgba(223,190,28,.065)!important}
    #firmCards .firm-card.firm-progress-v115{border-color:#38444d!important}
    .firm-status-badge-v115{display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:5px 8px;font-size:9px;font-weight:800;white-space:nowrap;margin-right:8px}
    .firm-status-badge-v115.done{color:#67e77b;background:#0d2e15;border:1px solid #1e6d2d;box-shadow:0 0 16px rgba(67,210,91,.08)}
    .firm-status-badge-v115.waiting{color:#f2d629;background:#302908;border:1px solid #6e5f0d}
    .firm-status-badge-v115.progress{color:#b9c4cb;background:#151e24;border:1px solid #33414a}
    #firmCards .firm-card.firm-done-v115 .firm-order{color:#68e17b!important}
    #firmCards .firm-card.firm-waiting-v115 .firm-order{color:#f0d52a!important}
  `;
  document.head.appendChild(st);

  let timer=null;
  const schedule=()=>{ clearTimeout(timer); timer=setTimeout(apply,40); };
  const root=document.getElementById('firmCards');
  if(root){
    new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="firms"]')) setTimeout(apply,80);
  });
  window.addEventListener('load',()=>setTimeout(apply,120));
  setTimeout(apply,120);
})();