var Map = {
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  build: function(opt){
    var table = $('<table>').attr({'class':'map'});
    
    for(var h = 0; h < opt.height; h++){
      var tr = $('<tr>').appendTo(table);
      for(var w = 0; w < opt.width; w++){
        var A1 = Map.letters[w]+(h+1);
        $('<td>').attr({'id': A1}).appendTo(tr);
      }
    }
    
    return table;
  },
  paint: function(m, spot, radius, c, removeDiag){
    var w = Map.letters.indexOf(spot[0]), h = parseInt(spot[1]);
    $('.map td').each(function(){
      var td = $(this), id = this.id;
      var tw = Map.letters.indexOf(id[0]), th = parseInt(id[1]);
      if(w > tw - radius && w < tw + radius){
        if(h > th - radius && h < th + radius){
          if(removeDiag) {
            if(Math.abs(w - tw) == (radius - 1) && Math.abs(h - th) == (radius - 1)){/*diag*/}
            else td.addClass(c);            
          }
          else td.addClass(c);
        }
      }
    });
  }
};

