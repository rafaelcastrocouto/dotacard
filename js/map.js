var map = {
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  build: function(opt){   
    var table = $('<table>').attr({'class':'map'});
    for(var h = 0; h < opt.height; h++){
      var tr = $('<tr>').appendTo(table);
      for(var w = 0; w < opt.width; w++){
        $('<td>').attr({'id': map.letters[w]+(h+1)}).appendTo(tr);
      }
    }
    return table;
  }
};

