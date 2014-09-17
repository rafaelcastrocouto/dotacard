var db = function(send, cb){
  $.ajax({
    type: "GET", 
    url: game.debug ? 'http://localhost/db' : 'http://ajaxdatabase.jsapp.us/', 
    data: send, 
    complete: function(receive){
      var data = {};
      if(receive.responseText) {
        data = JSON.parse(receive.responseText);
        console.log('XHR:', data);
        console.log('XHR:'+receive.responseText, data);
      }
      if(cb) cb(data || {});
    }
  });
};
