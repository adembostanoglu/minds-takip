// V1.19.5 — Mesai personel odak görünümü: seçilen kişi tek başına kalır, tüm detay doğrudan altında açılır; ayrı Detay çekmecesi korunur.
(function bootAttendanceInlineDetailsV195(){
  if(window.__mindsAttendanceInlineDetailsV195)return;
  window.__mindsAttendanceInlineDetailsV195=true;

  let expandedPid=null;
  let requestToken=0;
  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');

  function installStyle(){
    if(document.getElementById('attInlineDetailsV195Style'))return;
    const s=document.createElement('style');
    s.id='attInlineDetailsV195Style';
    s.textContent=`
      #attendance.ref-ui-v162 .att-grid-v160{grid-template-columns:1fr!important}
      #attendance.ref-ui-v162 .att-grid-v160>aside{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
      #attendance.ref-ui-v162 .att-grid-v160>aside>.att-inline-source-v195{display:none!important}
      #attendance .att-payroll-person-cell-v195{cursor:pointer!important;user-select:none}
      #attendance .att-payroll-person-cell-v195:hover{background:#171d19!important}
      #attendance .att-payroll-person-click-v195{display:inline-flex;align-items:center;gap:7px;cursor:pointer}
      #attendance .att-payroll-person-click-v195:after{content:'⌄';font-size:12px;color:#818b90;transition:transform .16s ease,color .16s ease}
      #attendance tr.att-focus-selected-v195 .att-payroll-person-click-v195:after{transform:rotate(180deg);color:#eee52b}
      #attendance tr.att-focus-selected-v195>td{background:#151b17!important;border-bottom-color:#5a5520!important}
      #attendance tr.att-focus-hidden-v195{display:none!important}
      #attendance .att-person-focus-v195{border-top:1px solid #343d42;border-left:3px solid #e4dc2f;background:linear-gradient(180deg,#10171a,#0c1215);padding:16px 18px 18px}
      #attendance .att-person-focus-head-v195{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #283238}
      #attendance .att-person-focus-title-v195{display:flex;flex-direction:column;gap:4px}
      #attendance .att-person-focus-title-v195 b{font-size:16px;color:#f2f4f5;letter-spacing:-.2px}
      #attendance .att-person-focus-title-v195 span{font-size:11px;color:#8c989e}
      #attendance .att-person-focus-back-v195{min-height:34px;padding:7px 11px;border:1px solid #3a454b;border-radius:8px;background:#151c20;color:#e6ebed;font-size:10px;font-weight:800;cursor:pointer}
      #attendance .att-person-focus-v195 .att-detail-summary-v160{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:9px!important;margin-bottom:13px!important}
      #attendance .att-person-focus-v195 .att-detail-item-v160{padding:11px!important}
      #attendance .att-person-focus-v195 .att-detail-item-v160 small{font-size:10px!important}
      #attendance .att-person-focus-v195 .att-detail-item-v160 b{font-size:14px!important}
      #attendance .att-person-focus-v195 .att-table-scroll-v160{overflow-x:auto!important;overflow-y:visible!important;max-height:none!important;border:1px solid #2a343a;border-radius:10px}
      #attendance .att-person-focus-v195 .att-table-v160{width:100%!important;min-width:1040px!important;table-layout:auto!important}
      #attendance .att-person-focus-v195 .att-table-v160 th{font-size:10px!important;padding:10px 9px!important;white-space:nowrap!important}
      #attendance .att-person-focus-v195 .att-table-v160 td{font-size:11px!important;padding:11px 9px!important;white-space:nowrap!important;vertical-align:middle!important}
      #attendance .att-person-focus-v195 .att-badge-v160{font-size:9px!important;padding:5px 7px!important}
      #attendance .att-person-focus-v195 .att-adjust-list-v160{margin-top:10px}
      #attendance .att-person-focus-v195 button{font-size:9.5px}
      @media(max-width:1100px){#attendance.ref-ui-v162 .att-grid-v160>aside{grid-template-columns:1fr}#attendance .att-person-focus-v195 .att-detail-summary-v160{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    `;
    document.head.appendChild(s);
  }

  function payrollPanel(){
    return [...document.querySelectorAll('#attendance .att-panel-v160')].find(p=>norm(p.querySelector('.att-panel-head-v160 h3')?.textContent).includes('aylık puantaj'))||null;
  }
  function payrollTable(){return payrollPanel()?.querySelector('table.att-table-v160')||null;}
  function sourceSelect(){return [...document.querySelectorAll('#attendance #attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'))||null;}
  function sourcePanel(){return sourceSelect()?.closest('.att-panel-v160')||null;}
  function markSource(){const p=sourcePanel();if(p)p.classList.add('att-inline-source-v195');}

  function payrollRows(){
    const tb=payrollTable()?.querySelector('tbody');
    if(!tb)return [];
    return [...tb.querySelectorAll(':scope > tr')].filter(r=>r.querySelector('[data-att-detail]'));
  }
  function rowForPid(pid){return payrollRows().find(r=>r.querySelector(`[data-att-detail="${CSS.escape(pid)}"]`))||null;}

  function removeOldArtifacts(){
    document.querySelectorAll('#attendance .att-person-expand-row-v191,#attendance #attPersonFocusV195').forEach(x=>x.remove());
  }

  function patchRows(){
    payrollRows().forEach(row=>{
      const btn=row.querySelector('[data-att-detail]'),cell=row.cells[0],name=cell?.querySelector('b');
      if(!btn||!cell||!name)return;
      const pid=btn.dataset.attDetail;
      cell.classList.add('att-payroll-person-cell-v195');
      cell.dataset.attInlinePerson=pid;
      name.classList.add('att-payroll-person-click-v195');
      row.classList.toggle('att-focus-selected-v195',expandedPid===pid);
      row.classList.toggle('att-focus-hidden-v195',!!expandedPid&&expandedPid!==pid);
    });
  }

  function cleanClone(node){
    node.querySelectorAll('[id]').forEach(el=>{el.dataset.originId=el.id;el.removeAttribute('id');});
    node.querySelectorAll('select').forEach(el=>el.removeAttribute('id'));
    return node;
  }

  function focusAnchor(){const table=payrollTable();return table?.closest('.att-table-scroll-v160')||table;}

  function buildFocus(pid,token){
    if(token!==requestToken||expandedPid!==pid)return;
    const row=rowForPid(pid),source=sourcePanel(),sel=sourceSelect(),anchor=focusAnchor();
    if(!row||!source||!sel||sel.value!==pid||!anchor)return;
    document.getElementById('attPersonFocusV195')?.remove();
    const body=source.querySelector('.att-panel-body-v160');if(!body)return;
    const clone=cleanClone(body.cloneNode(true));
    const name=row.cells[0]?.querySelector('b')?.textContent?.trim()||'Personel';
    const focus=document.createElement('div');
    focus.id='attPersonFocusV195';focus.className='att-person-focus-v195';
    focus.innerHTML=`<div class="att-person-focus-head-v195"><div class="att-person-focus-title-v195"><b>${name}</b><span>Günlük giriş–çıkış, izin, mesai ve ödeme detayları</span></div><button type="button" class="att-person-focus-back-v195" data-att-focus-close="1">← Tüm Personeli Göster</button></div>`;
    focus.appendChild(clone);
    anchor.insertAdjacentElement('afterend',focus);
    patchRows();
  }

  function openPerson(pid){
    expandedPid=pid;requestToken++;
    const token=requestToken;
    removeOldArtifacts();patchRows();
    const sel=sourceSelect();
    if(!sel){setTimeout(()=>openPerson(pid),90);return;}
    if(sel.value!==pid){sel.value=pid;sel.dispatchEvent(new Event('change',{bubbles:true}));}
    setTimeout(()=>{markSource();buildFocus(pid,token);},140);
    setTimeout(()=>{if(!document.getElementById('attPersonFocusV195'))buildFocus(pid,token);},340);
  }

  function closeFocus(){
    expandedPid=null;requestToken++;
    removeOldArtifacts();
    payrollRows().forEach(r=>r.classList.remove('att-focus-hidden-v195','att-focus-selected-v195'));
    patchRows();
  }

  function routeCloneButton(btn){
    const src=sourcePanel();if(!src)return false;
    let real=null;
    if(btn.dataset.attEditDay)real=src.querySelector(`[data-att-edit-day="${CSS.escape(btn.dataset.attEditDay)}"]`);
    else if(btn.dataset.attOvertime)real=src.querySelector(`[data-att-overtime="${CSS.escape(btn.dataset.attOvertime)}"]`);
    else if(btn.dataset.attDelAdjust)real=src.querySelector(`[data-att-del-adjust="${CSS.escape(btn.dataset.attDelAdjust)}"]`);
    else if(btn.dataset.attDayDelete)real=src.querySelector(`[data-att-day-delete="${CSS.escape(btn.dataset.attDayDelete)}"]`);
    else if(btn.dataset.attOtNote)real=src.querySelector(`[data-att-ot-note="${CSS.escape(btn.dataset.attOtNote)}"]`);
    else if(btn.dataset.originId)real=src.querySelector(`#${CSS.escape(btn.dataset.originId)}`);
    if(!real)return false;real.click();return true;
  }

  document.addEventListener('click',e=>{
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    const close=e.target.closest('#attendance [data-att-focus-close]');
    if(close){e.preventDefault();e.stopPropagation();closeFocus();return;}
    const cloneBtn=e.target.closest('#attendance .att-person-focus-v195 button');
    if(cloneBtn&&routeCloneButton(cloneBtn)){e.preventDefault();e.stopPropagation();return;}
    if(e.target.closest('#attendance [data-att-detail]'))return;
    const cell=e.target.closest('#attendance .att-payroll-person-cell-v195');
    if(cell){e.preventDefault();e.stopPropagation();const pid=cell.dataset.attInlinePerson;if(expandedPid===pid)closeFocus();else openPerson(pid);}
  },true);

  document.addEventListener('click',e=>{if(e.target.closest('#attendance [data-att-detail]'))setTimeout(()=>{markSource();patchRows();},120);});
  document.getElementById('monthPicker')?.addEventListener('change',closeFocus);

  installStyle();
  setInterval(()=>{
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    markSource();patchRows();
    if(expandedPid&&!document.getElementById('attPersonFocusV195'))buildFocus(expandedPid,requestToken);
  },900);
})();
