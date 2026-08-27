// V1.18.4 — Adil hafta tatili motoru: planlanan haftayı tamamlama + 45 saat fazla çalışma ayrımı.
(function bootWeeklyRestSundayV184(){
  if(window.__mindsWeeklyRestSundayV184)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'){
    setTimeout(bootWeeklyRestSundayV184,140);return;
  }
  window.__mindsWeeklyRestSundayV184=true;

  let rows=[],payroll=[],loadedMonth='',loading=false;
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const monthStart=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';
  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const dateIso=v=>{const m=String(v||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};
  const isSunday=iso=>iso&&new Date(`${iso}T12:00:00Z`).getUTCDay()===0;

  function installStyles(){
    if(document.getElementById('weeklyRestV184Style'))return;
    const s=document.createElement('style');s.id='weeklyRestV184Style';s.textContent=`
      .att-weekrest-v184{display:inline-flex;align-items:center;border:1px solid #705f24;background:#342e12;color:#e5ce62;border-radius:16px;padding:4px 7px;font-size:8px;font-weight:850;white-space:nowrap}
      .att-weekrest-v184.ok{border-color:#315d38;background:#17321d;color:#93da80}.att-weekrest-v184.blue{border-color:#315570;background:#142a3f;color:#86b9e4}.att-weekrest-v184.muted{border-color:#3a444a;background:#181e22;color:#9ba7ac}
      .att-weekrest-sub-v184{display:block;margin-top:4px;font-size:8px;color:#aeb8bc;line-height:1.3}.att-weekrest-pay-v184{display:block;margin-top:4px;font-size:8px;color:#e9df2c;font-weight:850;line-height:1.3}
      .att-detail-item-v160.weekrest-v184{border-color:#665e20!important;background:linear-gradient(145deg,#28260c,#15180e)!important}.att-detail-item-v160.weekrest-v184 b{color:#f0e72d!important}
      .att-weekrest-inline-v184{display:block;margin-top:3px;color:#e9df2c;font-size:8px;font-weight:800}
    `;document.head.appendChild(s);
  }

  function selectedPersonId(node=document){
    const drawer=node.closest?.('#attDetailDrawerV166');
    const ds=drawer?.querySelector?.('[data-original-id="attPersonSelectV160"]');if(ds?.value)return ds.value;
    const panel=node.closest?.('.att-panel-v160');
    const local=panel?.querySelector?.('#attPersonSelectV160,[data-original-id="attPersonSelectV160"]');if(local?.value)return local.value;
    const native=[...document.querySelectorAll('#attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));if(native?.value)return native.value;
    return admin()?((state.profiles||[]).find(p=>p.active&&p.role!=='admin')?.id||''):profile.id;
  }

  function byPersonDate(pid,date){return rows.find(x=>String(x.person_id)===String(pid)&&x.sunday_date===date);}

  async function load(force=false){
    const m=monthStart();if(!/^\d{4}-\d{2}-01$/.test(m))return;
    if(loading||(!force&&loadedMonth===m)){patchAll();return;}loading=true;
    try{
      const [w,p]=await Promise.all([
        sb.rpc('attendance_weekly_rest_preview',{p_month:m,p_person_id:null}),
        sb.rpc('payroll_preview',{p_month:m,p_person_id:null})
      ]);
      if(w.error)throw w.error;if(p.error)throw p.error;
      rows=w.data||[];payroll=p.data||[];loadedMonth=m;patchAll();
    }catch(e){console.warn('Hafta tatili hesapları yüklenemedi',e);}finally{loading=false;}
  }

  function patchRules(){
    document.querySelectorAll('#attendance .att-rule-v160').forEach(card=>{
      if(card.querySelector('b')?.textContent?.trim()!=='Pazar')return;
      const p=card.querySelector('p');if(!p)return;
      p.innerHTML='Hafta tatili hakkı yalnızca <strong>45 saat rakamına</strong> bağlı değildir; Pazartesi–Cumartesi için belirlenmiş normal çalışma planının tamamlanması veya kanunen çalışılmış sayılan izin/rapor günleri esas alınır. Mevcut planın net haftalık hedefi sistemde otomatik hesaplanır. Hedef tamamlanmışsa Pazar çalışması <strong>otomatik hafta tatili çalışması</strong> sayılır ve +1,5 yevmiye eklenir. Hedef tamamlanmamışsa hafta tatili primi verilmez; ancak toplam fiili çalışma 45 saati aşmışsa yalnız aşan bölüm <strong>%50 zamlı fazla çalışma</strong> olarak hesaplanır.';
    });
  }

  function patchTable(table){
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
    const dateI=heads.indexOf('tarih'),otI=heads.indexOf('fazla mesai'),statusI=heads.indexOf('mesai durumu');if(dateI<0||otI<0||statusI<0)return;
    const pid=selectedPersonId(table);if(!pid)return;
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=[...tr.children];if(cells.length<=statusI)return;
      const iso=dateIso(cells[dateI]?.textContent);if(!isSunday(iso))return;
      const r=byPersonDate(pid,iso);if(!r)return;
      const target=Number(r.scheduled_target_minutes||0),credit=Number(r.credited_minutes||0),worked=Number(r.sunday_work_minutes||0),over45=Number(r.excess_45_minutes||0),amount=Number(r.total_amount||0);
      if(r.qualified){
        cells[otI].innerHTML=`<span class="att-weekrest-v184 ok">Hafta Tatili • Otomatik</span><span class="att-weekrest-sub-v184">Pazar çalışma: ${minsText(worked)}</span><span class="att-weekrest-sub-v184">Hafta planı: ${minsText(credit)} / ${minsText(target)}</span><span class="att-weekrest-pay-v184">+${money(amount)} hakediş</span>`;
        cells[statusI].innerHTML='<span class="att-weekrest-v184 ok">Otomatik Hak Kazandı</span>';
      }else if(over45>0){
        cells[otI].innerHTML=`<span class="att-weekrest-v184 blue">Pazar Çalışması</span><span class="att-weekrest-sub-v184">Hafta planı: ${minsText(credit)} / ${minsText(target)}</span><span class="att-weekrest-sub-v184">45 saati aşan: ${minsText(over45)}</span><span class="att-weekrest-pay-v184">+${money(amount)} fazla çalışma</span>`;
        cells[statusI].innerHTML='<span class="att-weekrest-v184 blue">45 Saat Aşımı</span>';
      }else{
        cells[otI].innerHTML=`<span class="att-weekrest-v184 muted">Pazar Çalışması</span><span class="att-weekrest-sub-v184">Hafta planı: ${minsText(credit)} / ${minsText(target)} • tamamlanmadı</span><span class="att-weekrest-sub-v184">45 saat aşımı da oluşmadı.</span>`;
        cells[statusI].innerHTML='<span class="att-weekrest-v184 muted">Hafta Tatili Primi Yok</span>';
      }
    });
  }

  function patchSummary(){
    document.querySelectorAll('#attendance .att-detail-summary-v160,#attDetailDrawerV166 .att-detail-summary-v160').forEach(sum=>{
      const pid=selectedPersonId(sum);if(!pid)return;
      const arr=rows.filter(r=>String(r.person_id)===String(pid));
      const amount=arr.reduce((s,r)=>s+Number(r.total_amount||0),0),qualified=arr.filter(r=>r.qualified).length,over45=arr.filter(r=>!r.qualified&&Number(r.excess_45_minutes||0)>0).length;
      let box=sum.querySelector('.weekrest-v184');if(!box){box=document.createElement('div');box.className='att-detail-item-v160 weekrest-v184';sum.appendChild(box);}
      box.innerHTML=`<small>Pazar / Hafta Tatili</small><b>+${money(amount)}</b><span class="att-weekrest-sub-v184">${qualified} hafta tatili • ${over45} adet 45 saat aşımı</span>`;
    });
  }

  function patchPayroll(){
    document.querySelectorAll('#attendance .att-table-v160').forEach(table=>{
      const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
      const personI=heads.indexOf('personel'),fmI=heads.indexOf('fm onaylı');if(personI<0||fmI<0)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children],name=cells[personI]?.textContent.trim();
        const p=(state.profiles||[]).find(x=>x.full_name===name);if(!p)return;
        cells[fmI]?.querySelectorAll('.att-weekrest-inline-v184').forEach(x=>x.remove());
        const arr=rows.filter(r=>String(r.person_id)===String(p.id));if(!arr.length)return;
        const amount=arr.reduce((s,r)=>s+Number(r.total_amount||0),0);if(!amount)return;
        const x=document.createElement('span');x.className='att-weekrest-inline-v184';x.textContent=`Pazar/hafta tatili +${money(amount)}`;cells[fmI]?.appendChild(x);
      });
    });
  }

  function patchAll(){installStyles();patchRules();document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(patchTable);patchSummary();patchPayroll();}

  document.addEventListener('click',e=>{if(e.target.closest('.nav-item[data-view="attendance"],[data-att-detail],[data-att-edit-day]'))setTimeout(()=>{load();patchAll();},420);},true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]')){loadedMonth='';setTimeout(()=>load(true),180);}},true);

  installStyles();
  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))patchAll();},1200);
  setTimeout(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))load(true);},650);
})();
