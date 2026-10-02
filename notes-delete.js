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
          s.src='notes-delete.js?v=20261003-2';
          d.body.appendChild(s);
        }catch(e){}
      };
      hub.addEventListener('load',install);
      install();
      return true;
    }catch(e){return false}
  }

  if(loadInsideHub())return;

  const STYLE_ID='vyra-note-delete-style';
  const STYLE=`.vyra-note-delete{margin-top:8px;border:1px solid #ff787873;background:#a014142e;color:#ffd4d4;border-radius:8px;padding:6px 9px;cursor:pointer;font-size:11px;font-weight:700}.vyra-note-delete:hover{background:#a0141455}`;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=STYLE;
    document.head.appendChild(s);
  }

  function decorate(container,getLead){
    if(!container)return;
    const l=getLead();
    if(!l||!Array.isArray(l.activities))return;
    const events=[...container.querySelectorAll('.event')];
    events.forEach((event,i)=>{
      if(event.querySelector('.vyra-note-delete'))return;
      const activity=l.activities[i];
      if(!activity||!String(activity.notes||'').trim())return;
      const b=document.createElement('button');
      b.type='button';
      b.className='vyra-note-delete';
      b.textContent='🗑 Delete Note';
      b.onclick=async function(ev){
        ev.stopPropagation();
        if(!confirm('Delete this note? This will remove it for the whole team.'))return;
        const current=getLead();
        if(!current||!current.activities||!current.activities[i])return;
        current.activities.splice(i,1);
        try{
          if(typeof saveLocal==='function')saveLocal();
          if(typeof render==='function')render();
          if(typeof upsert==='function')await upsert(current);
          if(typeof renderTimeline==='function')renderTimeline(current,container);
          if(typeof refreshLeadSelectors==='function')refreshLeadSelectors();
        }catch(e){
          alert('Note was removed locally, but shared sync failed: '+(e.message||e));
        }
      };
      event.appendChild(b);
    });
  }

  function run(){
    addStyle();
    decorate(document.getElementById('modalTimeline'),()=>typeof modalLead!=='undefined'?modalLead:null);
    decorate(document.getElementById('outTimeline'),()=>{
      try{return typeof lead==='function'?lead(document.getElementById('outLead')?.value):null}catch{return null}
    });
  }

  const obs=new MutationObserver(run);
  obs.observe(document.body,{childList:true,subtree:true});
  setInterval(run,500);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();