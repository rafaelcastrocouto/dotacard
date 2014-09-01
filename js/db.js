var db = function(send, cb){
  $.ajax({
    type: "GET", 
    url: 'http://localhost:8080/',//'http://ajaxdatabase.jsapp.us/', 
    data: send, 
    complete: function(receive){    console.log('XHR:', receive.responseText);
      if(cb) cb(JSON.parse(receive.responseText));
    }
  });
};
