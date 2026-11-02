// V1.25.6 — Firma kartlarında paket hedefi + hazır + paylaşılan metriklerini birlikte gösterir.
(function bootFirmReadyMetricsV256(){
  if(window.__mindsFirmReadyMetricsV256)return;
  if(typeof state==='undefined'||typeof firmMetrics!=='function'){
    setTimeout(bootFirmReadyMetricsV256,150);return;
  }
  window.__mindsFirmReadyMetricsV256=true;

  let observer=null,timer=null,patching=false;

  function installStyle(){
    if(document.getElementById('firmReadyMetricsV256Style'))return;
    const s=document.createElement('style');
    s.id='firmReadyMetricsV256Style';
    s.textContent=`
      #firms .metric-five-v278{
        grid-template-columns:repeat(7,minmax(0,1fr))!important;
        overflow:visible!important;
      }
      #firms .metric-five-v278 .mini{
        padding:11px 7px!important;
      }
      #firms .metric-five-v278 .mini small{
        font-size:8.5px!important;
        line-height:1.2!important;
        min-height:22px!important;
        display:flex!important;
        align-items:flex-end!important;
      }
      #firms .metric-five-v278 .mini b{
        font-size:17px!important;
        margin-top:5px!important;
      }
      #firms .metric-five-v278 .ready-post-v256{
        background:linear-gradient(145deg,#E4E251,#b9b83f)!important;
        box-shadow:inset 0 0 0 1px #f0ef78,0 0 14px rgba(228,226,81,.12)!important;
      }
      #firms .metric-five-v278 .ready-post-v256 small{color:#24251f!important}
      #firms .metric-five-v278 .ready-post-v256 b{color:#11120f!important}
      #firms .metric-five-v278 .ready-video-v256{
        background:linear-gradient(145deg,#E4E251,#b9b83f)!important;
        box-shadow:inset 0 0 0 1px #f0ef78,0 0 14px rgba(228,226,81,.12)!important;
      }
      #firms .metric-five-v278 .ready-video-v256 small{color:#24251f!important}
      #firms .metric-five-v278 .ready-video-v256 b{color:#11120f!important}
      #firms .metric-five-v278 .share-metric b{color:#91d47a!important}
      #firms .metric-five-v278 .remain-metric b{color:#e7df3f!important}
      @media(max-width:1280px){
        #firms .metric-five-v278{grid-template-columns:repeat(4,minmax(0,1fr))!important}
        #firms .metric-five-v278 .mini{border-bottom:1px solid #293238}
      }
      @media(max-width:760px){
        #firms .metric-five-v278{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #firms .metric-five-v278 .mini small{font-size:9px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function num(v){const n=Number(v||0);return Number.isFinite(n)?n:0;}

  function firmFromCard(card){
    const name=String(card.querySelector('.firm-card-head h3')?.textContent||'').trim();
    if(!name)return null;
    return (state.firms||[]).find(f=>String(f.name||'').trim()===name)||null;
  }

  function patchCard(card){
    const f=firmFromCard(card),grid=card.querySelector('.metric-five-v278');
    if(!f||!grid)return;
    const m=firmMetrics(f.id)||{};
    const targetPost=num(m.pq),targetVideo=num(m.vq);
    const readyPost=num(m.post),readyVideo=num(m.video);
    const sharedPost=num(m.sharedPost),sharedVideo=num(m.sharedVideo);
    const remaining=Math.max(0,targetPost-sharedPost)+Math.max(0,targetVideo-sharedVideo);
    const signature=[targetPost,targetVideo,readyPost,readyVideo,sharedPost,sharedVideo,remaining].join('|');
    if(grid.dataset.readyMetricsV256===signature)return;
    grid.dataset.readyMetricsV256=signature;
    grid.innerHTML=`
      <div class="mini"><small>Yapılacak Post</small><b>${targetPost}</b></div>
      <div class="mini"><small>Yapılacak Video</small><b>${targetVideo}</b></div>
      <div class="mini ${readyPost>0?'ready-post-v256':''}"><small>Hazır Post</small><b>${readyPost}</b></div>
      <div class="mini ${readyVideo>0?'ready-video-v256':''}"><small>Hazır Video</small><b>${readyVideo}</b></div>
      <div class="mini share-metric"><small>Paylaşılan Post</small><b>${sharedPost}</b></div>
      <div class="mini share-metric"><small>Paylaşılan Video</small><b>${sharedVideo}</b></div>
      <div class="mini remain-metric"><small>Kalan</small><b>${remaining}</b></div>
    `;
  }

  function patch(){
    if(patching)return;patching=true;
    try{
      installStyle();
      document.querySelectorAll('#firmCards .firm-card,#passiveFirmCards .firm-card').forEach(patchCard);
    }finally{patching=false;}
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(patch,40);
  }

  function attach(){
    const hosts=[document.getElementById('firmCards'),document.getElementById('passiveFirmCards')].filter(Boolean);
    if(!hosts.length){setTimeout(attach,200);return;}
    observer?.disconnect();
    observer=new MutationObserver(schedule);
    hosts.forEach(h=>observer.observe(h,{childList:true,subtree:true,characterData:true}));
    schedule();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="firms"],[data-edit-work],[data-edit-firm]'))setTimeout(schedule,100);
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.id==='monthPicker')setTimeout(schedule,180);
  },true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  window.addEventListener('pageshow',schedule);

  installStyle();
  attach();
})();