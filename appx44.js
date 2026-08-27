// V1.18.0 — Cumartesi mesaisi: 13:30 sonrası fazla mesai olarak gösterilir.
(function bootSaturdayOvertimeV180(){
  if(window.__mindsSaturdayOvertimeV180)return;
  window.__mindsSaturdayOvertimeV180=true;

  const parseTime=v=>{const m=String(v||'').match(/^(\d{1,2}):(\d{2})$/);return m?Number(m[1])*60+Number(m[2]):null;};
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const isSaturday=v=>{const m=String(v||'').match(/^(\d{2})\.(\d{2})\.(\d{4})$/);if(!m)return false;return new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00Z`).getUTCDay()===6;};

  function patchRules(root=document){
    root.querySelectorAll('.att-rule-v160').forEach(card=>{
      const title=card.querySelector('b')?.textContent?.trim();
      if(title!=='Cumartesi')return;
      const p=card.querySelector('p');if(!p)return;
      p.innerHTML='<strong>09:00–13:30</strong> normal çalışma • <strong>13:30 sonrası fazla mesai</strong> olarak hesaplanır. Ara mola yok.';
    });
  }

  function patchTable(table){
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
    const dateI=heads.indexOf('tarih'),inI=heads.indexOf('giriş'),outI=heads.indexOf('çıkış'),otI=heads.indexOf('fazla mesai'),statusI=heads.indexOf('mesai durumu');
    if([dateI,inI,outI,otI].some(i=>i<0))return;
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=[...tr.children];if(cells.length<=otI)return;
      const date=cells[dateI]?.textContent.trim();if(!isSaturday(date))return;
      const ci=parseTime(cells[inI]?.textContent.trim()),co=parseTime(cells[outI]?.textContent.trim());
      if(ci===null||co===null)return;
      const saturdayEnd=13*60+30;
      const ot=co>saturdayEnd?Math.max(0,co-Math.max(ci,saturdayEnd)):0;
      if(!ot)return;
      cells[otI].textContent=minsText(ot);cells[otI].classList.add('pos');
      if(statusI>=0&&cells[statusI]&&['—','-',''].includes(cells[statusI].textContent.trim())){
        cells[statusI].innerHTML='<span class="att-badge-v160 warn">Onay Bekliyor</span>';
      }
    });
  }

  function patchAll(){
    const att=document.getElementById('attendance');if(att)patchRules(att);
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(patchTable);
  }

  function schedulePatch(){[60,180,420,900].forEach(ms=>setTimeout(patchAll,ms));}
  document.addEventListener('click',e=>{
    if(e.target.closest('.nav-item[data-view="attendance"], [data-att-detail], [data-att-edit-day], #attPersonSelectV160'))schedulePatch();
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160'))schedulePatch();},true);
  window.addEventListener('load',schedulePatch);
  schedulePatch();
})();
