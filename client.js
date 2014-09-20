var game = {
  
  debug: location.host == "localhost",
  
  width: 12,  height: 5, //slots
  
  timeToPick: 5, timeToPlay: 5, waitLimit: 300, connectionLimit: 90, //seconds  
  
  container: $('<div>').appendTo(document.body).addClass('container'),
  
  dayLength: 6, //turns
  
};

/***STATES*** ////////////////////////////////////////////

 states.changeTo('yourState')  -> set current state
       .currentstate -> get current state
       .el -> states div appended to game.container

 each states
       have an element (this.el) appended to states.el
       if have build function will run once
       if have start function will run every time
       if have end function will run every time

////////////////////////////////////////////////////////*/

var states = {
  
  el: $('<div>').attr('id','states').appendTo(game.container), 
  
  changeTo: function(state){ 
    if(state == states.currentstate) return;
    
    var oldstate = states[states.currentstate];
    if(oldstate.el) oldstate.el.addClass('hidden'); 
    if(oldstate.end) oldstate.end();
    
    var newstate = states[state];
    if(newstate.build && !newstate.builded){      
      newstate.build();
      newstate.builded = true;
    }
    states.el.removeClass(states.currentstate).addClass(state);
    if(newstate.el) newstate.el.removeClass('hidden');
    states.currentstate = state;
    if(newstate.start) newstate.start();
  },
  
  build: function(){
    //todo: preloads
    $.each(states, function(id){
      if(id == 'load' || id == 'el' || id == 'changeTo' || id == 'build' || id == 'currentstate') return;
      states[id].el = $('<div>').attr('id',id).appendTo(states.el).addClass('hidden');
    });      
    game.states = states;
  }, 
  
  currentstate: 'load',

  ////////////////////////////////////////////////////////////////////////////////////////

  'load': {
    
    end: function(){
      console.log('Welcome to DotaCard!');
      if(!game.debug){
        window.onbeforeunload = function(){
          return 'Sure you wanna leave?';
        }
      }
    },
    
    reset: function(){
      if(game.debug){
        console.log('Error', game);
      } else {
        alert('Connection error, sorry.');
        location.reload(true);
      }
    },
    
    quit: function(){
      var sure = confirm('Sure you wanna leave?')
      if(sure) location.reload(true);
    }
  },
  'intro': {
    
    build: function(){          
      this.list = $('<div>').appendTo(this.el).attr({'class': 'box'});
      this.text = $('<p>').appendTo(this.list).attr({'class': 'intro'}).html('DotaCard <a target="_blank" href="http://scriptogr.am/rafaelcastrocouto">æ</a>');

      this.timeout = setTimeout(function(){
        states.changeTo('login');
      }, 3000);

      this.el.click(function(){
        clearTimeout(states.intro.timeout);
        states.changeTo('login');
      });
    }
  },
  'login': {  
    
    build: function(){ 
      this.menu = $('<div>').appendTo(this.el).attr({'class': 'box'});
      this.title = $('<h1>').appendTo(this.menu).text('Choose a name');

      this.input = $('<input>').appendTo(this.menu).attr({ 'placeholder': 'Type any name here', 'type': 'text'})
      .keydown(function(e){
        if(e.which == 13) states.login.button.click();
      });
      
      var c = 'Choose a name and click to play';
      this.button = $('<button>').appendTo(this.menu).attr({'placeholder': c, 'title': c}).text('Play')
      .click(function(){        
        game.player = {name: states.login.input.val()};        
        if(game.player.name){
          states.login.button.prop( "disabled", true );
          db({'get':'server'}, function(server){
            if(server.status == 'online') states.changeTo('menu');
            else states.load.reset();
          })            
        } else states.login.input.focus();
      });

      this.text = $('<div>').appendTo(this.menu);
      this.logwith = $('<p>').appendTo(this.text).html('Login with: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Facebook, Google</a>');
      this.lang = $('<p>').appendTo(this.text).html('Language: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Translate</a>');
    },
    
    start: function(){
      this.input.focus();
    },
    
    end: function(){
      this.button.prop( "disabled", false );
    },
  },
  'menu': {
    
    build: function(){

      this.text = $('<p>').appendTo(this.el).html('Welcome <b>'+game.player.name+'</b>! ');
      this.logout = $('<small>').appendTo(this.text).text('Logout').click(states.load.quit);
      this.menu = $('<div>').appendTo(this.el).attr({'class': 'box'}); 
      this.title = $('<h1>').appendTo(this.menu).text('Choose a game mode');

      this.public = $('<button>').appendTo(this.menu).text('Play public match').attr({ 
        'title': 'Find an adversary online'
      }).click(function(){        
        states.menu.public.prop( "disabled", true );
        db({'get':'waiting'}, function(waiting){          
          if(waiting.id == 'none'){
            game.id = btoa(new Date().valueOf() +''+ parseInt(Math.random()*10E10));
            var myGame = {id: game.id};
            db({'set': 'waiting', 'data': myGame}, function(){ 
              game.status = 'waiting';
              states.changeTo('choose');
            });
            
          } else { //found waiting game id              
            game.id = waiting.id;              
            var clearWait = {id: 'none'};
            db({'set': 'waiting', 'data': clearWait}, function(){ 
              game.status = 'found';
              states.changeTo('choose');
            });              
          }
        });
      });

      this.friend = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Search for a friend to play', 'disabled': true }).text('Play with a friend');        
      this.bot = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Play with against the computer', 'disabled': true }).text('Play with a bot');    
      this.options = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - User Configurations', 'disabled': true }).text('Options'); 
      this.credits = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Credits', 'disabled': true }).text('Credits');
    },
    
    end: function(){
      states.menu.public.prop( "disabled", false );
    }
  },
  'choose': {      
    
    build: function(){   
      this.message = $('<p>').appendTo(this.el).attr({'class': 'challenge'});
      this.pickbox = $('<div>').appendTo(this.el).attr({'class': 'pickbox'});
      
      this.pickedbox = $('<div>').appendTo(this.el).attr({'class': 'pickedbox'}).addClass('hidden');
      for(var s = 0; s < 5; s++){
        $('<div>').appendTo(this.pickedbox).attr({title: 'Click here to pick'}).addClass('slot available');
      }
      
      this.prepickbox = $('<div>').appendTo(this.el).attr({'class': 'prepickbox'}).html('My Decks<br>Comming soon...').addClass('hidden');
      this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').addClass('hidden');
      
      this.pickDeck = Deck('heroes', function(pickDeck){
        pickDeck.appendTo(states.choose.pickbox);
        states.choose.size = 100;
        $.each(pickDeck.data('cards'), function(id, card){
          card.on('click.active', function(){
            var clickedCard = $(this);
            if(!clickedCard.hasClass('picked')){
              $('.card.active').removeClass('active');
              clickedCard.addClass('active');
              states.choose.pickDeck.css('left', clickedCard.index() * states.choose.size * -1);
            }
          });
        });
        pickDeck.width((states.choose.size + 100) * pickDeck.children().length);
      });
      this.findGame();
    },

    findGame: function(){   
      this.tries = 1;  
      
      if(game.status == 'found'){
        this.message.html('We found a game: <b>'+ game.player.name +'</b>, establishing connection');
        game.player.type = 'challenger';
        game.currentData = {
          challenger: game.player.name
        };
        db({'set': game.id, 'data': game.currentData}, function(){
          clearTimeout(states.choose.timeout);
          states.choose.timeout = setTimeout(states.choose.getChallenged, 1000);
        });        
      } 
      if(game.status == 'waiting'){
        this.message.html('Just wait <b>'+ game.player.name +'</b>, we are searching for an enemy player');
        game.player.type = 'challenged';
        game.currentData = {
          challenged: game.player.name
        }; 
        clearTimeout(states.choose.timeout);
        states.choose.timeout = setTimeout(states.choose.getChallenger, 1000);
      }  
    },
    getChallenged: function(){
      db({'get': game.id }, function(found){ 
        
        if(found.challenged){
          game.currentData.challenged = found.challenged;                 
          states.choose.battle(found.challenged, 'challenged');
          
        } else {
          states.choose.message.html('Be patient <b>'+game.player.name+'</b>, we are still trying to connect <small>('+(states.choose.tries++)+')</small>');  
          if(states.choose.tries > game.connectionLimit) states.load.reset();
          else states.choose.timeout = setTimeout(states.choose.getChallenged, 1000);
        }
      });
    },

    getChallenger: function(){
      db({'get': game.id }, function(found){
        if(found.challenger){
          game.currentData.challenger = found.challenger;
          db({'set': game.id, 'data': game.currentData}, function(){
            states.choose.battle(found.challenger, 'challenger');
          });
          
        } else {
          states.choose.message.html('Be patient <b>'+game.player.name+'</b>, we are still searching for an emeny <small>('+(states.choose.tries++)+')</small>');                
          if(states.choose.tries > game.waitLimit) states.load.reset(); //todo: sugest bot match         
          else states.choose.timeout = setTimeout(states.choose.getChallenger, 1000);
        }
      });

    },

    battle: function(enemy, challenge){     
      game.enemy = {name: enemy, type: challenge};  
      this.el.addClass('turn');
      this.message.html('Battle Found! <b>'+ game.player.name + '</b> vs <b>' + game.enemy.name +'</b>');
      this.counter.removeClass('hidden');
      //todo: play sound and stuff!   
      game.status = 'picking';
      this.count = game.timeToPick;
      this.enablePick();
      clearTimeout(this.timeout);
      this.timeout = setTimeout(states.choose.pickCount, 1000);      
    },

    enablePick: function(){
      this.pickedbox.removeClass('hidden');
      this.prepickbox.removeClass('hidden');
      $('.slot').on('click.pick contextmenu.pick', states.choose.pick);
    },
    
    disablePick: function(){
      $('.slot').off('click.pick contextmenu.pick', states.choose.pick);
    },

    pick: function(){
      var slot = $(this);
      if(slot.hasClass('available')){
        var pick = $('.pickbox .card.active');
        if(pick.length){
          slot.removeClass('available');
          pick.removeClass('active').addClass('picked').appendTo(slot);
        }
      } else {
        var c = slot.children('.card').removeClass('picked').appendTo($('.pickbox .deck'));
        states.choose.pickDeck.css('left', c.index() * states.choose.size * -1);
        slot.addClass('available');        
      } 
      return false;
    },

    pickCount: function(){ 
      states.choose.counter.text('Pick your deck, game starts in: '+(states.choose.count--));      
      if(states.choose.count < 0) {   
        states.choose.disablePick();
        states.choose.counter.text('Get Ready!');  
        states.choose.fillDeck();   
      }
      else setTimeout(states.choose.pickCount, 1000);
    },
    
    fillDeck: function(){
      var picks = [];
      $('.card.picked').each(function(){
        picks.push(this.id);
      });   
      $('.slot.available').each(function(){
        var slot = $(this);
        var notPicked = $('.card').not('.picked');
        var r = parseInt( Math.random() * notPicked.length );
        var randomPicked = notPicked[r];
        picks.push(randomPicked.id);
        slot.removeClass('available');
        $(randomPicked).removeClass('active').addClass('picked').appendTo(slot);
      }).queue(function(){
        game.player.picks = picks; 
        states.choose.sendDeck();
      });
    },

    sendDeck: function(){
      clearTimeout(states.choose.timeout);
      states.choose.tries = 1;
      if(game.player.type == 'challenged'){
        game.currentData.challengedDeck = game.player.picks.join('|');
        db({'set': game.id, 'data': game.currentData}, function(){          
          states.choose.getChallengerDeck();
        });
      }
      if(game.player.type == 'challenger') states.choose.getChallengedDeck();   
      
    },

    getChallengerDeck: function(){ 
      db({'get': game.id }, function(found){ 
        
        if(found.challengerDeck){
          game.currentData = found;
          game.enemy.picks = game.currentData.challengerDeck.split('|');
          states.changeTo('table');
          
        } else {
          states.choose.message.html('Be patient <b>'+game.player.name+'</b>, your challenger is choosing <small>('+(states.choose.tries++)+')</small>');
          if(states.choose.tries > game.connectionLimit) states.load.reset();
          else states.choose.timeout = setTimeout(states.choose.getChallengerDeck, 1000);
        }
      });
    },

    getChallengedDeck: function(){
      db({'get': game.id }, function(found){ 
        
        if(found.challengedDeck){ 
          game.currentData = found;    
          game.currentData.challengerDeck = game.player.picks.join('|');
          game.enemy.picks = game.currentData.challengedDeck.split('|');
          db({'set': game.id, 'data': game.currentData}, function(){
            states.changeTo('table');
          });    
          
        } else {
          states.choose.message.html('Be patient <b>'+game.player.name+'</b>, your opponent is choosing <small>('+(states.choose.tries++)+')</small>');
          if(states.choose.tries > game.connectionLimit) states.load.reset();
          else states.choose.timeout = setTimeout(states.choose.getChallengedDeck, 1000);
        }      
      });  
    },

    end: function(){           
      clearTimeout(states.choose.timeout);
      this.el.removeClass('turn');      
      this.pickedbox.addClass('hidden');
      this.prepickbox.addClass('hidden');       
      $('.card.picked').removeClass('picked').appendTo(this.pickDeck);
      $('.slot').addClass('available');
      this.counter.addClass('hidden');
    }
  },

  'table': {
    
    build: function(){        
      this.message =  $('<p>').appendTo(this.el.addClass('load')).attr({'class': 'message'}).text('Muuuuuuuuuuuuu!');
      this.time =  $('<p>').appendTo(this.el).attr({'class': 'time'}).text('Time: 0:00 Day Turns: 0/0 (0)');
      this.selectedArea = $('<div>').appendTo(this.el).attr({'class': 'selectedarea'});
      this.buildMap();   
      this.placeTowers(); 
      this.placeHeroes(); 
      this.buildSkills(); 
      this.buildTurns();

    },
    
    buildMap: function(){

      this.map = Map.build({
        'width': game.width,
        'height': game.height,
        'class': 'map'
      }).appendTo(this.el);

      game.map = this.map;

    },
    
    createTower: function(type, spot){
      var tower = Card({
        className: 'tower static '+type,
        id:  type == 'player' ? 'ptw' : 'etw' ,
        name: 'Tower',
        img: 'img/towers/tower-'+type+'.png',
        attribute: 'Building',
        attackType: 'Ranged',
        damage: 7,
        hp: 80
      });        
      tower.click(Card.select).appendTo($('#'+spot).removeClass('free').addClass('block'));

      Map.paint(spot, 3, type == 'player' ? 'playerarea' : 'enemyarea', true);

      return tower;
    },
    
    placeTowers: function(){      
      game.player.tower = states.table.createTower('player', 'C5');
      game.enemy.tower = states.table.createTower('enemy', 'J1');    
    },
    
    towerAutoAttack : function(){
      var lowestHp = {
          notfound: true,
          data: function(c){
          if(c == 'currenthp') return Infinity;
          else return false;
        }
      };
      $('.map .playerarea .card.enemy').each(function(){
        var target = $(this);
        if(target.data('currenthp') < lowestHp.data('currenthp')) {
          lowestHp = target;
        }
      });  

      if(!lowestHp.notfound) {
        game.player.tower.attack(lowestHp);
        var fromSpot = Map.getPosition(game.player.tower);
        var toSpot = Map.getPosition(lowestHp);
        game.currentData.moves.push('A:'+fromSpot+':'+toSpot); 
      }
    },
    
    placeHeroes: function(){      

      this.playerDeck = Deck('heroes', game.player.picks, function(playerDeck){        
        playerDeck.addClass('player').appendTo(states.table.el);
        var x = 0, y = '4';
        $.each(playerDeck.data('cards'), function(id, card){   
          card.addClass('player').click(Card.select);
          card.place(Map.letters[x]+y);
          x++;
        });
      });     

      this.enemyDeck = Deck('heroes', game.enemy.picks, function(enemyDeck){
        enemyDeck.addClass('enemy').appendTo(states.table.el);        
        var x = 11, y = '2';
        $.each(enemyDeck.data('cards'), function(id, card){       
          card.addClass('enemy').click(Card.select);          
          card.place(Map.letters[x]+y);          
          x--;
        });
      });   

    },
    buildSkills: function(){

      //todo: skills

    },
    buildTurns: function(){
      game.time = 0;      
      game.player.turn = 0;
      game.enemy.turn = 0;
      game.currentData.moves = [];
      
      //todo: build storage.state
      
      if(game.player.type == 'challenged') game.status = 'turn';
      if(game.player.type == 'challenger') game.status = 'unturn';   
      
      states.table.timeout = setTimeout(states.table.beginTurn, 1000);

    },
    beginTurn: function(){
      
      //todo: update storage.state = game.state - each hero hp position buffs etc, each player skill hand 
      
      states.table.el.removeClass('load').addClass(game.status);       
      if(game.status != 'over') {      
        
        $('.card.dead').each(function(){
          var dead = $(this);
          if(dead.data('reborn') == game.time) dead.reborn();
        });        
        
        if(game.status == 'turn'){              
          $('.card.player.done').removeClass('done');        
          game.currentData.moves = [];        
          states.table.towerAutoAttack();        
          Map.highlight(); 
        }
        states.table.counter = game.timeToPlay;
        clearTimeout(states.table.timeout);
        states.table.timeout = setTimeout(states.table.turnCount, 1000);
      }
    },

    turnCount: function(){
      states.table.time.text('Time: '+states.table.hours()+' '+states.table.dayNight()+' Turns: '+game.player.turn+'/'+game.enemy.turn +' ('+parseInt(game.time)+')');
      
      if(game.status == 'turn') states.table.message.text('Your turn is now, you have '+states.table.counter+' seconds to finish your moves');
      if(game.status == 'unturn') states.table.message.text('Your enemy is playing, your turn starts in '+states.table.counter+' seconds');
      
      if(states.table.counter-- == 0){
        if(game.status == 'turn') states.table.sendMoves();
        if(game.status == 'unturn') states.table.getMoves();    
      } else {
        game.time += 1 / game.timeToPlay;
        states.table.timeout = setTimeout(states.table.turnCount, 1000);
      }
    },
    
    hours: function(){
      var hours = game.time % game.dayLength;
      var perCentHours = hours / game.dayLength;
      var convertedHours = perCentHours * 24;
      var intHours = parseInt(convertedHours);      
      var minutes = convertedHours - intHours;
      if(minutes < 0) minutes = 0;
      var convertedMin = minutes * 60;
      var intMin = parseInt(convertedMin);
      var stringMin = (intMin < 10) ? '0'+intMin : intMin;
      return intHours+':'+stringMin;      
    },
    
    dayNight: function(){
      var hours = game.time % game.dayLength;
      if(hours < (game.dayLength/2) ) return 'Day';
      else return 'Night'
    },
    
    moveSelected: function(){
      var spot = $(this), card = game.selectedCard;
      var fromSpot = Map.getPosition(card);  
      var toSpot = Map.getPosition(spot);
      if(game.status == 'turn' && spot.hasClass('free') && (fromSpot != toSpot) && !card.hasClass('done')){
        card.move(toSpot);        
        game.currentData.moves.push('M:'+fromSpot+':'+toSpot);
        Map.unhighlight();
      }  
      return false;
    },

    attackWithSelected: function(){  
      var target = $(this), source = game.selectedCard;
      var fromSpot = Map.getPosition(source);
      var toSpot = Map.getPosition(target);  
      if(game.status == 'turn' && source.data('damage') && (fromSpot != toSpot) && !source.hasClass('done') && target.data('currenthp')){ 
        source.attack(target);      
        game.currentData.moves.push('A:'+fromSpot+':'+toSpot); 
        Map.unhighlight();
      }
      return false;
    },   
    
    sendMoves: function(){
      states.table.message.text('Uploading your moves '+game.player.turn);
      Map.unhighlight();       
      game.status = 'unturn';
      states.table.el.removeClass('turn').addClass('load');
      game.player.turn++;
      game.currentData[game.player.type + 'Turn'] = game.player.turn;      
      game.currentData.moves = game.currentData.moves.join('|');      
      clearTimeout(states.table.timeout);
      states.table.sendData();
    },

    getMoves: function(){
      states.table.tries = 1;  
      states.table.el.removeClass('unturn').addClass('load');
      clearTimeout(states.table.timeout);
      states.table.timeout = setTimeout(states.table.getData, 1000);
    },

    sendData: function(){
      db({'set': game.id, 'data': game.currentData}, function(){
        clearTimeout(states.table.timeout);
        states.table.timeout = setTimeout(states.table.beginTurn, 1000);
      });      
    },

    getData: function(){   
      db({'get': game.id }, function(data){                    
        if(data[game.enemy.type + 'Turn'] == (game.enemy.turn + 1) ){
          game.currentData = data;
          game.enemy.turn++;
          states.table.executeEnemyMoves();            
        } else {
          states.table.message.html('Be patient <b>'+game.player.name+'</b>, downloading enemy move '+(game.enemy.turn + 1)+' <small>('+(states.table.tries++)+')</small>');
          if(states.table.tries > game.connectionLimit) states.load.reset();
          else states.table.timeout = setTimeout(states.table.getData, 1000);
        }
      });
    },

    executeEnemyMoves: function(moves){
      states.table.message.html('Your enemy moved. Get ready!');
      $('.card.enemy.done').removeClass('done');
      var moves = game.currentData.moves.split('|');      
      for(var m = 0; m < moves.length; m++){
        var move = moves[m].split(':');
        if(move[0] == 'M'){
          var fromSpot = Map.mirrorPosition(move[1]),
              toSpot = Map.mirrorPosition(move[2]);    
          var target = $('#'+fromSpot+' .card');
          if(!target.hasClass('done') && target.hasClass('enemy') && target.move) target.move(toSpot);
        }        
        if(move[0] == 'A'){
          var fromSpot = Map.mirrorPosition(move[1]),
              toSpot = Map.mirrorPosition(move[2]);    
          var source = $('#'+fromSpot+' .card');
          if(!source.hasClass('done') && source.hasClass('enemy') && source.attack) source.attack(toSpot);
        }        
      }      
      clearTimeout(states.table.timeout);
      states.table.timeout = setTimeout(function(){
        game.status = 'turn';
        states.table.beginTurn();
      }, 1000);
    },

    lose: function(){
      states.table.message.text('Game Over!');
      game.status = 'over';      
      states.table.showResults();
    },

    win: function(){
      states.table.message.text('Congratulations, you won!');
      game.status = 'over';      
      states.table.showResults();
    },

    showResults: function(){
      console.log(game);
    }

  }
};

states.build();  

//start the game
game.states.changeTo('intro');  




