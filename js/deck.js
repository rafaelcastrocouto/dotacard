var deck = function(name, cb){  
  var d = {};  
  $.ajax({
    type: "GET", 
    url: 'json/'+name+'.json',
    complete: function(response){
      var data = JSON.parse(response.responseText);
      var el = $('<div>').attr('id', name).addClass('deck');
      var cards = {};
      var count = 0;
      
      $.each(data, function(id, type){ 
        type.id = id;
        cards[id] = card(type);
        cards[id].el.appendTo(el);
        count++;
      });
      d.el = el;
      d.cards = cards;
      d.length = count;
      cb(d); 
    }
  });
  return d;
};

