// V1.18.9 — Personel detay çekmecesinde günlük kayıt düzenleme / silme kontrolleri.
(function bootAttendanceDayManageV189(){
  if(window.__mindsAttendanceDayManageV189)return;
  window.__mindsAttendanceDayManageV189=true;

  function admin(){
    try{if(typeof isAdmin==='function')return !!isAdmin();}catch(_e){}
    return String(window.profile?.role||'').toLowerCase()==='admin';
  }

  function installStyle(){
    if(document.getElementById('attDayManageV189Style'))return;
    const s=document.createElement('style');s.id='attDayManageV189Style';s.textContent=`
      #attDetailDrawerV166{width:min(820px,96vw)!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(1),#attDetailDrawerV166 .att-table-v160 td:nth-child(1){width:12%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(2),#attDetailDrawerV166 .att-table-v160 td:nth-child(2){width:15%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(3),#attDetailDrawerV166 .att-table-v160 td:nth-child(3){width:8%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(4),#attDetailDrawerV166 .att-table-v160 td:nth-child(4){width:8%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(5),#attDetailDrawerV166 .att-table-v160 td:nth-child(5){width:8%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(6),#attDetailDrawerV166 .att-table-v160 td:nth-child(6){width:14%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(7),#attDetailDrawerV166 .att-table-v160 td:nth-child(7){width:15%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(8),#attDetailDrawerV166 .att-table-v160 td:nth-child(8){display:table-cell!important;width:20%!important}
      #attDetailDrawerV166 .att-row-actions-v160{display:flex!important;gap:5px!important;flex-wrap:wrap!important}
      #attDetailDrawerV166 .att-row-actions-v160 button{font-size:8px!important;padding:5px 7px!important;min-height:auto!important}
      #attDetailDrawerV166 .att-delete-day-v189{border-color:#71323a!important;background:#2d171b!important;color:#ef9a96!important}
      @media(max-width:760px){#attDetailDrawerV166{width:100vw!important}.att-day-manage-hint-v189{display:none}}
    `;document.head.appendChild(s);
  }

  function drawer(){return document.getElementById('attDetailDrawerV166');}
  function currentPersonId(){
    const d=drawer();
    const cloned=d?.querySelector('[data-original-id="attPersonSelectV160"]');
    if(cloned?.value)return cloned.value;
    const real=[...document.querySelectorAll('#attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    return real?.value||null;
  }

  function patchDrawer(){
    if(!admin())return;
    installStyle();
    const d=drawer();if(!d?.classList.contains('open'))return;
    d.querySelectorAll('.att-table-v160 tbody tr').forEach(tr=>{
      const edit=tr.querySelector('[data-att-edit-day]');
      if(!edit)return;
      const date=edit.dataset.attEditDay;
      const actions=edit.closest('.att-row-actions-v160')||edit.parentElement;
      if(!actions||actions.querySelector('[data-att-delete-day-v189]'))return;
      const del=document.createElement('button');
      del.type='button';del.className='ghost att-delete-day-v189';
      del.dataset.attDeleteDayV189=date;del.textContent='Günü Sil';
      actions.appendChild(del);
    });
  }

  async function deleteDay(date){
    if(!admin())return;
    const pid=currentPersonId();if(!pid||!date)return;
    const ok=confirm(`${date.split('-').reverse().join('.')} tarihindeki giriş-çıkış ve izin/gün durumu kaydı silinsin mi?\n\nAyrı girilmiş Ek Mesai / Akşam Çekimi kaydı varsa silinmez.`);
    if(!ok)return;
    try{
      const {error}=await sb.rpc('admin_delete_attendance_day',{p_person_id:pid,p_work_date:date});
      if(error)throw error;
      if(typeof toast==='function')toast('Gün kaydı silindi.');
      const d=drawer(),b=document.getElementById('attDetailBackdropV166');d?.classList.remove('open');b?.classList.remove('open');
      const picker=document.getElementById('monthPicker');
      picker?.dispatchEvent(new Event('change',{bubbles:true}));
      setTimeout(()=>{
        const detail=document.querySelector(`[data-att-detail="${CSS.escape(pid)}"]`);
        detail?.click();
      },650);
    }catch(e){console.error('Gün kaydı silinemedi',e);if(typeof toast==='function')toast(e?.message||'Gün kaydı silinemedi.',true);}
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-att-detail]'))setTimeout(patchDrawer,90);
    const del=e.target.closest('#attDetailDrawerV166 [data-att-delete-day-v189]');
    if(del){e.preventDefault();e.stopPropagation();deleteDay(del.dataset.attDeleteDayV189);return;}
    if(e.target.closest('#attDetailDrawerV166'))setTimeout(patchDrawer,30);
  },true);

  document.addEventListener('change',e=>{
    if(e.target.closest('#attDetailDrawerV166 [data-original-id="attPersonSelectV160"]'))setTimeout(patchDrawer,80);
  },true);

  installStyle();
  setTimeout(patchDrawer,500);
})();
