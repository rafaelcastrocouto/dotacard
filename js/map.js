var Map = {
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  build: function(opt){
    var table = $('<table>').attr({'class':'map'});
    
    for(var h = 0; h < opt.height; h++){
      var tr = $('<tr>').appendTo(table);
      for(var w = 0; w < opt.width; w++){
        var A1 = Map.letters[w]+(h+1);
        $('<td>').attr({'id': A1}).addClass('free').appendTo(tr);
      }
    }
    
    return table;
  },
  neightbors: function(spot, radius, cb, removeDiag, filter){
    var fil = function(td){
       if(filter) {
         if(!td.hasClass(filter)) cb(td);
       }
       else cb(td);
    };
    var w = Map.letters.indexOf(spot[0]), h = parseInt(spot[1]);
    $('.map td').each(function(){
      var td = $(this), id = this.id;
      var tw = Map.letters.indexOf(id[0]), th = parseInt(id[1]);
      if(w > tw - radius && w < tw + radius){
        if(h > th - radius && h < th + radius){
          if(removeDiag) {
            if(Math.abs(w - tw) == (radius - 1) && Math.abs(h - th) == (radius - 1)){/*diag*/}
            else fil(td);     
          }
          else fil(td);
        }
      }
    });
  },
  paint: function(spot, radius, c, removeDiag, filter){
    var fil = function(td){
       if(filter) {
         if(!td.hasClass(filter)) td.addClass(c);
       }
       else td.addClass(c);
    };
    var w = Map.letters.indexOf(spot[0]), h = parseInt(spot[1]);
    $('.map td').each(function(){
      var td = $(this), id = this.id;
      var tw = Map.letters.indexOf(id[0]), th = parseInt(id[1]);
      if(w > tw - radius && w < tw + radius){
        if(h > th - radius && h < th + radius){
          if(removeDiag) {
            if(Math.abs(w - tw) == (radius - 1) && Math.abs(h - th) == (radius - 1)){/*diag*/}
            else fil(td);     
          }
          else fil(td);
        }
      }
    }).on('contextmenu',function(){return false});
  },
  getPosition: function(el){
    var p = el.closest('td').attr('id');
    return p;
  },
  mirrorPosition: function(spot, map){
    var w = Map.letters.indexOf(spot[0]) + 1, h = parseInt(spot[1]);
    if(map) var mh = map.find('tr').length, mw = map.find('td').length / mh;    
    else var mh = game.height + 1, mw = game.width;    
    var nw = mw - w, nh = mh - h;
    return Map.letters[nw] + nh;
  },
  placeCard: function(card, target){
    if(typeof target == 'string') target = $('#'+target);
    card.appendTo(target.removeClass('free').addClass('block'));
  },
  moveCard: function(card, spot){
    if(typeof card == 'string') card = $('#'+card+' .card');
    card.closest('td').removeClass('block').addClass('free');
    if(typeof spot == 'string') spot = $('#'+spot);
    spot.removeClass('free').addClass('block');    
    Map.unhighlight();   

    var data = {
      target: card,
      destiny: spot
    };
        
    var target = card.offset();
    var destiny = spot.offset();
    
    card.css({top: destiny.top - target.top - 108, left: destiny.left - target.left - 18});
    
    setTimeout(function(){    
      $(this.target).css({top: '', left: ''}).appendTo(this.destiny);
    }.bind(data), 1000);  
  },
  highlightMove: function(card){
    if(card.hasClass('player') && !card.hasClass('done') && !card.hasClass('static')){        
      var spot = Map.getPosition(card);
      Map.paint(spot, 2, 'moveArea', false, 'block');      
      $('.moveArea').on('contextmenu.move', states.table.move);
    }
  },
  highlightAttack: function(card){
    if(card.hasClass('player') && !card.hasClass('done') && !card.hasClass('static')){        
      var spot = Map.getPosition(card);
      var att = card.data('card').attackType;
      var range;
      if(att == 'Melee') range = 2;
      if(att == 'Ranged') range = 3;      
      Map.neightbors(spot, range, function(neighbor){
        var card = $('.card', neighbor);
        if(card.hasClass('enemy')) card.addClass('target').on('contextmenu.attack', states.table.attack);        
      }, false, 'free');
    }
  },
  unhighlight: function(){
    $('.map .card').removeClass('target');
    $('.map td').off('contextmenu.move').off('contextmenu.attack').removeClass('moveArea');
  },
};

