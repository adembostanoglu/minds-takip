// V1.26.1 — Çekim edit takibi, canlı ekran düzeltmesi
(function(){
  function ready(){
    return typeof state!=='undefined' &&
      typeof profile!=='undefined' && profile &&
      typeof el==='function' &&
      typeof openModal==='function' &&
      typeof sb!=='undefined' &&
      typeof selectedMonth!=='undefined';
  }

  function esc(v){ return typeof escapeHtml==='function' ? escapeHtml(String(v??'')) : String(v??''); }
  function shootInfo(x){
    const total=Math.max(0,Number(x?.video_count||0));
    const done=Math.max(0,Math.min(total,Number(x?.edited_video_count||0)));
    let status=x?.delivered_at?'teslim_edildi':String(x?.edit_status||'bekliyor');
    if(status!=='teslim_edildi'){
      if(total>0 && done>=total) status='editlendi';
      else if(done>0) status='editleniyor';
      else status='bekliyor';
    }
    const labels={
      bekliyor:['Edit Bekliyor','red'],
      editleniyor:['Editleniyor','yellow'],
      editlendi:['Editlendi','green'],
      teslim_edildi:['Teslim Edildi','blue']
    };
    const [label,cls]=labels[status]||labels.bekliyor;
    return {total,done,status,label,cls,pct:total?Math.round(done/total*100):0};
  }

  function allowed(x){
    return !!x && (
      (typeof isAdmin==='function' && isAdmin()) ||
      x.editor_id===profile.id ||
      x.responsible_id===profile.id ||
      x.created_by===profile.id
    );
  }

  function shootsForMonth(){
    const all=(state.shoots||[]).filter(x=>x.month===selectedMonth);
    if(typeof isAdmin==='function' && isAdmin()) return all;
    return all.filter(allowed);
  }

  function installStyle(){
    if(document.getElementById('shootEditFix261')) return;
    const s=document.createElement('style');
    s.id='shootEditFix261';
    s.textContent=
      '#shootRows tr.edit-done td{background:rgba(69,181,97,.08)}'+
      '#shootRows tr.edit-delivered td{background:rgba(61,126,211,.08)}'+
      '#shootRows .edit-cell{min-width:150px}'+
      '#shootRows .edit-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}'+
      '#shootRows .edit-track{height:5px;border-radius:999px;background:#20282d;overflow:hidden}'+
      '#shootRows .edit-fill{height:100%;border-radius:999px;background:#e6df29}'+
      '#shootRows tr.edit-done .edit-fill{background:#53c972}'+
      '#shootRows tr.edit-delivered .edit-fill{background:#4c8edf}'+
      '#shootRows .edit-actions{display:flex;gap:5px;flex-wrap:wrap}'+
      '#shoots .compact-stats{grid-template-columns:repeat(6,minmax(0,1fr))}'+
      '@media(max-width:1200px){#shoots .compact-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    document.head.appendChild(s);
  }

  function render(){
    const body=el('shootRows');
    const stats=el('shootStats');
    if(!body||!stats) return;

    installStyle();
    const rows=shootsForMonth();
    const infos=rows.map(shootInfo);
    const statRows=[
      ['Çekim Kaydı',rows.length],
      ['Toplam Video',infos.reduce((s,x)=>s+x.total,0)],
      ['Edit Bekleyen',infos.filter(x=>x.status==='bekliyor').length],
      ['Editleniyor',infos.filter(x=>x.status==='editleniyor').length],
      ['Editlendi',infos.filter(x=>x.status==='editlendi').length],
      ['Teslim Edildi',infos.filter(x=>x.status==='teslim_edildi').length]
    ];
    stats.innerHTML=statRows.map(([l,v])=>'<div class="stat"><div class="label">'+l+'</div><div class="value shoot-count">'+v+'</div><div class="foot"><b>'+prettyMonth(selectedMonth)+'</b> ekip verisi</div></div>').join('');

    body.innerHTML=rows.map(x=>{
      const i=shootInfo(x);
      const rowClass=i.status==='editlendi'?'edit-done':i.status==='teslim_edildi'?'edit-delivered':'';
      const f=typeof firm==='function'?firm(x.firm_id):null;
      const logo=f && typeof firmLogo==='function'?firmLogo(f):'';
      const editor=x.editor_id && typeof personName==='function'?personName(x.editor_id):'Atanmadı';
      const responsible=x.responsible_id && typeof personName==='function'?personName(x.responsible_id):'—';
      let actions='';
      if(allowed(x)) actions+='<button class="small-primary" data-edit-progress-261="'+x.id+'">Edit Takibi</button>';
      if(typeof canManageShoot==='function' && canManageShoot(x)){
        actions+='<button class="small-primary" data-edit-shoot="'+x.id+'">Güncelle</button><button class="small-danger" data-delete-shoot="'+x.id+'">Sil</button>';
      }
      if(!actions) actions='—';
      return '<tr class="'+rowClass+'">'+
        '<td>'+formatDate(x.shoot_date)+'</td>'+
        '<td><div class="firm-cell">'+logo+'<b>'+esc(f?.name||x.external_client_name||'—')+'</b></div></td>'+
        '<td><b>'+esc(x.title||'Video Çekimi')+'</b></td>'+
        '<td><span class="badge blue">'+i.total+' Video</span></td>'+
        '<td><div class="edit-cell"><div class="edit-top"><span class="badge '+i.cls+'">'+i.label+'</span><b>'+i.done+'/'+i.total+'</b></div><div class="edit-track"><div class="edit-fill" style="width:'+i.pct+'%"></div></div></div></td>'+
        '<td>'+esc(editor)+'</td>'+
        '<td>'+esc(responsible)+'</td>'+
        '<td>'+esc(x.notes||'—')+'</td>'+
        '<td><div class="edit-actions">'+actions+'</div></td>'+
      '</tr>';
    }).join('') || '<tr><td colspan="9" class="empty">Bu ay çekim kaydı yok.</td></tr>';
  }

  function modal(x){
    if(!allowed(x)) return toast('Bu çekimin edit durumunu güncelleme yetkin yok.',true);
    const i=shootInfo(x);
    const admin=typeof isAdmin==='function'&&isAdmin();
    const editor=x.editor_id||(!admin?profile.id:'');
    const editorField=admin
      ? '<div class="field full"><label>Editör</label><select name="editor"><option value="">Atanmadı</option>'+
        activeProfiles().map(p=>'<option value="'+p.id+'" '+(p.id===editor?'selected':'')+'>'+esc(p.full_name)+'</option>').join('')+
        '</select></div>'
      : '<input type="hidden" name="editor" value="'+editor+'"><div class="field full"><label>Editör</label><input disabled value="'+esc(personName(editor))+'"></div>';

    openModal('Edit Takibi',
      '<div class="form-grid">'+
      '<div class="field full"><label>Çekim</label><input disabled value="'+esc((firm(x.firm_id)?.name||x.external_client_name||'—')+' · '+(x.title||'Video Çekimi'))+'"></div>'+
      '<div class="field"><label>Toplam Video</label><input disabled value="'+i.total+'"></div>'+
      '<div class="field"><label>Editlenen Video</label><input name="done" type="number" min="0" max="'+i.total+'" step="1" required value="'+i.done+'"></div>'+
      editorField+
      '<div class="field full"><label style="display:flex;align-items:center;gap:8px"><input style="width:auto" type="checkbox" name="delivered" value="1" '+(i.status==='teslim_edildi'?'checked':'')+'> Müşteriye teslim edildi</label></div>'+
      '<div class="field full"><div class="info-banner"><b>Durum otomatik:</b> 0/'+i.total+' Edit Bekliyor · ara değer Editleniyor · '+i.total+'/'+i.total+' Editlendi.</div></div>'+
      '<div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>'+
      '</div>',
      async fd=>{
        let done=Number(fd.get('done'));
        if(!Number.isInteger(done)||done<0||done>i.total) throw new Error('Editlenen video sayısı 0 ile '+i.total+' arasında olmalı.');
        const delivered=fd.get('delivered')==='1';
        if(delivered) done=i.total;
        const status=delivered?'teslim_edildi':(i.total>0&&done>=i.total?'editlendi':(done>0?'editleniyor':'bekliyor'));
        const now=new Date().toISOString();
        const editorId=fd.get('editor')||x.editor_id||(!admin?profile.id:null);
        const payload={
          editor_id:editorId||null,
          edited_video_count:done,
          edit_status:status,
          edit_started_at:done>0?(x.edit_started_at||now):null,
          edited_at:(status==='editlendi'||status==='teslim_edildi')?(x.edited_at||now):null,
          delivered_at:status==='teslim_edildi'?(x.delivered_at||now):null
        };
        const {error}=await sb.from('shoots').update(payload).eq('id',x.id);
        if(error) throw error;
      }
    );
  }

  function boot(){
    if(!ready()){setTimeout(boot,150);return;}
    window.__mindsShootEditFix261=true;
    window.renderShoots=render;
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-edit-progress-261]');
      if(!b) return;
      e.preventDefault();e.stopPropagation();
      const x=(state.shoots||[]).find(v=>String(v.id)===String(b.dataset.editProgress261));
      if(x) modal(x);
    },true);
    render();
  }

  boot();
})();