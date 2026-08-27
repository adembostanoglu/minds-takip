// V1.19.1 — Mesai ana listesinde personel adına tıklayınca satır altında geniş günlük detay; ayrı Detay çekmecesi korunur.
(function bootAttendanceInlineDetailsV191(){
  if(window.__mindsAttendanceInlineDetailsV191)return;
  window.__mindsAttendanceInlineDetailsV191=true;

  let expandedPid=null;
  let rebuilding=false;

  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');

  function installStyle(){
    if(document.getElementById('attInlineDetailsV191Style'))return;
    const s=document.createElement('style');
    s.id='attInlineDetailsV191Style';
    s.textContent=`
      #attendance.ref-ui-v162 .att-grid-v160{grid-template-columns:1fr!important}
      #attendance.ref-ui-v162 .att-grid-v160>aside{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
      #attendance.ref-ui-v162 .att-grid-v160>aside>.att-inline-source-v191{display:none!important}
      #attendance .att-payroll-person-click-v191{cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:6px}
      #attendance .att-payroll-person-click-v191:after{content:'⌄';font-size:11px;color:#777f83;transition:transform .16s ease,color .16s ease}
      #attendance tr.att-inline-open-v191 .att-payroll-person-click-v191:after{transform:rotate(180deg);color:#e9df2c}
      #attendance tr.att-inline-open-v191>td{background:#141916!important}
      #attendance .att-person-expand-row-v191>td{padding:0!important;border-bottom:1px solid #30393f!important;background:#0c1114!important}
      #attendance .att-person-expand-v191{padding:14px 15px 17px;border-left:2px solid #6e671d;background:linear-gradient(180deg,#10171a,#0d1215)}
      #attendance .att-person-expand-head-v191{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:11px}
      #attendance .att-person-expand-head-v191 b{font-size:13px;color:#edf1f2}
      #attendance .att-person-expand-head-v191 span{font-size:9px;color:#7d898f}
      #attendance .att-person-expand-v191 .att-detail-summary-v160{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:8px!important;margin-bottom:12px!important}
      #attendance .att-person-expand-v191 .att-detail-item-v160{padding:10px!important}
      #attendance .att-person-expand-v191 .att-table-scroll-v160{overflow-x:auto!important;overflow-y:visible!important;max-height:none!important;border:1px solid #273137;border-radius:10px}
      #attendance .att-person-expand-v191 .att-table-v160{width:100%!important;min-width:980px!important;table-layout:auto!important}
      #attendance .att-person-expand-v191 .att-table-v160 th,#attendance .att-person-expand-v191 .att-table-v160 td{white-space:nowrap!important;padding:10px 8px!important}
      #attendance .att-person-expand-v191 .att-adjust-list-v160{margin-top:8px}
      #attendance .att-person-expand-v191 [data-origin-id="attAdjustmentDetailBtnV160"]{display:inline-flex}
      @media(max-width:1100px){#attendance.ref-ui-v162 .att-grid-v160>aside{grid-template-columns:1fr}#attendance .att-person-expand-v191 .att-detail-summary-v160{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    `;
    document.head.appendChild(s);
  }

  function payrollPanel(){
    return [...document.querySelectorAll('#attendance .att-panel-v160')].find(p=>norm(p.querySelector('.att-panel-head-v160 h3')?.textContent).includes('aylık puantaj'))||null;
  }

  function sourceSelect(){
    return [...document.querySelectorAll('#attendance #attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'))||null;
  }

  function sourcePanel(){return sourceSelect()?.closest('.att-panel-v160')||null;}

  function markSource(){
    const p=sourcePanel();
    if(p)p.classList.add('att-inline-source-v191');
  }

  function payrollRows(){
    const tb=payrollPanel()?.querySelector('table.att-table-v160 tbody');
    if(!tb)return [];
    return [...tb.querySelectorAll(':scope > tr')].filter(r=>!r.classList.contains('att-person-expand-row-v191')&&r.querySelector('[data-att-detail]'));
  }

  function rowForPid(pid){return payrollRows().find(r=>r.querySelector(`[data-att-detail="${CSS.escape(pid)}"]`))||null;}

  function patchNames(){
    payrollRows().forEach(row=>{
      const btn=row.querySelector('[data-att-detail]');
      const name=row.cells[0]?.querySelector('b');
      if(!btn||!name)return;
      name.classList.add('att-payroll-person-click-v191');
      name.dataset.attInlinePerson=btn.dataset.attDetail;
      row.classList.toggle('att-inline-open-v191',expandedPid===btn.dataset.attDetail);
    });
  }

  function clearExpansion(){
    document.querySelectorAll('#attendance .att-person-expand-row-v191').forEach(x=>x.remove());
    payrollRows().forEach(r=>r.classList.remove('att-inline-open-v191'));
  }

  function cleanClone(node){
    node.querySelectorAll('[id]').forEach(el=>{el.dataset.originId=el.id;el.removeAttribute('id');});
    node.querySelectorAll('select').forEach(el=>el.removeAttribute('id'));
    return node;
  }

  function buildExpansion(){
    if(rebuilding||!expandedPid)return;
    const row=rowForPid(expandedPid),source=sourcePanel(),sel=sourceSelect();
    if(!row||!source||!sel||sel.value!==expandedPid)return;
    rebuilding=true;
    try{
      clearExpansion();
      row.classList.add('att-inline-open-v191');
      const body=source.querySelector('.att-panel-body-v160');
      if(!body)return;
      const clone=cleanClone(body.cloneNode(true));
      const tr=document.createElement('tr');
      tr.className='att-person-expand-row-v191';
      const td=document.createElement('td');
      td.colSpan=row.cells.length||10;
      const wrap=document.createElement('div');
      wrap.className='att-person-expand-v191';
      const person=row.cells[0]?.querySelector('b')?.textContent?.trim()||'Personel';
      wrap.innerHTML=`<div class="att-person-expand-head-v191"><b>${person}</b><span>Günlük giriş–çıkış, izin ve mesai detayları</span></div>`;
      wrap.appendChild(clone);
      td.appendChild(wrap);tr.appendChild(td);row.insertAdjacentElement('afterend',tr);
    }finally{rebuilding=false;}
  }

  function selectPersonForInline(pid){
    const sel=sourceSelect();
    if(!sel){setTimeout(()=>selectPersonForInline(pid),80);return;}
    if(sel.value===pid){setTimeout(buildExpansion,25);return;}
    sel.value=pid;
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    setTimeout(()=>{markSource();patchNames();buildExpansion();},90);
  }

  function toggle(pid){
    if(expandedPid===pid){expandedPid=null;clearExpansion();patchNames();return;}
    expandedPid=pid;clearExpansion();patchNames();selectPersonForInline(pid);
  }

  function routeCloneButton(btn){
    const src=sourcePanel();if(!src)return false;
    let real=null;
    if(btn.dataset.attEditDay)real=src.querySelector(`[data-att-edit-day="${CSS.escape(btn.dataset.attEditDay)}"]`);
    else if(btn.dataset.attOvertime)real=src.querySelector(`[data-att-overtime="${CSS.escape(btn.dataset.attOvertime)}"]`);
    else if(btn.dataset.attDelAdjust)real=src.querySelector(`[data-att-del-adjust="${CSS.escape(btn.dataset.attDelAdjust)}"]`);
    else if(btn.dataset.attDayDelete)real=src.querySelector(`[data-att-day-delete="${CSS.escape(btn.dataset.attDayDelete)}"]`);
    else if(btn.dataset.originId)real=src.querySelector(`#${CSS.escape(btn.dataset.originId)}`);
    if(!real)return false;
    real.click();return true;
  }

  function apply(){
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    installStyle();markSource();patchNames();
    if(expandedPid&&!document.querySelector('#attendance .att-person-expand-row-v191'))buildExpansion();
  }

  document.addEventListener('click',e=>{
    const name=e.target.closest('#attendance .att-payroll-person-click-v191');
    if(name){e.preventDefault();e.stopPropagation();toggle(name.dataset.attInlinePerson);return;}
    const cloneBtn=e.target.closest('#attendance .att-person-expand-v191 button');
    if(cloneBtn&&routeCloneButton(cloneBtn)){e.preventDefault();}
  },true);

  document.addEventListener('click',e=>{
    if(e.target.closest('#attendance [data-att-detail]'))setTimeout(()=>{markSource();patchNames();},100);
  });

  installStyle();
  setInterval(apply,700);
})();
