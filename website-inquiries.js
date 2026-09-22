(()=>{
const API='https://ptzurrebwksuvuakgvym.supabase.co/functions/v1/website-inquiries-list';
const KEY='sb_publishable_6Bkkj4-O_mw2YY9DGo3E2g_qnew4zZL';let busy=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function token(){try{for(const k of Object.keys(localStorage)){if(k.includes('ptzurrebwksuvuakgvym')&&k.includes('auth-token')){const j=JSON.parse(localStorage.getItem(k)||'{}');const t=j?.access_token||j?.currentSession?.access_token;if(t)return t}}}catch(e){}return ''}
function nextId(){const nums=(window.leads||leads||[]).map(l=>String(l.id||'').match(/^VYRA-(\d+)$/i)).filter(Boolean).map(m=>+m[1]);return 'VYRA-'+String((nums.length?Math.max(...nums):0)+1).padStart(4,'0')}
function service(q){const s=(q.services||[]).filter(Boolean);return s.length===1?s[0]:(s.length>1?'Multiple Services':'Other')}
function notify(q){let box=document.getElementById('websiteLeadNotice');if(!box){box=document.createElement('div');box.id='websiteLeadNotice';box.style.cssText='position:fixed;right:22px;top:22px;z-index:99999;max-width:390px;background:#e7c979;color:#07142e;border-radius:16px;padding:16px 18px;box-shadow:0 18px 55px #0008;font:700 13px Arial';document.body.appendChild(box)}box.innerHTML='✦ <b>NEW WEBSITE INQUIRY</b><br><span style="font-weight:500">'+esc(q.full_name)+(q.company?' · '+esc(q.company):'')+' was automatically added to Lead Records.</span>';box.onclick=()=>box.remove();setTimeout(()=>box?.remove(),9000)}
async function mark(id,t){await fetch(API,{method:'POST',headers:{Authorization:'Bearer '+t,apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({id})})}
async function load(){if(busy)return;busy=true;try{const t=token();if(!t)return;const r=await fetch(API,{headers:{Authorization:'Bearer '+t,apikey:KEY},cache:'no-store'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Unable to load inquiries');const pending=(j.inquiries||[]).filter(q=>!q.pipeline_added);if(!pending.length)return;
 if(typeof window.syncFromServer==='function')await window.syncFromServer(false);
 for(const q of pending.slice().reverse()){
   const duplicate=(window.leads||leads||[]).find(l=>String(l.email||'').toLowerCase()===String(q.email||'').toLowerCase()&&String(l.source||'').toLowerCase()==='website');
   if(duplicate){await mark(q.id,t);continue}
   const note=['Website inquiry received',q.website?'Website: '+q.website:'',q.budget?'Budget: '+q.budget:'',q.goals?'Goals / Message: '+q.goals:''].filter(Boolean).join(' | ');
   const l=normalize({id:nextId(),name:q.full_name||'',business:q.company||'',email:q.email||'',phone:'',facebook:'',instagram:'',country:'',service:service(q),source:'Website',status:'New Lead',assigned:'',last:new Date(q.created_at).toISOString().slice(0,10),next:'',activities:[{at:q.created_at||new Date().toISOString(),by:'VYRA Website',type:'Website Inquiry',result:'New Lead',notes:note}]});
   await upsert(l);leads.unshift(l);saveLocal();await mark(q.id,t);notify(q);
 }
 if(typeof window.syncFromServer==='function')await window.syncFromServer(false);else{render();refreshLeadSelectors()}
 }catch(e){console.error('Website inquiry auto-import failed:',e)}finally{busy=false}}
load();setInterval(load,10000);window.addEventListener('focus',load);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
})();