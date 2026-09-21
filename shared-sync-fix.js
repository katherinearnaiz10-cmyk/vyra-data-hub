(()=>{
  const SHARED_API='https://script.google.com/macros/s/AKfycby7uiz3bjf_G6phtNw0Bgu7t61Z7L0j05TBq1aKpqJfHiIQlaWUE-7Z3BoTn4YzeoH_qw/exec';
  let getSyncBusy=false;

  window.syncFromServer=async function(show){
    if(getSyncBusy)return;
    getSyncBusy=true;
    try{
      const sep=SHARED_API.includes('?')?'&':'?';
      const r=await fetch(SHARED_API+sep+'_='+Date.now(),{method:'GET',cache:'no-store',redirect:'follow'});
      const text=await r.text();
      let j;
      try{j=JSON.parse(text)}catch(e){throw new Error('Shared server returned an invalid response.');}
      if(!r.ok||j.ok===false||j.success===false)throw new Error(j.error||'Shared server error');
      if(!Array.isArray(j.leads))throw new Error('Shared server did not return a lead list.');
      leads=j.leads.map(normalize);
      saveLocal();
      render();
      refreshLeadSelectors();
      if(show)alert('Lead pipeline refreshed. '+leads.length+' shared leads loaded.');
    }catch(e){
      console.error('VYRA shared GET sync failed:',e);
      if(show)alert('Could not refresh the shared Lead Pipeline. Existing shared data was not changed.\n\n'+e.message);
    }finally{
      getSyncBusy=false;
    }
  };

  setTimeout(()=>window.syncFromServer(false),300);
})();