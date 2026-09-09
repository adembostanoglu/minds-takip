// V1.24.4 — İş Takibi günlük tamamlama görünümü: farklı bir günde Onaylandı olan iş, ikinci kayıt oluşturmadan tamamlandığı gün de görünür.
(function bootWorkApprovalDayV244(){
  if(window.__mindsWorkApprovalDayV244)return;
  if(typeof state==='undefined'||typeof selectedMonth==='undefined'){
    setTimeout(bootWorkApprovalDayV244,120);return;
  }
  window.__mindsWorkApprovalDayV244=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const localDate=ts=>{
    if(!ts)return'';
    try{
      const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(ts));
      const get=t=>parts.find(p=>p.type===t)?.value||'';
      const y=get('year'),m=get('month'),d=get('day');
      return y&&m&&d?`${y}-${m}-${d}`:'';
    }catch(_e){return String(ts).slice(0,10);}
  };
  const formatDay=d=>typeof formatDate==='function'?formatDate(d):d;
  const monthOf=d=>String(d||'').slice(0,7)+'-01';
  const isVisibleWork=w=>{
    if(!w||w.status!=='onaylandi'||!w.approved_at||!w.assigned_to)return false;
    const fm=(state.months||[]).find(m=>m.id===w.firm_month_id);
    if(!fm||fm.month!==selectedMonth)return false;
    if(typeof isAdmin==='function'&&isAdmin())return true;
    return typeof staffOwnWork==='function'&&staffOwnWork(w);
  };

  function installStyle(){
    if(document.getElementById('workApprovalDayV244Style'))return;
    const s=document.createElement('style');s.id='workApprovalDayV244Style';s.textContent=`
      .works-completion-clone-v244{border-color:#2f6e3e!important;background:linear-gradient(145deg,#111d15,#12191d)!important;box-shadow:inset 3px 0 0 #55b96a!important}
      .works-completion-clone-v244:hover{border-color:#438a53!important;background:linear-gradient(145deg,#14221a,#151d21)!important}
      .works-completion-tag-v244{display:inline-flex!important;align-items:center!important;gap:4px!important;border:1px solid #347846!important;border-radius:7px!important;background:#15321d!important;color:#86df96!important;font-size:8.5px!important;font-weight:850!important;padding:4px 6px!important;line-height:1.1!important;white-space:nowrap!important}
      .works-completion-clone-v244 .works-actions-v228{display:none!important}
      .works-completion-block-v244 .works-date-head-v228{color:#72cf83!important}
      @media(max-width:760px){.works-completion-tag-v244{font-size:8px!important;padding:3px 5px!important}}
    `;document.head.appendChild(s);
  }

  function cleanup(personCard){
    personCard.querySelectorAll('.works-completion-clone-v244').forEach(x=>x.remove());
    personCard.querySelectorAll('.works-completion-block-v244').forEach(block=>{if(!block.querySelector('.works-job-v228'))block.remove();});
  }

  function annotateOriginalBlocks(personCard){
    personCard.querySelectorAll('.works-job-v228[data-work-id]:not(.works-completion-clone-v244)').forEach(card=>{
      const w=(state.works||[]).find(x=>x.id===card.dataset.workId);
      const block=card.closest('.works-date-block-v228');
      if(w?.work_date&&block)block.dataset.workDateV244=w.work_date;
    });
  }

  function ensureDayBlock(body,date){
    let block=[...body.querySelectorAll(':scope > .works-date-block-v228')].find(x=>x.dataset.workDateV244===date);
    if(block)return block;
    block=document.createElement('div');
    block.className='works-date-block-v228 works-completion-block-v244';
    block.dataset.workDateV244=date;
    block.innerHTML=`<div class="works-date-head-v228">${esc(formatDay(date))} <span class="works-date-count-v228">• 0 iş</span></div>`;
    body.appendChild(block);
    return block;
  }

  function refreshCountsAndOrder(body){
    const blocks=[...body.querySelectorAll(':scope > .works-date-block-v228')];
    blocks.forEach(block=>{
      const count=block.querySelectorAll(':scope > .works-job-v228').length;
      const span=block.querySelector('.works-date-count-v228');if(span)span.textContent=`• ${count} iş`;
    });
    blocks.sort((a,b)=>String(b.dataset.workDateV244||'').localeCompare(String(a.dataset.workDateV244||''))).forEach(block=>body.appendChild(block));
  }

  function enhance(force=false){
    const section=document.getElementById('works');
    if(!section?.classList.contains('active-view'))return;
    const host=document.getElementById('worksPersonGridV228');if(!host)return;
    installStyle();

    host.querySelectorAll('.works-person-card-v228[data-person-id]').forEach(personCard=>{
      cleanup(personCard);annotateOriginalBlocks(personCard);
      const body=personCard.querySelector('.works-person-body-v228');if(!body)return;
      const pid=personCard.dataset.personId;
      const works=(state.works||[]).filter(w=>w.assigned_to===pid&&isVisibleWork(w));
      for(const w of works){
        const approvedDate=localDate(w.approved_at);
        if(!approvedDate||approvedDate===String(w.work_date||'').slice(0,10))continue;
        if(monthOf(approvedDate)!==selectedMonth)continue;
        const selector=`.works-job-v228[data-work-id="${CSS.escape(String(w.id))}"]:not(.works-completion-clone-v244)`;
        const source=personCard.querySelector(selector);if(!source)continue;
        const block=ensureDayBlock(body,approvedDate);
        const clone=source.cloneNode(true);
        clone.classList.add('works-completion-clone-v244');
        clone.dataset.completionDayV244=approvedDate;
        clone.setAttribute('title','Bu iş farklı bir günde başladı ve bu tarihte Onaylandı olarak tamamlandı. Paket ve performans hesaplarında ikinci kez sayılmaz.');
        const status=clone.querySelector('.works-status-v228');
        if(status&&!status.querySelector('.works-completion-tag-v244'))status.insertAdjacentHTML('afterbegin','<span class="works-completion-tag-v244">✓ O gün tamamlandı</span>');
        const actions=clone.querySelector('.works-actions-v228');if(actions)actions.innerHTML='';
        block.appendChild(clone);
      }
      refreshCountsAndOrder(body);
    });
  }

  if(typeof renderAll==='function'&&!renderAll.__mindsWorkApprovalDayV244){
    const previous=renderAll;
    const wrapped=function(){const out=previous.apply(this,arguments);setTimeout(()=>enhance(true),30);return out;};
    wrapped.__mindsWorkApprovalDayV244=true;
    try{renderAll=wrapped;}catch(_e){}
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="works"]')){setTimeout(()=>enhance(true),120);setTimeout(()=>enhance(true),320);}
  },true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>setTimeout(()=>enhance(true),240));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>enhance(true),120);});
  [180,500,1100].forEach(ms=>setTimeout(()=>enhance(true),ms));
})();
