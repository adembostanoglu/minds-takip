// V1.18.5 — Personel mesaisini tamamladığında Bugünkü Durum kartında görünür tamamlandı alanı gösterir.
(function bootAttendanceCompletedStateV185(){
  if(window.__mindsAttendanceCompletedStateV185)return;
  window.__mindsAttendanceCompletedStateV185=true;

  function installStyles(){
    if(document.getElementById('attendanceCompletedV185Style'))return;
    const s=document.createElement('style');
    s.id='attendanceCompletedV185Style';
    s.textContent=`
      .att-completed-v185{display:flex;align-items:center;gap:10px;margin-top:15px;padding:11px 13px;border:1px solid #315d38;border-radius:10px;background:linear-gradient(145deg,#17321d,#101d14);color:#a6df91;font-size:11px;font-weight:850;line-height:1.35}
      .att-completed-v185 .check{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;flex:0 0 24px;background:#244c2b;border:1px solid #41784a;color:#b7eba4;font-size:14px}
      .att-completed-v185 small{display:block;margin-top:2px;color:#779b78;font-size:8.5px;font-weight:600}
    `;
    document.head.appendChild(s);
  }

  function patch(){
    installStyles();
    const attendance=document.getElementById('attendance');
    if(!attendance?.classList.contains('active-view'))return;
    const root=document.getElementById('attendanceRootV160');if(!root)return;
    const cards=[...root.querySelectorAll('.att-clock-card-v160')];
    const card=cards.find(c=>c.querySelector('h3')?.textContent?.trim()==='Bugünkü Durum');
    if(!card)return;

    const status=card.querySelector('.att-clock-status-v160')?.textContent?.trim()||'';
    let done=card.querySelector('.att-completed-v185');
    const completed=status==='Çıkış Yapıldı';

    if(!completed){done?.remove();return;}
    if(done)return;

    done=document.createElement('div');
    done.className='att-completed-v185';
    done.innerHTML='<span class="check">✓</span><div>Bugünkü mesai tamamlandı<small>Yeni giriş butonu bir sonraki çalışma gününde otomatik görünür.</small></div>';
    card.appendChild(done);
  }

  function schedule(){[40,160,420].forEach(ms=>setTimeout(patch,ms));}
  document.addEventListener('click',e=>{
    if(e.target.closest('.nav-item[data-view="attendance"],#attClockInV160,#attFieldInV160,#attClockOutV160,#attToggleModeV160'))schedule();
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker'))schedule();},true);
  window.addEventListener('load',schedule);
  setInterval(patch,1200);
  schedule();
})();
