//        0     1       2       3         4          5           6          7           8
// range:            Melee /  Short  / Ranged  /   Long  
// speed:    Slow / Normal /  Fast                                          ▒          ▒▒▒
//                                                   ▒          ▒▒▒       ▒▒▒▒▒       ▒▒▒▒▒
//                              ▒        ▒▒▒       ▒▒░▒▒       ▒▒▒▒▒     ▒▒▒▒▒▒▒     ▒▒▒▒▒▒▒
//              ▒     ▒▒▒      ▒░▒      ▒░░░▒      ▒░░░▒      ▒▒▒▒▒▒▒    ▒▒▒▒▒▒▒    ▒▒▒▒▒▒▒▒▒
//        ▓    ▒▓▒    ▒▓▒     ▒░▓░▒     ▒░▓░▒     ▒░░▓░░▒     ▒▒▒▓▒▒▒   ▒▒▒▒▓▒▒▒▒   ▒▒▒▒▓▒▒▒▒
//              ▒     ▒▒▒      ▒░▒      ▒░░░▒      ▒░░░▒      ▒▒▒▒▒▒▒    ▒▒▒▒▒▒▒    ▒▒▒▒▒▒▒▒▒
//                              ▒        ▒▒▒       ▒▒░▒▒       ▒▒▒▒▒     ▒▒▒▒▒▒▒     ▒▒▒▒▒▒▒
//                                                   ▒          ▒▒▒       ▒▒▒▒▒       ▒▒▒▒▒
//                                                                          ▒          ▒▒▒

var Map = {
  
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  
  build: function(opt){
    game.map = [], table = $('<table>').attr({'class':'map'});
    for(var h = 0; h < opt.height; h++){
      game.map[h] = [];
      var tr = $('<tr>').appendTo(table);
      for(var w = 0; w < opt.width; w++){
        game.map[h][w] = $('<td>').attr({'id': Map.toId(w, h)}).addClass('free spot').appendTo(tr).on('contextmenu',game.nomenu);         
      }
    }
    return table;
  },
  
  toId: function(w, h){
    if(w >= 0 && h >=0 && w < game.width && h < game.height) return Map.letters[w] + (h + 1);
  },
  
  getX: function(spot){
    if(spot){
      var w = Map.letters.indexOf(spot[0]);
      if(w >= 0 && w < game.width) return w;
    }
  },  
  getY: function(spot){
    if(spot){
      var h = parseInt(spot[1]) - 1;
      if(h >=0 && h < game.height) return h;
    }
  },
    
  getTd: function(w,h){
    if(game.map[h] && game.map[h][w]) return game.map[h][w];
  },
  
  getPosition: function(el){
    if(el.hasClass('stop')) return el.attr('id');
    return el.closest('td').attr('id');
  },
  
  mirrorPosition: function(spot){
    var w = Map.getX(spot), h = Map.getY(spot);  
    var x = game.width - w - 1, y = game.height - h - 1;
    return Map.toId(x, y);
  },
  
  rangeArray: [0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4],
  
  atRange: function(spot, range, cb, filter){
    if(range < 0 || range > Map.rangeArray.length) return;
    var fil = function(x, y){
      var td = Map.getTd(x, y);
      if(td){
        if(filter) {
          if(!td.hasClasses(filter)) cb(td);
        }
        else cb(td);
      }
    };
    var w = Map.getX(spot), h = Map.getY(spot); 
    if(range === 0) fil(w, h);
    else {
      var radius = Map.rangeArray[range];  
      var x, y, r = Math.round(radius), r2 = radius * radius, l = (Math.ceil(radius) * Math.cos(Math.PI/4)); 

      fil(w, h + r);
      fil(w, h - r);
      fil(w - r, h);  
      fil(w + r, h); 

      if(range == 2 || range == 3){
        for(x = 1; x <= l; x++){
          y = Math.round(Math.sqrt(r2 - x*x)); 
          fil(w + x, h + y); 
          fil(w + x, h - y);     
          fil(w - x, h + y);
          fil(w - x, h - y); 
        }
      } else if(range > 3){
        for(x = 1; x <= l; x++){
          y = Math.round(Math.sqrt(r2 - x*x)); 
          fil(w + x, h + y); 
          fil(w + y, h + x);
          fil(w + x, h - y); 
          fil(w + y, h - x);      
          fil(w - x, h + y); 
          fil(w - y, h + x);
          fil(w - x, h - y); 
          fil(w - y, h - x);
        }
      }
    }
  },   

  atMovementRange: function(card, range, cb, filter){
    if(range < 0 || range > Map.rangeArray.length) return;
    var spot = Map.getPosition(card);  
    var fil = function(x, y){
      var td = Map.getTd(x, y);
      if(td){
        if(filter) {
          if(!td.hasClasses(filter)) cb(td);
        }
        else cb(td);
      }
    };
    var w = Map.getX(spot), h = Map.getY(spot); 
    if(range > 0) { 
      var radius = Map.rangeArray[range];  
      var x, y, r = Math.round(radius), r2 = radius * radius, l = (Math.ceil(radius) * Math.cos(Math.PI/4)); 

      fil(w, h + 1);
      fil(w, h - 1);
      fil(w - 1, h);  
      fil(w + 1, h); 

      if(range == 2 || range == 3){
        for(x = 1; x <= l; x++){
          y = Math.round(Math.sqrt(r2 - x*x)); 
          fil(w + x, h + y); 
          fil(w + x, h - y);     
          fil(w - x, h + y);
          fil(w - x, h - y); 
        }
      }
      if(range == 3 && !card.hasClass('phased')){
        var a = [
          {a: w, b: h+2, c: w, d: h+1, e: w+1, f: h+1, g: w-1, h: h+1},
          {a: w, b: h-2, c: w, d: h-1, e: w+1, f: h-1, g: w-1, h: h-1},
          {a: w-2, b: h, c: w-1, d: h, e: w-1, f: h+1, g: w-1, h: h-1},
          {a: w+2, b: h, c: w+1, d: h, e: w+1, f: h+1, g: w+1, h: h-1}
        ];
        for(var i=0; i<a.length; i++){
          var o = a[i], m = Map.getTd(o.a, o.b);
          var td = Map.getTd(o.c,o.d);
          if(td && td.hasClass('free')){
            if(m) m.data('detour', false);
            fil(o.a, o.b);
          } else {
            td = Map.getTd(o.e,o.f);
            if(td && td.hasClass('free')){
              if(m) m.data('detour', td);
              fil(o.a, o.b);
            } else {
              td = Map.getTd(o.g,o.h);              
              if(td && td.hasClass('free')){
                if(m) m.data('detour', td);
                fil(o.a, o.b);
              }
            }
          }                 
        }     
      }
    }
  },     
  

  inRange: function(spot, r, cb){
    Map.atRange(spot, 0, cb);
    Map.around(spot, r, cb);
  },
  
  around: function(spot, r, cb){
    Map.atRange(spot, r, cb);
    if(r == 3) Map.atRange(spot, 1, cb);
    if(r == 4) Map.atRange(spot, 2, cb);
    if(r == 5) {
      Map.atRange(spot, 1, cb);
      Map.atRange(spot, 3, cb);
    }
  },
  
  stroke: function(spot, range, cl, filter){
    var fil = function(x, y, border){
      var td = Map.getTd(x, y);
      if(td){
        if(filter) {
          if(!td.hasClasses(filter)) td.addClass(cl+' stroke '+border);
        }
        else td.addClass(cl+' stroke '+border);
      }
    };
    var w = Map.letters.indexOf(spot[0]), h = parseInt(spot[1]) - 1; 
                                        
    if(range === 0) return fil(w, h, 'left right top bottom'); 
                                        
    var radius = Map.rangeArray[range];
    var x, y, r = Math.round(radius), r2 = radius * radius, l = (Math.ceil(radius) * Math.cos(Math.PI/4));
                                        
    if(range%2 === 0){  
      fil(w, h + r, 'bottom');
      fil(w, h - r, 'top');
      fil(w - r, h, 'left');  
      fil(w + r, h, 'right'); 
    } else if(range%2 == 1){  
      fil(w, h + r, 'bottom left right');
      fil(w, h - r, 'top  left right');   
      fil(w - r, h, 'left top bottom');  
      fil(w + r, h, 'right top bottom');  
    }   
    if(range == 2 || range == 3){
      for(x = 1; x <= l; x++){
        y = 1; 
        fil(w + x, h + y, 'right bottom'); 
        fil(w + x, h - y, 'right top');     
        fil(w - x, h + y, 'left bottom');
        fil(w - x, h - y, 'left top'); 
      }
    } else if(range == 4 || range == 6 || range == 8){
      for(x = 1; x <= l; x++){
        y = Math.round(Math.sqrt(r2 - x*x)); 
        fil(w + x, h + y, 'right bottom'); 
        fil(w + y, h + x, 'right bottom');
        fil(w + x, h - y, 'right top'); 
        fil(w + y, h - x, 'right top');      
        fil(w - x, h + y, 'left bottom'); 
        fil(w - y, h + x, 'left bottom');
        fil(w - x, h - y, 'left top'); 
        fil(w - y, h - x, 'left top');
      }
    } else if (range >= 5) {
      for(x = 1; x <= l; x++){
        y = Math.round(Math.sqrt(r2 - x*x)); 
        fil(w + x, h + y, 'bottom'); 
        fil(w - x, h + y, 'bottom'); 
        fil(w + x, h - y, 'top'); 
        fil(w - x, h - y, 'top');        
        fil(w - y, h + x, 'left');         
        fil(w - y, h - x, 'left');
        fil(w + y, h - x, 'right');   
        fil(w + y, h + x, 'right');
      }
    }
    if(range == 7) {
      fil(w + 3, h + 2, 'bottom'); 
      fil(w - 3, h + 2, 'bottom');      
      fil(w + 3, h - 2, 'top');
      fil(w - 3, h - 2, 'top'); 
      fil(w - 2, h + 3, 'left');
      fil(w - 2, h - 3, 'left');
      fil(w + 2, h + 3, 'right');       
      fil(w + 2, h - 3, 'right');
    }
  },
  
  getRange: function(att){  
    var range = 1;
    if(att == 'Melee')  range = 2; 
    if(att == 'Short')  range = 3;
    if(att == 'Ranged') range = 4;
    if(att == 'Long')   range = 5;
    return range;
  },
  
  highlight: function(){
    if(game.selectedCard){
      if(game.selectedCard.hasClasses('heroes units')){        
        if(game.status == 'turn') {
          game.selectedCard.highlightMove();
          game.selectedCard.highlightAttack(); 
        }
        game.selectedCard.strokeAttack(); 
      } else if(game.selectedCard.hasClass('skills')){      
        if(game.status == 'turn') {
          game.selectedCard.highlightTargets();          
        }
        game.selectedCard.highlightSource();  
        game.selectedCard.strokeSkill();         
      } else if(game.selectedCard.hasClass('towers')){
        game.selectedCard.strokeAttack(); 
      }
    }
  },
  
  unhighlight: function(){
    $('.map .card').off('contextmenu.attack contextmenu.cast contextmenu.activate mouseenter mouseleave').removeClass('attacktarget casttarget targetspot');
    $('.map td').off('contextmenu.movearea contextmenu.castarea mouseenter mouseleave').removeClass('movearea targetarea stroke playerattack enemyattack skillcast skillarea top bottom left right');    
  },
};

//jquery multi class detection

$.fn.hasClasses = function(list) {
  var classes = list.split(' ');
  for (var i = 0; i < classes.length; i++) {
    if (this.hasClass(classes[i])) {
      return true;
    }
  }
  return false;
};
$.fn.hasAllClasses = function(list) {
  var classes = list.split(' ');
  for (var i = 0; i < classes.length; i++) {
    if (!this.hasClass(classes[i])) {
      return false;
    }
  }
  return true;
};

//js bonus!

if(!Number.prototype.map)    Number.prototype.map=function(a,b,c,d){return c+(d-c)*((this-a)/(b-a))};
if(!Number.prototype.limit)  Number.prototype.limit=function(a,b){return Math.min(b,Math.max(a,this))};
if(!Number.prototype.round)  Number.prototype.round=function(a){a=Math.pow(10,a||0);return Math.round(this*a)/a};
if(!Number.prototype.floor)  Number.prototype.floor=function(){return Math.floor(this)};
if(!Number.prototype.ceil)   Number.prototype.ceil=function(){return Math.ceil(this)};
if(!Number.prototype.toInt)  Number.prototype.toInt=function(){return this|0};
if(!Number.prototype.toRad)  Number.prototype.toRad=function(){return this/180*Math.PI};
if(!Number.prototype.toDeg)  Number.prototype.toDeg=function(){return 180*this/Math.PI};
 
if(!Array.prototype.erase)   Array.prototype.erase=function(a){for(var b=this.length;b--;)this[b]===a&&this.splice(b,1);return this};
if(!Array.prototype.random)  Array.prototype.random=function(){return this[Math.floor(Math.random()*this.length)]};

if(!Function.prototype.bind) Function.prototype.bind=Function.prototype.bind||function(a){var b=this;return function(){var c=Array.prototype.slice.call(arguments);return b.apply(a||null,c)}};
