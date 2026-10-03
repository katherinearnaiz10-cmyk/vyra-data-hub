(function(){
  const HUB_ID='hub';
  const INNER_ID='notes-delete-inner-loader';

  // Employee workspace loads this file in the outer document first.
  // Forward it into the actual Data Hub iframe once, then let the inner copy run.
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
          s.src='notes-delete.js?v=20261003-4';
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
  const STYLE=`
    .vyra-note-delete{display:inline-flex;align-items:center;gap:5px;margin-top:8px;border:1px solid #ff787873;background:#a014142e;color:#ffd4d4;border-radius:8px;padding:6px 9px;cursor:pointer;font-size:11px;font-weight:700}
    .vyra-note-delete:hover{background:#a0141455}
  `;

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=STYLE;
    document.head.appendChild(s);
  }

  function getCurrentLead(){
    try{
      if(typeof modalLead!=='undefined' && modalLead && Array.isArray(modalLead.activities))return modalLead;
    }catch(e){}
    try{
      if(typeof selectedLead!=='undefined' && selectedLead && Array.isArray(selectedLead.activities))return selectedLead;
    }catch(e){}
    try{
      if(typeof currentLead!=='undefined' && currentLead && Array.isArray(currentLead.activities))return currentLead;
    }catch(e){}
    return null;
  }

  function saveLead(lead){
    try{if(typeof saveLocal==='function')saveLocal();}catch(e){}
    try{if(typeof upsert==='function')return upsert(lead);}catch(e){}
    return null;
  }

  function decorate(container){
    if(!container)return;

    const lead=getCurrentLead();
    const activities=lead&&Array.isArray(lead.activities)?lead.activities:null;
    const events=[...container.querySelectorAll('.event')];

    events.forEach((event)=>{
      if(event.querySelector('.vyra-note-delete'))return;

      // Show a button for timeline entries. The click handler verifies that
      // the corresponding activity actually has notes before deleting.
      const b=document.createElement('button');
      b.type='button';
      b.className='vyra-note-delete';
      b.textContent='🗑 Delete Note';
      b.title='Delete only the note from this activity';

      b.onclick=async function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        const current=getCurrentLead();
        if(!current||!Array.isArray(current.activities)){
          alert('Please close and reopen the Activity Timeline, then try again.');
          return;
        }

        const activityList=current.activities;
        const eventText=(event.textContent||'').replace(/🗑\s*Delete Note/g,'').trim();

        // First try the timeline position, then fall back to matching the
        // visible note text so the button remains reliable if sorting changes.
        const eventIndex=events.indexOf(event);
        let activity=activityList[eventIndex];
        let activityIndex=eventIndex;

        if(!activity||!String(activity.notes||'').trim()){
          const match=activityList.findIndex(a=>{
            const note=String(a&&a.notes||'').trim();
            return note && eventText.includes(note);
          });
          if(match>=0){activityIndex=match;activity=activityList[match];}
        }

        if(!activity||!String(activity.notes||'').trim()){
          alert('There is no note attached to this activity.');
          return;
        }

        if(!confirm('Delete this note? The activity record will stay in the timeline.'))return;

        activity.notes='';

        try{
          const result=saveLead(current);
          if(result&&typeof result.then==='function')await result;
          if(typeof render==='function')render();
          if(typeof renderTimeline==='function')renderTimeline(current,container);
          if(typeof refreshLeadSelectors==='function')refreshLeadSelectors();
          // Re-run immediately so the remaining notes receive their buttons.
          setTimeout(decorate,50,container);
        }catch(e){
          alert('The note was cleared locally, but shared sync failed: '+(e.message||e));
        }
      };

      event.appendChild(b);
    });
  }

  function run(){
    addStyle();
    decorate(document.getElementById('modalTimeline'));
    decorate(document.getElementById('outTimeline'));
  }

  if(document.body){
    const obs=new MutationObserver(run);
    obs.observe(document.body,{childList:true,subtree:true});
  }
  setInterval(run,500);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
