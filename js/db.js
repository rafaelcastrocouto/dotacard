var db = function(send, cb){
  $.ajax({
    type: "GET", 
    url: 'http://ajaxdatabase.jsapp.us/', //http://localhost:8080/
    data: send, 
    complete: function(receive){    //console.log(receive);
      if(cb) cb(receive.responseJSON);
    }
  });
};
