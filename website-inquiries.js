(()=>{
const API='https://ptzurrebwksuvuakgvym.supabase.co/functions/v1/website-inquiries-list';
const SUPA='https://ptzurrebwksuvuakgvym.supabase.co';
const KEY='sb_publishable_6Bkkj4-O_mw2YY9DGo3E2g_qnew4zZL';
let loadedIds=new Set();
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function ensurePanel(){
 const pipeline=document.getElementById('pipeline');if(!pipeline)return null;
 let panel=document.getElementById('websiteInquiryPanel');if(panel)return panel;
 panel=document.createElement('section');panel.id='websiteInquiryPanel';panel.className='panel';
 panel.innerHTML='<div style="display:flex;justify-content:space-between;gap:15px;align-items:center;flex-wrap:wrap"><div><span class="kicker">AUTOMATIC WEBSITE LEADS</span><h2 style="margin:6px 0">Website Inquiries</h2><p class="muted" style="margin:0">New inquiries from vyracollectives.org appear here automatically, newest first.</p></div><button class="btn secondary" id="refreshWebsiteInquiries">↻ Refresh Website Leads</button></div><div id="websiteInquiryList" style="display:grid;gap:10px;margin-top:18px"><div class="muted">Loading website inquiries…</div></div>';
 const records=[...pipeline.querySelectorAll('section.panel')].find(x=>x.querySelector('h2')?.textContent.trim()==='Lead Records');
 records?pipeline.insertBefore(panel,records):pipeline.appendChild(panel);
 panel.querySelector('#refreshWebsiteInquiries').onclick=load;
 return panel;
}
async function token(){try{const raw=localStorage.getItem('sb-ptzurrebwksuvuakgvym-auth-token');if(raw){const j=JSON.parse(raw);return j?.access_token||j?.currentSession?.access_token||''}}catch(e){}try{const keys=Object.keys(localStorage).filter(k=>k.includes('ptzurrebwksuvuakgvym')&&k.includes('auth-token'));for(const k of keys){const j=JSON.parse(localStorage.getItem(k)||'{}');if(j?.access_token)return j.access_token}}catch(e){}return ''}
async function load(){
 const panel=ensurePanel();if(!panel)return;const box=panel.querySelector('#websiteInquiryList');
 try{const t=await token();if(!t){box.innerHTML='<div class="muted">Website inquiries are available after employee authentication.</div>';return}
 const r=await fetch(API,{headers:{Authorization:'Bearer '+t,apikey:KEY},cache:'no-store'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Unable to load');const arr=j.inquiries||[];
 box.innerHTML=arr.length?arr.map(q=>`<article style="border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:14px;background:rgba(255,255,255,.04)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>${esc(q.full_name)}</b>${q.company?' · '+esc(q.company):''}<div class="muted" style="font-size:12px;margin-top:4px">${esc(q.email)}${q.website?' · '+esc(q.website):''}</div></div><span class="statuspill">NEW LEAD</span></div><div style="margin-top:9px;font-size:12px"><b>Service:</b> ${esc((q.services||[]).join(', ')||'Not specified')} ${q.budget?' · <b>Budget:</b> '+esc(q.budget):''}</div>${q.goals?'<div class="muted" style="margin-top:7px;font-size:12px">'+esc(q.goals)+'</div>':''}<div class="muted" style="font-size:10px;margin-top:8px">Website inquiry · ${new Date(q.created_at).toLocaleString()}</div></article>`).join(''):'<div class="muted">No website inquiries yet.</div>';
 }catch(e){box.innerHTML='<div style="color:#ffd4d4">Could not load website inquiries. '+esc(e.message)+'</div>'}
}
ensurePanel();load();setInterval(load,30000);window.addEventListener('focus',load);
})();