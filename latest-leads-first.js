(()=>{
  function leadNumber(lead){
    const raw=String((lead&&lead.id)||'');
    const matches=raw.match(/\d+/g);
    return matches&&matches.length ? Number(matches[matches.length-1]) : 0;
  }
  function sortLatestFirst(){
    if(Array.isArray(window.leads)){
      window.leads.sort((a,b)=>leadNumber(b)-leadNumber(a));
    }
  }
  function install(){
    if(typeof window.render!=='function') return false;
    if(window.render.__latestFirst) return true;
    const originalRender=window.render;
    const wrapped=function(){
      sortLatestFirst();
      return originalRender.apply(this,arguments);
    };
    wrapped.__latestFirst=true;
    window.render=wrapped;
    sortLatestFirst();
    window.render();
    return true;
  }
  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},100);
    setTimeout(()=>clearInterval(timer),10000);
  }
})();