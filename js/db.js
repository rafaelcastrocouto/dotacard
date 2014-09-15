var db = function(send, cb){
  $.ajax({
    type: "GET", 
    url: 'http://ajaxdatabase.jsapp.us/',//'http://localhost/db', 
    data: send, 
    complete: function(receive){    
      console.log('XHR:', receive.responseText);
      if(cb) cb(JSON.parse(receive.responseText));
    },
    error: function(e){
      alert('Connection error, sorry.');
      location.reload(true);
    }
  });
};
