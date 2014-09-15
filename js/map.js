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
  paint: function(m, spot, radius, c, removeDiag, filter){
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
    });
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
  moveCard: function(card, target){
    if(typeof card == 'string') card = $('#'+card+' .card');
    card.closest('td').removeClass('block').addClass('free');
    if(typeof target == 'string') target = $('#'+target);
    card.addClass('moved').appendTo(target.removeClass('free').addClass('block'));
    states.table.unhighlightMove();
  }
};

