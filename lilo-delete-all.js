(function(){
  const STYLE_ID='vyra-lilo-tools-style-v2';
  const BUTTON_ID='vyra-delete-all-lilo';
  const EVENT_TYPES=new Set(['LOGIN','BREAK15','LUNCH30','RESUME','LOGOUT','WEEKDAY_OT','RESTDAY_OT']);
  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent='.vyra-delete-all-lilo{margin-left:10px;background:#6f1b2b!important;color:#fff!important;border:1px solid #a34!important;border-radius:999px;padding:9px 13px;font-size:11px;font-weight:800;cursor:pointer}.vyra-edit-day{background:#e7c979!important;color:#07142e!important;border:1px solid #e7c979!important;border-radius:999px;padding:7px 11px;font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap}.vyra-delete-all-lilo:disabled,.vyra-edit-day:disabled{opacity:.55;cursor:wait}.vyra-edit-wrap{display:flex;gap:6px;flex-wrap:wrap}.vyra-edit-box{position:fixed;inset:0;z-index:99999;background:#0009;display:flex;align-items:center;justify-content:center;padding:20px}.vyra-edit-card{width:min(560px,100%);background:#081936;color:#fff;border:1px solid #ffffff24;border-radius:20px;padding:24px;box-shadow:0 20px 70px #000b}.vyra-edit-card h3{margin:0 0 16px}.vyra-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.vyra-edit-grid label{display:flex;flex-direction:column;gap:6px;font-size:10px;font-weight:800;color:#ccd6e8;text-transform:uppercase}.vyra-edit-grid input{border:1px solid #ffffff24;background:#03102c;color:#fff;border-radius:10px;padding:11px;font:inherit}.vyra-edit-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}.vyra-edit-actions button{border-radius:999px;padding:10px 15px;font-weight:800;cursor:pointer;border:1px solid #ffffff24}.vyra-save-edit{background:#e7c979;color:#07142e}.vyra-cancel-edit{background:#ffffff12;color:#fff}';
    document.head.appendChild(s);
  }
  async function deleteAll(){
    try{
      const name=String(emp||'').trim();
      if(!name)return alert('Please select an employee first.');
      const events=(Array.isArray(db?.events)?db.events:[]).filter(x=>String(x.employee||'').trim().toLowerCase()===name.toLowerCase()&&x.id&&EVENT_TYPES.has(String(x.type||'').trim().toUpperCase()));
      if(!events.length)return alert('There are no LILO login/time records to delete for '+name+'.');
      if(!confirm('Delete ALL LILO login/time details for '+name+'? This will also delete the associated records from the shared Attendance & Invoice Reference. EOD summaries will not be deleted.'))return;
      const btn=document.getElementById(BUTTON_ID);if(btn)btn.disabled=true;if(typeof setBusy==='function')setBusy(true);
      for(const x of events)await postData({action:'DELETE_EVENT',recordId:String(x.id)});
      await syncData();alert('All LILO login/time details for '+name+' were deleted from the shared record.');
    }catch(e){alert('Some records could not be deleted: '+(e&&e.message?e.message:e));if(typeof setBusy==='function')setBusy(false)}
  }
  function dayEvents(name,date){return(Array.isArray(db?.events)?db.events:[]).filter(x=>String(x.employee||'').trim().toLowerCase()===String(name||'').trim().toLowerCase()&&String(x.date||'').slice(0,10)===date&&EVENT_TYPES.has(String(x.type||'').trim().toUpperCase())).sort((a,b)=>new Date(a.at)-new Date(b.at))}
  function localTime(v){if(!v)return'';const d=new Date(v);if(isNaN(d))return'';return d.toLocaleTimeString('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit'});}
  function toIso(date,time){if(!date||!time)return null;const [y,m,d]=date.split('-').map(Number),[hh,mm]=time.split(':').map(Number);return new Date(Date.UTC(y,m-1,d,hh-8,mm,0)).toISOString();}
  function openEdit(name,date){
    const events=dayEvents(name,date);if(!events.length)return alert('No saved LILO records found for this date.');
    const login=events.find(x=>String(x.type).toUpperCase()==='LOGIN'),logout=events.find(x=>String(x.type).toUpperCase()==='LOGOUT');
    const wot=events.find(x=>String(x.type).toUpperCase()==='WEEKDAY_OT'),rot=events.find(x=>String(x.type).toUpperCase()==='RESTDAY_OT');
    const box=document.createElement('div');box.className='vyra-edit-box';box.innerHTML='<div class="vyra-edit-card"><h3>Edit Attendance — '+escText(name)+'</h3><div class="vyra-edit-grid"><label>Date<input id="vyraEdDate" type="date" value="'+escText(date)+'"></label><label>Login<input id="vyraEdLogin" type="time" value="'+escText(localTime(login?.at))+'"></label><label>Logout<input id="vyraEdLogout" type="time" value="'+escText(localTime(logout?.at))+'"></label><label>Weekday OT (hours)<input id="vyraEdWot" type="number" min="0" step="0.25" value="'+(wot?.hours||0)+'"></label><label>Rest Day OT (hours)<input id="vyraEdRot" type="number" min="0" step="0.25" value="'+(rot?.hours||0)+'"></label></div><div class="vyra-edit-actions"><button class="vyra-cancel-edit">Cancel</button><button class="vyra-save-edit">Save Changes</button></div></div>';
    document.body.appendChild(box);box.querySelector('.vyra-cancel-edit').onclick=()=>box.remove();box.addEventListener('click',e=>{if(e.target===box)box.remove()});
    box.querySelector('.vyra-save-edit').onclick=async()=>{
      const newDate=box.querySelector('#vyraEdDate').value,newLogin=box.querySelector('#vyraEdLogin').value,newLogout=box.querySelector('#vyraEdLogout').value,wot=Number(box.querySelector('#vyraEdWot').value)||0,rot=Number(box.querySelector('#vyraEdRot').value)||0;
      if(!newDate)return alert('Please select a date.');
      const save=box.querySelector('.vyra-save-edit');save.disabled=true;
      try{
        if(typeof setBusy==='function')setBusy(true);
        await postData({action:'UPDATE_DAY',employee:name,oldDate:date,newDate:newDate,loginAt:toIso(newDate,newLogin),logoutAt:toIso(newDate,newLogout),weekdayOT:wot,restDayOT:rot});
        box.remove();await syncData();alert('Attendance changes saved to the shared record and refreshed in the portal.');
      }catch(e){save.disabled=false;if(typeof setBusy==='function')setBusy(false);alert('The edit was NOT saved: '+(e&&e.message?e.message:e));}
    };
  }
  function escText(v){return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function installEditButtons(){
    const table=document.getElementById('attendanceRows');if(!table)return;
    [...table.querySelectorAll('tr')].forEach(row=>{
      const cells=row.querySelectorAll('td');if(cells.length<13)return;
      const date=(cells[0].textContent||'').trim(),name=(cells[1].textContent||'').trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!name)return;
      let actionCell=cells[12];if(actionCell.querySelector('.vyra-edit-day'))return;
      const wrap=document.createElement('div');wrap.className='vyra-edit-wrap';
      const b=document.createElement('button');b.type='button';b.className='vyra-edit-day';b.textContent='Edit';b.onclick=()=>openEdit(name,date);wrap.appendChild(b);actionCell.appendChild(wrap);
    });
  }
  function install(){
    addStyle();
    const title=document.getElementById('logTitle');
    if(title&&!document.getElementById(BUTTON_ID)){
      const b=document.createElement('button');b.id=BUTTON_ID;b.type='button';b.className='vyra-delete-all-lilo';b.textContent='🗑 Delete All Login Details';b.onclick=deleteAll;title.appendChild(b);
    }
    installEditButtons();return !!title;
  }
  install();
  const timer=setInterval(install,400);
  setTimeout(()=>clearInterval(timer),30000);
})();
