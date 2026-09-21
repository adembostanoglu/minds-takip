// V1.26.0 — Çekim edit üretim takibi
(function bootShootEditWorkflowV260(){
  if(window.__mindsShootEditWorkflowV260)return;
  if(typeof state==='undefined'||typeof renderShoots!=='function'||typeof openShootModal!=='function'||!profile){
    setTimeout(bootShootEditWorkflowV260,120);return;
  }
  window.__mindsShootEditWorkflowV260=true;

  const info=x=>{
    const total=Math.max(0,Number(x?.video_count||0));
    const done=Math.max(0,Math.min(total,Number(x?.edited_video_count||0)));
    let status=x?.delivered_at?'teslim_edildi':(x?.edit_status||'bekliyor');
    if(status!=='teslim_edildi'){
      if(total>0&&done>=total)status='editlendi';
      else if(done>0)status='editleniyor';
      else status='bekliyor';
    }
    const m={
      bekliyor:['Edit Bekliyor','red'],
      editleniyor:['Editleniyor','yellow'],
      editlendi:['Editlendi','green'],
      teslim_edildi:['Teslim Edildi','blue']
    }[status]||['Edit Bekliyor','red'];
    return {total,done,status,label:m[0],cls:m[1]};
  };
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const canProgress=x=>!!x&&(isAdmin()||x.editor_id===profile?.id||x.responsible_id===profile?.id||x.created_by===profile?.id);

  function style(){
    if(document.getElementById('shootEditV260Style'))return;
    const s=document.createElement('style');s.id='shootEditV260Style';
    s.textContent=`
      #shootRows tr.shoot-edit-done td{background:rgba(60,170,92,.085)}
      #shootRows tr.shoot-delivered td{background:rgba(61,124,205,.075)}
      #shootRows .edit-progress{min-width:138px}
      #shootRows .edit-progress-line{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-bottom:6px}
      #shootRows .edit-track{height:5px;background:#232c31;border-radius:999px;overflow:hidden}
      #shootRows .edit-fill{height:100%;background:#e5df26;border-radius:999px}
      #shootRows tr.shoot-edit-done .edit-fill{background:#4fc96e}
      #shootRows tr.shoot-delivered .edit-fill{background:#4b8fdf}
      #shootRows .shoot-actions-v260{display:flex;gap:5px;flex-wrap:wrap;min-width:150px}
      #shoots .compact-stats{grid-template-columns:repeat(6,minmax(0,1fr))}
      @media(max-width:1200px){#shoots .compact-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;document.head.appendChild(s);
  }

  staffOwnShoot=function(x){
    return isAdmin()||x.responsible_id===profile?.id||x.created_by===profile?.id||x.editor_id===profile?.id;
  };
  monthShoots=function(){
    return state.shoots.filter(x=>x.month===selectedMonth&&(isAdmin()||staffOwnShoot(x)));
  };

  renderShoots=function(){
    style();
    const sh=monthShoots(), infos=sh.map(info);
    const totalVideos=infos.reduce((s,i)=>s+i.total,0);
    const cards=[
      ['Çekim Kaydı',sh.length],
      ['Toplam Video',totalVideos],
      ['Edit Bekleyen',infos.filter(i=>i.status==='bekliyor').length],
      ['Editleniyor',infos.filter(i=>i.status==='editleniyor').length],
      ['Editlendi',infos.filter(i=>i.status==='editlendi').length],
      ['Teslim Edildi',infos.filter(i=>i.status==='teslim_edildi').length]
    ];
    el('shootStats').innerHTML=cards.map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value shoot-count">${v}</div><div class="foot"><b>${prettyMonth(selectedMonth)}</b> verisi</div></div>`).join('');

    el('shootRows').innerHTML=sh.map(x=>{
      const i=info(x), pct=i.total?Math.round(i.done/i.total*100):0;
      const row=i.status==='editlendi'?'shoot-edit-done':i.status==='teslim_edildi'?'shoot-delivered':'';
      const actions=[];
      if(canProgress(x))actions.push(`<button class="small-primary" data-shoot-edit-progress="${x.id}">Edit Takibi</button>`);
      if(typeof canManageShoot==='function'&&canManageShoot(x))actions.push(typeof actionButtons==='function'?actionButtons('shoot',x.id,true):`<button class="small-primary" data-edit-shoot="${x.id}">Güncelle</button>`);
      return `<tr class="${row}">
        <td>${formatDate(x.shoot_date)}</td>
        <td><div class="firm-cell">${firm(x.firm_id)?firmLogo(firm(x.firm_id)):''}<b>${esc(firm(x.firm_id)?.name||x.external_client_name||'—')}</b></div></td>
        <td><b>${esc(x.title||'Video Çekimi')}</b></td>
        <td><span class="badge blue">${i.total} Video</span></td>
        <td><div class="edit-progress"><div class="edit-progress-line"><span class="badge ${i.cls}">${i.label}</span><b>${i.done}/${i.total}</b></div><div class="edit-track"><div class="edit-fill" style="width:${pct}%"></div></div></div></td>
        <td>${esc(x.editor_id?personName(x.editor_id):'Atanmadı')}</td>
        <td>${esc(personName(x.responsible_id))}</td>
        <td>${esc(x.notes||'—')}</td>
        <td><div class="shoot-actions-v260">${actions.join('')||'—'}</div></td>
      </tr>`;
    }).join('')||'<tr><td colspan="9" class="empty">Bu ay çekim kaydı yok.</td></tr>';
  };

  function editModal(x){
    if(!canProgress(x))return toast('Bu çekimin edit durumunu güncelleme yetkin yok.',true);
    const i=info(x), editor=x.editor_id||(!isAdmin()?profile.id:'');
    openModal('Edit Takibi',`<div class="form-grid">
      <div class="field full"><label>Çekim</label><input disabled value="${esc((firm(x.firm_id)?.name||x.external_client_name||'—')+' · '+(x.title||'Video Çekimi'))}"></div>
      <div class="field"><label>Toplam Video</label><input disabled value="${i.total}"></div>
      <div class="field"><label>Editlenen Video</label><input name="done" type="number" min="0" max="${i.total}" step="1" required value="${i.done}"></div>
      ${isAdmin()?`<div class="field full"><label>Editör</label><select name="editor"><option value="">Atanmadı</option>${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===editor?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="editor" value="${editor}"><div class="field full"><label>Editör</label><input disabled value="${esc(personName(editor))}"></div>`}
      <div class="field full"><label style="display:flex;align-items:center;gap:8px"><input style="width:auto" type="checkbox" name="delivered" value="1" ${i.status==='teslim_edildi'?'checked':''}> Müşteriye teslim edildi</label></div>
      <div class="field full"><div class="info-banner"><b>Durum otomatik hesaplanır:</b> 0/${i.total} Edit Bekliyor · ara değer Editleniyor · ${i.total}/${i.total} Editlendi · teslim işaretlenirse Teslim Edildi.</div></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      let done=Number(fd.get('done'));
      if(!Number.isInteger(done)||done<0||done>i.total)throw new Error(`Editlenen video sayısı 0 ile ${i.total} arasında olmalı.`);
      const delivered=fd.get('delivered')==='1';
      if(delivered)done=i.total;
      let status=delivered?'teslim_edildi':done>=i.total&&i.total>0?'editlendi':done>0?'editleniyor':'bekliyor';
      const now=new Date().toISOString();
      const editorId=fd.get('editor')||x.editor_id||(!isAdmin()?profile.id:null);
      const payload={
        editor_id:editorId||null,
        edited_video_count:done,
        edit_status:status,
        edit_started_at:done>0?(x.edit_started_at||now):null,
        edited_at:(status==='editlendi'||status==='teslim_edildi')?(x.edited_at||now):null,
        delivered_at:status==='teslim_edildi'?(x.delivered_at||now):null
      };
      const {error}=await sb.from('shoots').update(payload).eq('id',x.id);if(error)throw error;
    });
  }

  openShootModal=function(shoot=null){
    let available=activeFirms();
    if(shoot){const oldFirm=firm(shoot.firm_id);if(oldFirm&&!available.some(f=>f.id===oldFirm.id))available=[oldFirm,...available];}
    if(!available.length)return toast('Önce firma eklemelisin.',true);
    const currentEditor=shoot?.editor_id||'';
    openModal(shoot?'Çekimi Güncelle':'Yeni Çekim',`<div class="form-grid">
      <div class="field full"><label>Firma</label><select name="firm" required>${available.map(f=>`<option value="${f.id}" ${shoot?.firm_id===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full"><label>Çekim Başlığı</label><input name="title" placeholder="Örn. Aylık sosyal medya çekimi" value="${esc(shoot?.title||'')}"></div>
      <div class="field"><label>Çekim Tarihi</label><input name="date" type="date" required value="${shoot?.shoot_date||defaultDateForSelectedMonth()}"></div>
      <div class="field"><label>Çekilen Video İçeriği</label><input name="video_count" type="number" min="1" required value="${shoot?.video_count??1}"></div>
      ${isAdmin()?`<div class="field"><label>Çekim Sorumlusu</label><select name="person"><option value="">Seçilmedi</option>${peopleOptions(shoot?.responsible_id||profile.id)}</select></div><div class="field"><label>Editör</label><select name="editor"><option value="">Sonra atanacak</option>${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===currentEditor?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>`:`<div class="field full"><label>Sorumlu Personel</label><input disabled value="${esc(profile.full_name)}"><input type="hidden" name="person" value="${profile.id}"></div>`}
      <div class="field full"><label>Not</label><textarea name="notes" placeholder="Çekim detayı, lokasyon, içerik notu...">${esc(shoot?.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      assertSelectedMonthDate(fd.get('date'),'Çekim tarihi');
      const count=Number(fd.get('video_count'));if(!Number.isInteger(count)||count<1)throw new Error('Çekilen video içeriği en az 1 olmalı.');
      const done=Math.min(count,Number(shoot?.edited_video_count||0));
      let status=shoot?.delivered_at?'teslim_edildi':done>=count?'editlendi':done>0?'editleniyor':'bekliyor';
      const payload={firm_id:fd.get('firm'),shoot_date:fd.get('date'),title:String(fd.get('title')||'').trim()||null,video_count:count,responsible_id:fd.get('person')||null,notes:String(fd.get('notes')||'').trim()||null,edited_video_count:done,edit_status:status};
      if(isAdmin())payload.editor_id=fd.get('editor')||null;
      if(shoot){const {error}=await sb.from('shoots').update(payload).eq('id',shoot.id);if(error)throw error;}
      else{payload.created_by=profile.id;payload.editor_id=isAdmin()?(fd.get('editor')||null):null;const {error}=await sb.from('shoots').insert(payload);if(error)throw error;}
    });
  };

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-shoot-edit-progress]');if(!b)return;
    e.preventDefault();e.stopPropagation();
    const x=state.shoots.find(v=>String(v.id)===String(b.dataset.shootEditProgress));if(x)editModal(x);
  },true);

  style();
  setTimeout(()=>{try{renderShoots()}catch(e){console.warn('V1.26 shoot edit render',e)}},100);
})();