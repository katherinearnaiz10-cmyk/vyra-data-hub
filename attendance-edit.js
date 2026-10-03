(function(){
  // Cleanup only: the portal's native Edit button is the working editor.
  // Remove the duplicate yellow button previously injected by this helper.
  const REMOVE_CLASS='vyra-edit-att';
  function clean(){try{
    document.querySelectorAll('.'+REMOVE_CLASS).forEach(b=>b.remove());
  }catch(e){}}
  clean();
  setInterval(clean,700);
})();
