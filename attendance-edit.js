(function(){
  const STYLE_ID='vyra-attendance-edit-style-v1';
  const MODAL_ID='vyra-attendance-edit-modal';
  const API='https://script.google.com/macros/s/AKfycbxAClpCgEi-abCZFp4pvuWamDWP1-xNaXO7DAj_nUwTtIFVriureNUWx6FJ7Vu_Ay1c9A/exec';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function style(d){if(d.getElementById(STYLE_ID))return;const s=d.createElement('style');s.id=STYLE_ID;s.textContent='.vyra-edit-att{background:#e7c979!important;color:#07142e!important;border-color:#e7c979!important}.vyra-att-modal{position:fixed;inset:0;background:#000b;display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px}.vyra-att-box{width:min(720px,96vw);background:#081936;color:#fff;border:1px solid #ffffff2e;border-radius:20px;padding:24px;box-shadow:0 20px 70px #0009}.vyra-att-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.vyra-att-grid label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;color:#ccd6e8}.vyra-att-grid input{border:1px solid #ffffff24;background:#03102c;color:#fff;border-radius:10px;padding:11px}.vyra-att-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}@media(max-width:600px){.vyra-att-grid{grid-template-columns:1fr}}';d.head.appendChild(s)}
  function localDate(v){return String(v||'').slice(0,10)}
  function timeOnly(v){if(!v)return'';let d=new Date(v);if(!isNaN(d))return d.toLocaleTimeString('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit'});let m=String(v).match(/(\d{1,2}):(\d{2})/);return m?m[1].padStart(2,'0')+':'+m[2]:''}
  function getApiData(w){return w?.db||window.db||{events:[],eod:[]}}
  async function post(payload){let r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'}),txt=await r.text(),d;try{d=JSON.parse(txt)}catch(_){throw Error('Invalid response from shared database.')}if(!d.success)throw Error(d.error||'Shared database rejected the request.');return d}
  function openEditor(d,w,row){
    const cells=row.querySelectorAll('td');
    const date=cells[0]?.textContent.trim()||'';
    const employee=cells[1]?.textContent.trim()||'';
    const login=(cells[4]?.textContent.trim()||'').replace('—','');
    const logout=(cells[5]?.textContent.trim()||'').replace('—','');
    const wot=(cells[9]?.textContent.trim()||'').replace('h','');
    const rot=(cells[10]?.textContent.trim()||'').replace('h','');
    d.getElementById(MODAL_ID)?.remove();
    const m=d.createElement('div');m.id=MODAL_ID;m.className='vyra-att-modal';
    m.innerHTML='<div class="vyra-att-box"><h2 style="margin-top:0">Edit Attendance</h2><p style="color:#aeb9cf;margin-top:-4px">'+esc(employee)+' • '+esc(date)+'</p><div class="vyra-att-grid"><label>Date<input id="va-date" type="date" value="'+esc(localDate(date))+'"></label><label>Employee<input id="va-emp" value="'+esc(employee)+'" readonly></label><label>Login Time<input id="va-login" type="time" value="'+esc(timeOnly(login))+'"></label><label>Logout Time<input id="va-logout" type="time" value="'+esc(timeOnly(logout))+'"></label><label>Weekday OT (hours)<input id="va-wot" type="number" min="0" step="0.25" value="'+esc(wot||'0')+'"></label><label>Rest Day OT (hours)<input id="va-rot" type="number" min="0" step="0.25" value="'+esc(rot||'0')+'"></label></div><div class="vyra-att-actions"><button class="btn secondary" id="va-cancel">Cancel</button><button class="btn" id="va-save">Save Attendance</button></div></div>';
    d.body.appendChild(m);
    d.getElementById('va-cancel').onclick=()=>m.remove();
    d.getElementById('va-save').onclick=async()=>{
      const payload={action:'SAVE_ATTENDANCE',employee:d.getElementById('va-emp').value.trim(),date:d.getElementById('va-date').value,login:d.getElementById('va-login').value,logout:d.getElementById('va-logout').value,weekdayOT:Number(d.getElementById('va-wot').value||0),restDayOT:Number(d.getElementById('va-rot').value||0)};
      if(!payload.date)return alert('Please select a date.');
      if(!payload.login&&!payload.logout&&!payload.weekdayOT&&!payload.restDayOT)return alert('Add at least one attendance detail.');
      const b=d.getElementById('va-save');b.disabled=true;b.textContent='Saving...';
      try{
        await post(payload);
        m.remove();
        if(typeof w.syncData==='function')await w.syncData();
        else if(typeof window.syncData==='function')await window.syncData();
        alert('Attendance saved to the shared record.');
      }catch(e){b.disabled=false;b.textContent='Save Attendance';alert('Attendance was NOT saved: '+e.message)}
    };
  }
  function install(d,w){
    const rows=d.getElementById('attendanceRows');if(!rows)return false;
    style(d);
    rows.querySelectorAll('tr').forEach(row=>{
      const cells=row.querySelectorAll('td');if(cells.length<13)return;
      const action=cells[12];
      if(!action.querySelector('.vyra-edit-att')){
        const b=d.createElement('button');b.type='button';b.className='btn mini vyra-edit-att';b.textContent='Edit';b.onclick=()=>openEditor(d,w,row);action.prepend(b);action.appendChild(d.createTextNode(' '));
      }
    });
    return true;
  }
  function run(){try{const d=document,w=window;if(!d.getElementById('attendanceRows'))return;install(d,w)}catch(e){}}
  run();setInterval(run,700);
})();
