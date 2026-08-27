// V1.17.6 loader bridge — stable bootstrap + share sync + attendance/payroll + safe personnel detail drawer + social media tracking + staff-only attendance.
(function loadStableLayersV176(){
  const load=(flag,src,err)=>{if(document.querySelector(`script[${flag}]`))return;const s=document.createElement('script');s.src=src;s.setAttribute(flag,'1');s.onerror=()=>console.error(err);document.body.appendChild(s);};
  load('data-minds-v135-bootstrap','appx22.js?v=1351','V1.13.5 bootstrap module could not be loaded');
  load('data-minds-v136-target-actual','appx23.js?v=1360','V1.13.6 target/actual summary module could not be loaded');
  load('data-minds-v140-external-extras','appx24.js?v=1400','V1.14 weighted extra work module could not be loaded');
  load('data-minds-v138-carryover','appx25.js?v=1400','V1.14.0 carryover module could not be loaded');
  load('data-minds-v140-shoot-notes','appx26.js?v=1400','V1.14 shoot note module could not be loaded');
  load('data-minds-v142-performance-direct','appx28.js?v=1420','V1.14.2 direct performance recovery module could not be loaded');
  load('data-minds-v143-external-shoots','appx29.js?v=1430','V1.14.3 external shoot clients module could not be loaded');
  load('data-minds-v144-prepared-highlight','appx30.js?v=1440','V1.14.4 prepared column highlight module could not be loaded');
  load('data-minds-v150-agenda','appx31.js?v=1500','V1.15.0 agency agenda module could not be loaded');
  load('data-minds-v160-attendance-payroll','appx32.js?v=1600','V1.16.0 attendance/payroll module could not be loaded');
  load('data-minds-v161-my-account','appx33.js?v=1610','V1.16.1 account/password module could not be loaded');
  load('data-minds-v162-attendance-reference','appx34.js?v=1630','V1.16.3 premium attendance layout module could not be loaded');
  load('data-minds-v174-attendance-detail-drawer','appx36.js?v=1740','V1.17.4 attendance personnel detail drawer could not be loaded');
  load('data-minds-v168-firm-package-completion','appx38.js?v=1680','V1.16.8 firm package completion module could not be loaded');
  load('data-minds-v175-social-media-tracking','appx39.js?v=1750','V1.17.5 social media tracking module could not be loaded');
  load('data-minds-v176-attendance-staff-only','appx41.js?v=1760','V1.17.6 attendance staff-only module could not be loaded');
})();
