// V1.23.2 — Ekstra İşler kişi kolonlarında en yeni tarih üstte olacak şekilde sıralama bütünlüğü.
(function bootExtraChronologicalOrderV232(){
  if(window.__mindsExtraChronologicalOrderV232)return;
  window.__mindsExtraChronologicalOrderV232=true;

  function dateKey(text){
    const t=String(text||'').trim();
    let m=t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if(m)return Number(`${m[3]}${m[2]}${m[1]}`);
    m=t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(m)return Number(`${m[1]}${m[2]}${m[3]}`);
    return 0;
  }

  function apply(){
    const grid=document.getElementById('extraPersonGridV179');
    if(!grid)return;
    grid.querySelectorAll('.extra-person-body-v179').forEach(body=>{
      const items=[...body.children].filter(x=>x.classList?.contains('extra-item-v179'));
      if(items.length<2)return;
      const ranked=items.map((node,index)=>({
        node,index,
        key:dateKey(node.querySelector('.extra-due-v215 strong')?.textContent)
      })).sort((a,b)=>b.key-a.key||a.index-b.index);
      ranked.forEach(x=>body.appendChild(x.node));
    });
  }

  function schedule(){[0,70,180,420].forEach(ms=>setTimeout(apply,ms));}

  const previous=typeof window.renderExtras==='function'?window.renderExtras:null;
  if(previous){
    const wrapped=function(...args){const result=previous.apply(this,args);schedule();return result;};
    try{window.renderExtras=wrapped;renderExtras=wrapped;}catch(_e){window.renderExtras=wrapped;}
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="extras"],#addExtraBtn,[data-edit-extra],[data-extra-start-v215],[data-extra-submit-v215],[data-extra-approve-v215],[data-extra-reopen-v215],[data-delete-extra]'))schedule();
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')schedule();});
  window.addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  schedule();
})();