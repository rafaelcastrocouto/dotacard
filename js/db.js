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
      console.log(e);
      alert('Error: No server connection, please try again later.');
    }
  });
};
