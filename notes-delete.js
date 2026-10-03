(function(){
  const HUB_ID='hub';
  const INNER_ID='notes-delete-inner-loader';

  function loadInsideHub(){
    try{
      const hub=document.getElementById(HUB_ID);
      if(!hub)return false;
      const install=function(){
        try{
          const d=hub.contentDocument;
          if(!d||!d.body)return;
          if(d.getElementById(INNER_ID))return;
          const s=d.createElement('script');
          s.id=INNER_ID;
          s.src='notes-delete.js?v=20261003-6';
          d.body.appendChild(s);
        }catch(e){}
      };
      hub.addEventListener('load',install);
      install();
      return true;
    }catch(e){return false}
  }

  if(loadInsideHub())return;

  const STYLE_ID='vyra-note-delete-style-v6';
  const STYLE='.vyra-note-delete{display:inline-flex;align-items:center;gap:5px;margin-top:8px;border:1px solid #ff787873;background:#a014142e;color:#ffd4d4;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:11px;font-weight:800}.vyra-note-delete:hover{background:#a0141455}.vyra-note-delete:disabled{opacity:.55;cursor:wait}';

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=STYLE;
    document.head.appendChild(s);
  }

  function getLead(){
    try{
      if(typeof modalLead!=='undefined'){
        if(typeof modalLead==='string'&&typeof lead==='function')return lead(modalLead);
        if(modalLead&&Array.isArray(modalLead.activities))return modalLead;
      }
    }catch(e){}
    try{
      if(typeof selectedLead!=='undefined'&&selectedLead&&Array.isArray(selectedLead.activities))return selectedLead;
    }catch(e){}
    try{
      if(typeof currentLead!=='undefined'&&currentLead&&Array.isArray(currentLead.activities))return currentLead;
    }catch(e){}
    return null;
  }

  function installRenderHook(){
    if(typeof window.renderTimeline!=='function')return false;
    if(window.__vyraNoteDeleteRenderHookV6)return true;

    window.renderTimeline=function(l,target){
      if(!target)return;
      const activities=Array.isArray(l&&l.activities)?l.activities:[];
      if(!activities.length){
        target.innerHTML='<span class="muted">No activity yet.</span>';
        return;
      }

      target.innerHTML=activities.map(function(a,i){
        const note=String(a&&a.notes||'').trim();
        return '<div class="event" data-vyra-activity-index="'+i+'">'
          +'<div class="eventtop">'+esc(a.type)+' • '+esc(a.result)+'</div>'
          +'<div class="eventmeta">'+esc(a.by)+' • '+fmt(a.at)+'</div>'
          +(note?'<div class="vyra-note-content"><div>'+esc(note)+'</div><button type="button" class="vyra-note-delete" data-vyra-note-index="'+i+'">🗑 Delete</button></div>':'')
          +'</div>';
      }).join('');

      target.querySelectorAll('[data-vyra-note-index]').forEach(function(btn){
        btn.addEventListener('click',async function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          const index=Number(btn.getAttribute('data-vyra-note-index'));
          const current=getLead()||l;
          if(!current||!Array.isArray(current.activities)||!current.activities[index]){
            return;
          }

          // Delete the entire activity item immediately when the button is clicked.
          btn.disabled=true;
          const removed=current.activities.splice(index,1)[0];
          try{
            if(typeof saveLocal==='function')saveLocal();
            if(typeof upsert==='function')await upsert(current);
            if(typeof render==='function')render();
            window.renderTimeline(current,target);
            if(typeof refreshLeadSelectors==='function')refreshLeadSelectors();
          }catch(e){
            current.activities.splice(index,0,removed);
            if(typeof saveLocal==='function')saveLocal();
            window.renderTimeline(current,target);
            alert('The activity could not be deleted from the shared record: '+(e.message||e));
          }
        });
      });
    };

    window.__vyraNoteDeleteRenderHookV6=true;
    return true;
  }

  function boot(){
    addStyle();
    installRenderHook();
  }

  boot();
  const timer=setInterval(function(){if(installRenderHook())clearInterval(timer)},100);
})();