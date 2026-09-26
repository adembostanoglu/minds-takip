// V1.27.7 — Pazartesi-Cumartesi otomatik fazla mesai: 19:30 tetik, 18:30 başlangıç.
(function bootSaturdayOvertimeV211(){
  if(window.__mindsSaturdayOvertimeV211)return;
  window.__mindsSaturdayOvertimeV211=true;

  const parseTime=v=>{const m=String(v||'').match(/^(\d{1,2}):(\d{2})$/);return m?Number(m[1])*60+Number(m[2]):null;};
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const isSaturday=v=>{const m=String(v||'').match(/^(\d{2})\.(\d{2})\.(\d{4})$/);if(!m)return false;return new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00Z`).getUTCDay()===6;};

  function patchRules(root=document){
    root.querySelectorAll('.att-rule-v160').forEach(card=>{
      const title=card.querySelector('b')?.textContent?.trim();
      if(title!=='Cumartesi')return;
      const p=card.querySelector('p');if(!p)return;
      p.innerHTML='<strong>09:00–13:30</strong> normal çalışma • Otomatik fazla mesai yalnızca <strong>19:30 ve sonrası çıkışlarda</strong> oluşur; süre <strong>18:30’dan itibaren</strong> hesaplanır. Ara mola yok.';
    });
  }

  function patchTable(table){
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
    const dateI=heads.indexOf('tarih'),inI=heads.indexOf('giriş'),outI=heads.indexOf('çıkış'),otI=heads.indexOf('fazla mesai'),statusI=heads.indexOf('mesai durumu'),actionI=heads.indexOf('işlem');
    if([dateI,inI,outI,otI].some(i=>i<0))return;
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=[...tr.children];if(cells.length<=otI)return;
      const date=cells[dateI]?.textContent.trim();if(!isSaturday(date))return;
      const ci=parseTime(cells[inI]?.textContent.trim()),co=parseTime(cells[outI]?.textContent.trim());
      if(ci===null||co===null)return;
      const saturdayTrigger=19*60+30;
      const saturdayBaseline=18*60+30;
      const ot=co>=saturdayTrigger?Math.max(0,co-saturdayBaseline):0;
      cells[otI].classList.remove('pos');
      if(!ot){
        cells[otI].textContent='—';
        if(statusI>=0&&cells[statusI]){
          const st=String(cells[statusI].textContent||'').trim();
          if(st==='Onay Bekliyor'||st==='Onaylı')cells[statusI].textContent='—';
        }
        if(actionI>=0&&cells[actionI]){
          cells[actionI].querySelectorAll('[data-att-overtime],[data-v235-normal]').forEach(x=>x.remove());
          const wrap=cells[actionI].querySelector('.att-row-actions-v160');
          if(wrap&&!wrap.children.length)wrap.remove();
        }
        return;
      }
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
  window.__mindsPatchSaturdayOvertimeV283=patchAll;
  window.addEventListener('load',schedulePatch);
  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))patchAll();},700);
  schedulePatch();
})();
