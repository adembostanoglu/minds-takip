// V1.16.1 — Hesabım / kendi şifresini değiştirme.
(function bootMyAccountV161(){
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof openModal!=='function'){
    setTimeout(bootMyAccountV161,120); return;
  }
  if(window.__mindsMyAccountV161) return;
  window.__mindsMyAccountV161=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');

  function installStyles(){
    if(document.getElementById('myAccountV161Styles')) return;
    const st=document.createElement('style'); st.id='myAccountV161Styles'; st.textContent=`
      #account{padding-bottom:30px}.account-card-v161{max-width:720px;border:1px solid #293239;border-radius:14px;background:#0f1519;overflow:hidden}.account-head-v161{padding:18px;border-bottom:1px solid #263037;display:flex;align-items:center;gap:12px}.account-avatar-v161{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#dfe72c;color:#111;font-size:18px;font-weight:850}.account-head-v161 h3{margin:0;font-size:15px}.account-head-v161 p{margin:4px 0 0;color:#7d8a90;font-size:9px}.account-body-v161{padding:18px}.account-row-v161{display:grid;grid-template-columns:150px 1fr;gap:12px;padding:11px 0;border-bottom:1px solid #20292e;font-size:10px}.account-row-v161 span{color:#7c8a90}.account-row-v161 b{color:#dfe6e8}.account-actions-v161{display:flex;justify-content:flex-end;padding-top:16px}.account-note-v161{margin-top:12px;padding:10px 12px;border:1px solid #303a40;border-radius:10px;background:#11181c;color:#87949a;font-size:9px;line-height:1.55}.profile-box[data-account-v161]{cursor:pointer}.profile-box[data-account-v161]:hover{border-color:#5a5c28;background:#151a17}@media(max-width:700px){.account-row-v161{grid-template-columns:1fr;gap:4px}}
    `; document.head.appendChild(st);
  }

  function ensureUI(){
    installStyles();
    let nav=document.querySelector('.nav-item[data-view="account"]');
    if(!nav){
      nav=document.createElement('button'); nav.className='nav-item'; nav.dataset.view='account'; nav.innerHTML='◉ <span>Hesabım</span>';
      const settings=document.querySelector('.nav-item[data-view="settings"]');
      settings?.insertAdjacentElement('beforebegin',nav);
      nav.addEventListener('click',e=>{e.preventDefault();openAccount();});
    }
    let section=document.getElementById('account');
    if(!section){
      section=document.createElement('section'); section.id='account'; section.className='view';
      const settingsSection=document.getElementById('settings');
      settingsSection?settingsSection.insertAdjacentElement('beforebegin',section):document.querySelector('.main')?.appendChild(section);
    }
    const box=document.querySelector('.profile-box');
    if(box&&!box.dataset.accountV161){
      box.dataset.accountV161='1'; box.title='Hesabım / Şifre Değiştir';
      box.addEventListener('click',openAccount);
    }
    renderAccount();
  }

  function roleText(){return profile.role==='admin'?'Yönetici':'Personel';}

  function renderAccount(){
    const section=document.getElementById('account'); if(!section)return;
    const initial=(profile.full_name||'M').trim().charAt(0).toUpperCase();
    section.innerHTML=`
      <div class="section-actions"><div><h2>Hesabım</h2><p>Kendi hesap bilgilerin ve şifre ayarların.</p></div></div>
      <div class="account-card-v161">
        <div class="account-head-v161"><div class="account-avatar-v161">${esc(initial)}</div><div><h3>${esc(profile.full_name)}</h3><p>${esc(roleText())}</p></div></div>
        <div class="account-body-v161">
          <div class="account-row-v161"><span>Kullanıcı adı</span><b>${esc(profile.username)}</b></div>
          <div class="account-row-v161"><span>Ad Soyad</span><b>${esc(profile.full_name)}</b></div>
          <div class="account-row-v161"><span>Yetki</span><b>${esc(roleText())}</b></div>
          <div class="account-note-v161">Şifren yalnızca senin hesabın için değiştirilir. Başka bir personelin hesabına veya şifresine erişemezsin.</div>
          <div class="account-actions-v161"><button class="primary" id="changeOwnPasswordV161">Şifremi Değiştir</button></div>
        </div>
      </div>`;
    document.getElementById('changeOwnPasswordV161')?.addEventListener('click',openPasswordModal);
  }

  function openAccount(){
    ensureUI();
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active-view'));
    document.getElementById('account')?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='account'));
    const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');
    if(t)t.textContent='Hesabım'; if(s)s.textContent='Hesap bilgilerin ve şifre güvenliği.';
    renderAccount();
  }

  function openPasswordModal(){
    openModal('Şifremi Değiştir',`<div class="form-grid">
      <div class="field full"><label>Kullanıcı</label><input value="${esc(profile.username)}" disabled></div>
      <div class="field full"><label>Mevcut Şifre</label><input name="current_password" type="password" autocomplete="current-password" required></div>
      <div class="field"><label>Yeni Şifre</label><input name="new_password" type="password" autocomplete="new-password" minlength="8" required></div>
      <div class="field"><label>Yeni Şifre Tekrar</label><input name="new_password_repeat" type="password" autocomplete="new-password" minlength="8" required></div>
      <div class="field full"><div class="field-help">Yeni şifre en az 8 karakter olmalı.</div></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Şifreyi Güncelle</button></div>
    </div>`,async fd=>{
      const current=String(fd.get('current_password')||''),next=String(fd.get('new_password')||''),repeat=String(fd.get('new_password_repeat')||'');
      if(next.length<8) throw new Error('Yeni şifre en az 8 karakter olmalı.');
      if(next!==repeat) throw new Error('Yeni şifreler birbiriyle aynı değil.');
      if(current===next) throw new Error('Yeni şifre mevcut şifreden farklı olmalı.');
      const email=typeof authEmail==='function'?authEmail(profile.username):`${profile.username}@minds.local`;
      const verify=await sb.auth.signInWithPassword({email,password:current});
      if(verify.error) throw new Error('Mevcut şifre yanlış.');
      const {error}=await sb.auth.updateUser({password:next});
      if(error) throw error;
      setTimeout(()=>{if(typeof toast==='function')toast('Şifren başarıyla değiştirildi.');},250);
    });
  }

  ensureUI();
})();
