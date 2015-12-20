$(document).ready(function(){
  $("#sync-button").click(function(){
    $.post("/inventory/run",function(){
      alert("Inventory Sync added to Queue");
    });
  })
});
