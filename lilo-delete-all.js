(function(){
  const STYLE_ID='vyra-lilo-delete-all-style-v1';
  const BUTTON_ID='vyra-delete-all-lilo';
  const EVENT_TYPES=new Set(['LOGIN','BREAK15','LUNCH30','RESUME','LOGOUT','WEEKDAY_OT','RESTDAY_OT']);
  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='.vyra-delete-all-lilo{margin-left:10px;background:#6f1b2b!important;color:#fff!important;border:1px solid #a34!important;border-radius:999px;padding:9px 13px;font-size:11px;font-weight:800;cursor:pointer}.vyra-delete-all-lilo:disabled{opacity:.55;cursor:wait}';
    document.head.appendChild(s);
  }
  async function deleteAll(){
    try{
      const name=String(emp||'').trim();
      if(!name)return alert('Please select an employee first.');
      const events=(Array.isArray(db?.events)?db.events:[]).filter(x=>String(x.employee||'').trim().toLowerCase()===name.toLowerCase() && x.id && EVENT_TYPES.has(String(x.type||'').trim().toUpperCase()));
      if(!events.length)return alert('There are no LILO login/time records to delete for '+name+'.');
      if(!confirm('Delete ALL LILO login/time details for '+name+'? This will also delete the associated records from the shared Attendance & Invoice Reference. EOD summaries will not be deleted.'))return;
      const btn=document.getElementById(BUTTON_ID);
      if(btn)btn.disabled=true;
      if(typeof setBusy==='function')setBusy(true);
      for(const x of events){
        await postData({action:'DELETE_EVENT',recordId:String(x.id)});
      }
      await syncData();
      alert('All LILO login/time details for '+name+' were deleted from the shared record.');
    }catch(e){
      alert('Some records could not be deleted: '+(e&&e.message?e.message:e));
      if(typeof setBusy==='function')setBusy(false);
    }
  }
  function install(){
    const title=document.getElementById('logTitle');
    if(!title)return false;
    if(document.getElementById(BUTTON_ID))return true;
    addStyle();
    const b=document.createElement('button');
    b.id=BUTTON_ID;
    b.type='button';
    b.className='vyra-delete-all-lilo';
    b.textContent='🗑 Delete All Login Details';
    b.onclick=deleteAll;
    title.appendChild(b);
    return true;
  }
  install();
  const timer=setInterval(function(){if(install())clearInterval(timer)},250);
})();
