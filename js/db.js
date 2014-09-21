var db = function(send, cb){
  if(send.data) send.data = JSON.stringify(send.data);
  $.ajax({
    type: "GET", 
    url: game.debug ? 'http://localhost/db' : 'http://ajaxdatabase.jsapp.us/', 
    data: send, 
    complete: function(receive){
      var data;
      if(receive.responseText) {
        data = JSON.parse(receive.responseText);
        console.log('XHR:', data);
      }
      if(cb) cb(data || {});
    }
  });
};
