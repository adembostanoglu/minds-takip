// V1.12 — self-service profile photos for sidebar identity
(function bootProfileAvatarsV120(){
  if(typeof sb==='undefined' || typeof el!=='function'){
    setTimeout(bootProfileAvatarsV120,100);
    return;
  }
  if(window.__mindsProfileAvatarsV120) return;
  window.__mindsProfileAvatarsV120=true;

  const BUCKET='profile-avatars';
  const allowed=new Set(['image/png','image/jpeg','image/webp']);
  let uploadBusy=false;

  function currentRecord(){
    if(!profile?.id) return null;
    return state?.profiles?.find(p=>p.id===profile.id) || profile;
  }

  function initialFor(p){
    return String(p?.full_name||'M').trim().charAt(0).toUpperCase() || 'M';
  }

  function cssUrl(url){
    return String(url||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  }

  function syncSidebarAvatar(){
    const node=el('sideAvatar');
    if(!node || !profile) return;
    const p=currentRecord();
    if(p?.avatar_url!==undefined) profile.avatar_url=p.avatar_url;
    node.classList.add('profile-avatar-upload');
    node.setAttribute('role','button');
    node.setAttribute('tabindex','0');
    node.setAttribute('aria-label','Profil fotoğrafını değiştir');
    node.title='Profil fotoğrafını değiştir';
    if(p?.avatar_url){
      node.textContent='';
      node.classList.add('has-photo');
      node.style.backgroundImage=`url("${cssUrl(p.avatar_url)}")`;
    }else{
      node.classList.remove('has-photo');
      node.style.backgroundImage='';
      node.textContent=initialFor(p);
    }
  }

  function avatarPathFromPublicUrl(url){
    if(!url) return null;
    const marker=`/storage/v1/object/public/${BUCKET}/`;
    const i=String(url).indexOf(marker);
    if(i<0) return null;
    try{return decodeURIComponent(String(url).slice(i+marker.length).split('?')[0]);}
    catch(_e){return String(url).slice(i+marker.length).split('?')[0];}
  }

  function ensureInput(){
    let input=el('profileAvatarFileV120');
    if(input) return input;
    input=document.createElement('input');
    input.id='profileAvatarFileV120';
    input.type='file';
    input.accept='image/png,image/jpeg,image/webp';
    input.style.display='none';
    document.body.appendChild(input);
    input.addEventListener('change',async()=>{
      const file=input.files?.[0];
      input.value='';
      if(!file || !profile?.id || uploadBusy) return;
      if(!allowed.has(file.type)) return toast('Profil fotoğrafı PNG, JPG veya WebP olmalı.',true);
      if(file.size>3*1024*1024) return toast('Profil fotoğrafı en fazla 3 MB olabilir.',true);

      uploadBusy=true;
      const node=el('sideAvatar');
      node?.classList.add('avatar-uploading');
      const oldUrl=currentRecord()?.avatar_url || null;
      let newPath=null;
      try{
        toast('Profil fotoğrafı yükleniyor...');
        const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
        newPath=`${profile.id}/avatar-${Date.now()}.${ext}`;
        const up=await sb.storage.from(BUCKET).upload(newPath,file,{cacheControl:'3600',upsert:false,contentType:file.type});
        if(up.error) throw up.error;
        const pub=sb.storage.from(BUCKET).getPublicUrl(newPath);
        const newUrl=pub?.data?.publicUrl;
        if(!newUrl) throw new Error('Profil fotoğrafı bağlantısı oluşturulamadı.');

        const saved=await sb.rpc('set_my_avatar',{p_avatar_url:newUrl});
        if(saved.error) throw saved.error;

        profile.avatar_url=newUrl;
        const stateProfile=state?.profiles?.find(p=>p.id===profile.id);
        if(stateProfile) stateProfile.avatar_url=newUrl;
        syncSidebarAvatar();
        toast('Profil fotoğrafın güncellendi.');

        const oldPath=avatarPathFromPublicUrl(oldUrl);
        if(oldPath && oldPath!==newPath){
          sb.storage.from(BUCKET).remove([oldPath]).catch(()=>{});
        }
      }catch(e){
        if(newPath) try{ await sb.storage.from(BUCKET).remove([newPath]); }catch(_e){}
        toast(typeof friendlyError==='function'?friendlyError(e):String(e?.message||e),true);
      }finally{
        uploadBusy=false;
        node?.classList.remove('avatar-uploading');
      }
    });
    return input;
  }

  function bindAvatar(){
    const node=el('sideAvatar');
    if(!node || node.dataset.avatarBoundV120==='1') return;
    node.dataset.avatarBoundV120='1';
    const choose=()=>{ if(!uploadBusy && profile) ensureInput().click(); };
    node.addEventListener('click',choose);
    node.addEventListener('keydown',e=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); choose(); }
    });
  }

  function installStyles(){
    if(el('profileAvatarStyleV120')) return;
    const st=document.createElement('style');
    st.id='profileAvatarStyleV120';
    st.textContent=`
      #sideAvatar.profile-avatar-upload{position:relative;overflow:hidden;cursor:pointer;flex:0 0 38px;background-size:cover;background-position:center;background-repeat:no-repeat;box-shadow:0 0 0 1px rgba(255,255,255,.08);transition:transform .16s ease,box-shadow .16s ease,filter .16s ease}
      #sideAvatar.profile-avatar-upload:hover{transform:scale(1.06);box-shadow:0 0 0 2px rgba(235,233,60,.38)}
      #sideAvatar.profile-avatar-upload:after{content:'+';position:absolute;right:-1px;bottom:-1px;width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:#111;color:#ebe93c;border:1px solid #ebe93c;font-size:12px;font-weight:900;line-height:1;opacity:.94}
      #sideAvatar.profile-avatar-upload.has-photo{color:transparent;background-color:#20272c}
      #sideAvatar.profile-avatar-upload.avatar-uploading{filter:grayscale(.25) brightness(.72);pointer-events:none}
      #sideAvatar.profile-avatar-upload.avatar-uploading:after{content:'…';}
    `;
    document.head.appendChild(st);
  }

  installStyles();
  bindAvatar();
  syncSidebarAvatar();

  if(typeof renderAll==='function'){
    const previousRenderAll=renderAll;
    renderAll=function(){
      previousRenderAll();
      bindAvatar();
      syncSidebarAvatar();
    };
  }

  setTimeout(()=>{ bindAvatar(); syncSidebarAvatar(); },180);
})();
