(()=>{
  const PAGE_SIZE=10;
  let page=1;
  let lastSignature='';

  function getRows(doc){
    const tbody=doc.getElementById('rows');
    if(!tbody)return null;
    return {tbody, rows:[...tbody.children]};
  }

  function ensureControls(doc,tbody){
    let box=doc.getElementById('leadPagination');
    if(box)return box;
    box=doc.createElement('div');
    box.id='leadPagination';
    box.style.cssText='display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap';
    box.innerHTML='<button type="button" class="btn secondary" id="leadPrev">Previous</button><span id="leadPageInfo" style="font-size:12px;color:#aeb9cf;font-weight:700"></span><button type="button" class="btn secondary" id="leadNext">Next</button>';
    const tableWrap=tbody.closest('.table');
    tableWrap?.insertAdjacentElement('afterend',box);
    box.querySelector('#leadPrev').onclick=()=>{page=Math.max(1,page-1);apply(doc,true)};
    box.querySelector('#leadNext').onclick=()=>{page++;apply(doc,true)};
    return box;
  }

  function apply(doc,scroll){
    const found=getRows(doc);if(!found)return;
    const {tbody,rows}=found;
    const sig=rows.map(r=>r.textContent).join('|');
    if(sig!==lastSignature){page=1;lastSignature=sig}
    const totalPages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
    page=Math.min(page,totalPages);
    rows.forEach((row,i)=>row.style.display=(i>=(page-1)*PAGE_SIZE&&i<page*PAGE_SIZE)?'':'none');
    const box=ensureControls(doc,tbody);
    const prev=box.querySelector('#leadPrev'),next=box.querySelector('#leadNext'),info=box.querySelector('#leadPageInfo');
    prev.disabled=page<=1;next.disabled=page>=totalPages;
    info.textContent=rows.length?`Page ${page} of ${totalPages} • ${rows.length} leads`:'No leads';
    box.style.display=rows.length>PAGE_SIZE?'flex':'none';
    if(scroll) tbody.closest('.panel')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function init(doc){
    const tbody=doc.getElementById('rows');if(!tbody)return false;
    const observer=new MutationObserver(()=>setTimeout(()=>apply(doc,false),0));
    observer.observe(tbody,{childList:true,subtree:false});
    ['search','fs','fa'].forEach(id=>doc.getElementById(id)?.addEventListener(id==='search'?'input':'change',()=>{page=1;setTimeout(()=>apply(doc,false),0)}));
    apply(doc,false);return true;
  }

  if(!init(document)){
    const timer=setInterval(()=>{if(init(document))clearInterval(timer)},300);
    setTimeout(()=>clearInterval(timer),10000);
  }
})();