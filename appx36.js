// V1.17.4 — Mesai personel detay çekmecesi. Yeni sorgu atmaz; appx32'nin zaten yüklediği veriyi kullanır.
(function bootAttendanceDetailDrawerV174(){
  if(window.__mindsAttendanceDetailDrawerV174)return;
  window.__mindsAttendanceDetailDrawerV174=true;

  function installStyles(){
    if(document.getElementById('attDetailDrawerV174Style'))return;
    const s=document.createElement('style');
    s.id='attDetailDrawerV174Style';
    s.textContent=`
      .att-drawer-backdrop-v166{position:fixed;inset:0;background:rgba(0,0,0,.46);backdrop-filter:blur(2px);z-index:9990;opacity:0;pointer-events:none;transition:opacity .18s ease}
      .att-drawer-backdrop-v166.open{opacity:1;pointer-events:auto}
      .att-drawer-v166{position:fixed;top:0;right:0;height:100vh;width:min(720px,96vw);background:#0e1418;border-left:1px solid #30393f;z-index:9991;box-shadow:-24px 0 60px rgba(0,0,0,.45);transform:translateX(102%);transition:transform .22s ease;display:flex;flex-direction:column;color:#e8edef;overflow:hidden}
      .att-drawer-v166.open{transform:translateX(0)}
      .att-drawer-head-v166{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid #273137;background:linear-gradient(180deg,#151c20,#10161a);flex:0 0 auto}
      .att-drawer-head-v166 h3{margin:0;font-size:20px;letter-spacing:-.3px}.att-drawer-head-v166 p{margin:5px 0 0;color:#839098;font-size:11px}.att-drawer-close-v166{width:36px;height:36px;border:1px solid #354047;border-radius:10px;background:#151c20;color:#d9e0e3;font-size:20px;cursor:pointer}
      .att-drawer-body-v166{padding:16px 18px 20px;overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}
      .att-drawer-loading-v166{padding:40px 20px;text-align:center;color:#8b979d;font-size:12px}
      .att-drawer-body-v166>.att-panel-v160{margin:0!important;border:0!important;background:transparent!important;overflow:visible!important}
      .att-drawer-body-v166>.att-panel-v160>.att-panel-head-v160{padding:0 0 14px!important;border-bottom:1px solid #263037!important;margin-bottom:14px!important}
      .att-drawer-body-v166>.att-panel-v160>.att-panel-body-v160{padding:0!important}
      .att-drawer-body-v166 .att-detail-summary-v160{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
      .att-drawer-body-v166 .att-table-scroll-v160{overflow-x:hidden!important;overflow-y:auto!important;max-height:none!important;border:1px solid #263037;border-radius:11px}
      .att-drawer-body-v166 .att-table-v160{width:100%!important;min-width:0!important;table-layout:fixed!important}
      .att-drawer-body-v166 .att-table-v160 th,.att-drawer-body-v166 .att-table-v160 td{padding:9px 5px!important;font-size:9px!important;line-height:1.25!important;white-space:normal!important;overflow-wrap:anywhere!important;vertical-align:middle!important}
      .att-drawer-body-v166 .att-table-v160 th{font-size:8px!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(1),.att-drawer-body-v166 .att-table-v160 td:nth-child(1){width:14%!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(2),.att-drawer-body-v166 .att-table-v160 td:nth-child(2){width:18%!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(3),.att-drawer-body-v166 .att-table-v160 td:nth-child(3){width:10%!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(4),.att-drawer-body-v166 .att-table-v160 td:nth-child(4){width:10%!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(5),.att-drawer-body-v166 .att-table-v160 td:nth-child(5){width:10%!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(6),.att-drawer-body-v166 .att-table-v160 td:nth-child(6){width:18%!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(7),.att-drawer-body-v166 .att-table-v160 td:nth-child(7){width:20%!important}
      .att-drawer-body-v166 .att-table-v160 th:nth-child(8),.att-drawer-body-v166 .att-table-v160 td:nth-child(8){display:none!important}
      .att-drawer-body-v166 .att-person-select-v160{display:flex!important;gap:7px!important;align-items:center!important}.att-drawer-body-v166 .att-person-select-v160 select{min-width:180px!important}
      @media(max-width:760px){.att-drawer-v166{width:100vw}.att-drawer-body-v166{padding:14px}.att-drawer-body-v166 .att-detail-summary-v160{grid-template-columns:repeat(2,minmax(0,1fr))!important}.att-drawer-body-v166 .att-table-v160 th,.att-drawer-body-v166 .att-table-v160 td{padding:7px 3px!important;font-size:8px!important}}
    `;
    document.head.appendChild(s);
  }

  function ensureDrawer(){
    installStyles();
    let back=document.getElementById('attDetailBackdropV166');
    let drawer=document.getElementById('attDetailDrawerV166');
    if(!back){back=document.createElement('div');back.id='attDetailBackdropV166';back.className='att-drawer-backdrop-v166';document.body.appendChild(back);back.addEventListener('click',closeDrawer);}
    if(!drawer){drawer=document.createElement('aside');drawer.id='attDetailDrawerV166';drawer.className='att-drawer-v166';document.body.appendChild(drawer);}
    return {back,drawer};
  }

  function closeDrawer(){
    const {back,drawer}=ensureDrawer();
    drawer.classList.remove('open');back.classList.remove('open');
  }

  function showDrawer(){
    const {back,drawer}=ensureDrawer();
    requestAnimationFrame(()=>{back.classList.add('open');drawer.classList.add('open');});
  }

  function prepareClone(panel){
    const clone=panel.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(node=>{node.dataset.originalId=node.id;node.removeAttribute('id');});
    return clone;
  }

  function findReal(selector){
    return [...document.querySelectorAll(selector)].find(n=>!n.closest('#attDetailDrawerV166'))||null;
  }

  function refreshFromRendered(){
    const {drawer}=ensureDrawer();
    const originalSelect=findReal('#attPersonSelectV160');
    const panel=originalSelect?.closest('.att-panel-v160');
    if(!panel){
      drawer.innerHTML='<div class="att-drawer-head-v166"><div><h3>Personel Detayı</h3><p>Detay hazırlanamadı</p></div><button class="att-drawer-close-v166" data-drawer-close="1">×</button></div><div class="att-drawer-loading-v166">Mesai detay paneli bulunamadı. Mesai sayfasını yenileyip tekrar deneyin.</div>';
      showDrawer();return;
    }
    const title=panel.querySelector('h3')?.textContent||'Personel Detayı';
    drawer.innerHTML=`<div class="att-drawer-head-v166"><div><h3>${title}</h3><p>Günlük giriş–çıkış ve ödeme hareketleri</p></div><button class="att-drawer-close-v166" data-drawer-close="1" aria-label="Kapat">×</button></div><div class="att-drawer-body-v166"></div>`;
    const clone=prepareClone(panel);
    clone.querySelector('.att-panel-head-v160 h3')?.remove();
    clone.querySelector('.att-panel-head-v160 p')?.remove();
    drawer.querySelector('.att-drawer-body-v166')?.appendChild(clone);
    showDrawer();
  }

  function openAfterNativeRender(scrollY){
    setTimeout(()=>{
      try{window.scrollTo({top:scrollY,behavior:'auto'});}catch(_e){window.scrollTo(0,scrollY);}
      refreshFromRendered();
    },40);
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-att-detail]');
    if(!btn||!document.getElementById('attendance')?.classList.contains('active-view'))return;
    const y=window.scrollY;
    openAfterNativeRender(y);
  },true);

  document.addEventListener('click',e=>{
    const drawer=e.target.closest('#attDetailDrawerV166');
    if(!drawer)return;
    if(e.target.closest('[data-drawer-close]')){e.preventDefault();closeDrawer();return;}
    const btn=e.target.closest('button');
    if(!btn)return;
    const oid=btn.dataset.originalId;
    let selector='';
    if(oid)selector=`#${CSS.escape(oid)}`;
    else if(btn.dataset.attOvertime)selector=`[data-att-overtime="${CSS.escape(btn.dataset.attOvertime)}"]`;
    else if(btn.dataset.attEditDay)selector=`[data-att-edit-day="${CSS.escape(btn.dataset.attEditDay)}"]`;
    else if(btn.dataset.attDelAdjust)selector=`[data-att-del-adjust="${CSS.escape(btn.dataset.attDelAdjust)}"]`;
    if(!selector)return;
    const real=findReal(selector);if(!real)return;
    e.preventDefault();closeDrawer();setTimeout(()=>real.click(),20);
  },true);

  document.addEventListener('change',e=>{
    const cloneSelect=e.target.closest('#attDetailDrawerV166 [data-original-id="attPersonSelectV160"]');
    if(!cloneSelect)return;
    const real=findReal('#attPersonSelectV160');if(!real)return;
    real.value=cloneSelect.value;
    real.dispatchEvent(new Event('change',{bubbles:true}));
    setTimeout(refreshFromRendered,30);
  },true);

  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('attDetailDrawerV166')?.classList.contains('open'))closeDrawer();});
  installStyles();
})();
