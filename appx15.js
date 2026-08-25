// V1.12.1 compatibility shim for helpers used by appx14
(function teamDrilldownCompatV121(){try{if(typeof isAdmin==='function')window.isAdmin=isAdmin;if(typeof activeProfiles==='function')window.activeProfiles=activeProfiles;if(typeof monthWorks==='function')window.monthWorks=monthWorks;if(typeof monthShares==='function')window.monthShares=monthShares;if(typeof workFirmId==='function')window.workFirmId=workFirmId;if(typeof workReady==='function')window.workReady=workReady;if(typeof sumWorkQty==='function')window.sumWorkQty=sumWorkQty;if(typeof firm==='function')window.firm=firm;if(typeof firmLogo==='function')window.firmLogo=firmLogo;if(typeof escapeHtml==='function')window.escapeHtml=escapeHtml;if(typeof prettyMonth==='function')window.prettyMonth=prettyMonth;if(typeof formatDateTime==='function')window.formatDateTime=formatDateTime;if(typeof dateMonthISO==='function')window.dateMonthISO=dateMonthISO;}catch(e){console.warn('Team drilldown compatibility aliases',e);}})();

if(!document.querySelector('script[data-minds-v124-shoots]')){const s=document.createElement('script');s.src='appx17.js?v=1250';s.dataset.mindsV124Shoots='1';s.onerror=()=>console.error('V1.12.5 shared shoots module could not be loaded');document.body.appendChild(s);}

// V1.14 fair role-based automatic performance + Employee of the Month.
if(!document.querySelector('script[data-minds-v140-performance]')){const s=document.createElement('script');s.src='appx27.js?v=1401';s.dataset.mindsV140Performance='1';s.onerror=()=>console.error('V1.14 fair performance module could not be loaded');document.body.appendChild(s);}

// Safe August training/test marker; official awards start September 2026.
if(!document.querySelector('script[data-minds-v132-training]')){const s=document.createElement('script');s.src='appx19.js?v=1321';s.dataset.mindsV132Training='1';s.onerror=()=>console.error('Training month module could not be loaded');document.body.appendChild(s);}
