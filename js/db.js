var db = function(send, cb){
  $.ajax({
    type: "GET", 
    url: 'http://ajaxdatabase.jsapp.us/',//'http://localhost/db', 
    data: send, 
    complete: function(receive){
      var data = {};
      if(receive.responseText) {
        data = JSON.parse(receive.responseText);
        console.log('XHR:', data);
      }
      if(cb) cb(data);
    }
  });
};
