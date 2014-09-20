var Map = {
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  build: function(opt){
    var table = $('<table>').attr({'class':'map'});

    for(var h = 0; h < opt.height; h++){
      var tr = $('<tr>').appendTo(table);
      for(var w = 0; w < opt.width; w++){
        var L1 = Map.letters[w]+(h+1);
        $('<td>').attr({'id': L1}).addClass('free').appendTo(tr).on('contextmenu',function(){
          return false
        });
      }
    }

    return table;
  },
  neightbors: function(spot, radius, cb, removeDiag, filter){
    if(radius == 0) return;
    var fil = function(td){      
      if(filter) {
        if(!td.hasClasses(filter)) cb(td);
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
    if(radius == 0) return;
    var fil = function(td){
      if(filter) {
        if(!td.hasClasses(filter)) td.addClass(c);
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
  stroke: function(spot, radius, c, removeDiag, filter){ 
    if(radius == 0) return;
    var fil = function(id, b){
      var td = $('#'+id);   
      if(filter) {
        if(!td.hasClasses(filter)) td.addClass(c+' '+b);
      }
      else td.addClass(c+' '+b);
    };
    var w = Map.letters.indexOf(spot[0]), h = parseInt(spot[1]);

    var d = (radius - 1);
    var sideLength = (2 * d) - 1;
    var diag = removeDiag ? 'out' : 'in';
    
    var topLeft = Map.letters[(w - d)] + (h - d);
    fil(topLeft, 'topLeft'+diag);   
    var topRight = Map.letters[(w + d)] + (h - d);
    fil(topRight, 'topRight'+diag);    
    var bottomLeft = Map.letters[(w - d)] + (h + d);
    fil(bottomLeft, 'bottomLeft'+diag);   
    var bottomRight = Map.letters[(w + d)] + (h + d);
    fil(bottomRight, 'bottomRight'+diag);

    var startHeight = h - d + 1;
    for(var i=startHeight; i<(startHeight + sideLength); i++){
      var left = Map.letters[(w - d)] + i;
      fil(left, 'left');
      var right = Map.letters[(w + d)] + i;      
      fil(right, 'right');
    }

    var startWidth = w - d + 1;
    for(var i=startWidth; i<(startWidth + sideLength); i++){
      var top = Map.letters[i] + (h - d);
      fil(top, 'top');
      var bottom = Map.letters[i] + (h + d);      
      fil(bottom, 'bottom');
    }        

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
  highlight: function(){
    if(game.status == 'turn' && game.selectedCard){
      game.selectedCard.highlightMove();
      game.selectedCard.highlightAttack();       
    }
  },
  unhighlight: function(){
    $('.map .card').removeClass('target');
    $('.map td').off('contextmenu.move contextmenu.attack')
    .removeClass('movearea attackarea top bottom left right topLeftin topLeftout topRightin topRightout bottomLeftin bottomLeftout bottomRightin bottomRightout');
  },
};

$.fn.hasClasses = function(list) {
  var classes = list.split(' ');
  for (var i = 0; i < classes.length; i++) {
    if (this.hasClass(classes[i])) {
      return true;
    }
  }
  return false;
};

