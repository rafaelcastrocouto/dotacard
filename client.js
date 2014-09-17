var game = {
  width: 12,
  height: 5,
  connectionLimit: 90,
  timeToPick: 1,
  timeToPlay: 5,
  container: $('<div>').appendTo(document.body).attr('id','container')
};

/***STATES*** ////////////////////////////////////////////

 states.changeTo('yourState')  -> set current state
       .currentstates -> get current state
       .el -> states div appended to game.container

 each states
       have an element (this.el) appended to states.el
       if have build function will run once
       if have start function will run every time
       if have end function will run every time
       todo destroy state

////////////////////////////////////////////////////////*/


var states = {
  el: $('<div>').attr('id','states').appendTo(game.container),    
  changeTo: function(s){ 
    if(s == states.currentstates) return;
    var oldstates = states[states.currentstates];
    if(oldstates.el) oldstates.el.addClass('hidden'); 
    if(oldstates.end) oldstates.end();      
    var newstates = states[s];
    if(newstates.build && !newstates.builded){      
      newstates.build();
      newstates.builded = true;
    }    
    states.el.removeClass(states.currentstates).addClass(s);
    if(newstates.el) newstates.el.removeClass('hidden');
    states.currentstates = s;
    if(newstates.start) newstates.start();
  },
  build: function(){
    //todo: preloads
    $.each(states, function(id){
      if(id == 'load' || id == 'el' || id == 'changeTo' || id == 'build' || id == 'currentstates') return;
      states[id].el = $('<div>').attr('id',id).appendTo(states.el).addClass('hidden');
    });      
    game.states = states;
  },   
  currentstates: 'load',
  
  ////////////////////////////////////////////////////////////////////////////////////////
  
  'load': {
    end: function(){
      console.log('Welcome to DotaCard!');
      window.onbeforeunload = function(){
        return 'Sure you wanna leave?';
      }
    },
    reset: function(){
      alert('Connection error, sorry.');
      location.reload(true);
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

      this.button = $('<button>').appendTo(this.menu).attr({ 'placeholder': 'Choose a name and click to play', 'title': 'Choose a name and click to play'}).text('Play')
      .click(function(){
        game.player = {name: states.login.input.val()};
        if(game.player.name){
          db({'get':'server'}, function(server){
            if(server.status == 'online') states.changeTo('menu');
            else states.load.reset();
          })            
        }
        else states.login.input.focus();
      });

      this.text = $('<div>').appendTo(this.menu);

      this.logwith = $('<p>').appendTo(this.text).html('Login with: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Facebook, Google</a>');

      this.lang = $('<p>').appendTo(this.text).html('Language: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Translate</a>');
    },
    start: function(){
      this.input.focus();
    }
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
        game.id = btoa(new Date().valueOf() +''+ parseInt(Math.random()*10E10));
        //check if there is someone waiting
        db({'get':'waiting'}, function(waiting){
          if(waiting.id == 'none'){
            //go to the waiting line
            db({'set': 'waiting', 'data': JSON.stringify({id: game.id}) }, function(){ 
              game.status = 'waiting';
              states.changeTo('choose');
            });
          } else { //found waiting game id              
            game.id = waiting.id;              
            //tell enemy to leave the waiting line
            db({'set': 'waiting', 'data': JSON.stringify({id: 'none'})}, function(){ 
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
    }
  },
  'choose': {      
    build: function(){   
      this.message = $('<p>').appendTo(this.el).attr({'class': 'challenge'});

      this.heroesbox = $('<div>').appendTo(this.el).attr({'class': 'heroesbox'});

      this.pickbox = $('<div>').appendTo(this.el).attr({'class': 'pickbox'}).addClass('hidden');

      this.prepickbox = $('<div>').appendTo(this.el).attr({'class': 'prepickbox'}).html('My Decks<br>Comming soon...').addClass('hidden');

      this.counter = $('<p>').appendTo(this.pickbox).addClass('counter').addClass('hidden');

      this.heroesDeck = Deck('heroes', function(heroesDeck){
        heroesDeck.el.appendTo(states.choose.heroesbox);

        states.choose.size = 100;

        $.each(heroesDeck.cards, function(id, hero){
          hero.el.click(function(){
            $('.card').removeClass('active');
            var c = $(this);
            c.addClass('active');
            heroesDeck.el.css('left', c.index() * states.choose.size * -1);
          });
        });
        heroesDeck.el.width((states.choose.size + 100) * heroesDeck.length);
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
        db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){
          states.choose.timeout = setTimeout(states.choose.getChallenged, 1000);
        });
      } else if(game.status == 'waiting'){
        this.message.html('Just wait <b>'+ game.player.name +'</b>, we are searching for an enemy player');
        game.player.type = 'challenged';
        game.currentData = {
          challenged: game.player.name
        }; 
        this.timeout = setTimeout(states.choose.getChallenger, 1000);
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
          db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){
            states.choose.battle(found.challenger, 'challenger');
          });
        } else {
          states.choose.message.html('Be patient <b>'+game.player.name+'</b>, we are still searching <small>('+(states.choose.tries++)+')</small>');                
          if(states.choose.tries > game.connectionLimit) states.load.reset(); //todo: sugest bot match         
          else states.choose.timeout = setTimeout(states.choose.getChallenger, 1000);
        }
      });

    },
    
    battle: function(enemy, ch){     
      game.enemy = {name: enemy, type: ch};  
      this.message.addClass('turn').html('Battle Found! <b>'+ game.player.name + '</b> vs <b>' + game.enemy.name +'</b>');
      this.counter.removeClass('hidden');
      //todo: play sound and stuff!   
      game.status = 'picking';
      this.count = game.timeToPick;
      this.enablePick();
      this.timeout = setTimeout(states.choose.pickCount, 1000);      
    },
                                
    enablePick: function(){
      this.pickbox.removeClass('hidden');
      this.prepickbox.removeClass('hidden');
      for(var s = 0; s < 5; s++){
        $('<div>').appendTo(this.pickbox).attr({title: 'Click here to pick'})
        .addClass('slot available').click(function(){
          var slot = $(this);
          if(slot.hasClass('available')){
            var pick = $('.heroesbox .card.active');
            if(pick.length){
              slot.removeClass('available');
              pick.addClass('picked').removeClass('active');
              slot.append(pick);
            }
          } else {
            var c = slot.children().first();
            c.appendTo($('.heroesbox .deck'));
            states.choose.heroesDeck.el.css('left', c.index() * states.choose.size * -1);
            slot.addClass('available');
            c.removeClass('picked');
          } 
        });
      }
    },
                     
    pickCount: function(){ 
      states.choose.counter.text('Pick your deck, game starts in: '+(states.choose.count--));
      if(states.choose.count < 0){
        states.choose.sendDeck();            
      } else setTimeout(states.choose.pickCount, 1000);
    },
    
    sendDeck: function(){
      var picks = [];
      $('.card.picked').each(function(){
        picks.push(this.id);
      });
      //fill deck with random cards
      while(picks.length < 5){
        var notPicked = $('.card').not('.picked');
        var r = parseInt( Math.random() * notPicked.length );
        picks.push(notPicked[r].id);
        $(notPicked[r]).addClass('picked');
      }
      game.player.picks = picks;

      if(game.player.type == 'challenged'){
        game.currentData.challengedDeck = picks.join('|');
        db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){
          states.choose.tries = 1;
          states.choose.timeout = setTimeout(states.choose.getChallengerDeck, 1000);
        });
      }

      if(game.player.type == 'challenger'){
        states.choose.tries = 1;  
        states.choose.timeout = setTimeout(states.choose.getChallengedDeck, 1000);   
      }
    },
    
    getChallengerDeck: function(){ 
      db({'get': game.id }, function(found){ 
        if(found.challengerDeck){
          game.currentData = found;
          game.enemy.picks = game.currentData.challengerDeck.split('|');
          states.changeTo('table');
        } else {
          states.choose.message.html('Be patient <b>'+game.player.name+'</b>, your opponent is choosing <small>('+(states.choose.tries++)+')</small>');
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
          db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){
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
      this.el.addClass('hidden');           
      this.message.removeClass('turn');
      $('.card').removeClass('active picked');
      $('.pickbox .card').appendTo(this.heroesDeck.el);
      this.counter.addClass('hidden');
      this.pickbox.addClass('hidden');
      this.prepickbox.addClass('hidden');
    }
  },
  
  'table': {
    build: function(){        
      this.message =  $('<p>').appendTo(this.el.addClass('load')).attr({'class': 'message'}).text('Muuuuuuuuuuuuu!');
      
      this.turnCounter =  $('<p>').appendTo(this.el).attr({'class': 'turnCounter'}).text('Turns: 0 / 0');
      
      this.selectedArea = $('<div>').appendTo(this.el).attr({'class': 'selectedarea'});
      
      this.enemyArea = $('<div>').appendTo(this.el).attr({'class': 'enemyarea'});

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
      tower.el.click(states.table.select).appendTo($('#'+spot).removeClass('free').addClass('block'));

      Map.paint(spot, 3, type == 'player' ? 'playerArea' : 'enemyArea', true);

      return tower;
    },
    placeTowers: function(){      
      game.player.tower = states.table.createTower('player', 'C5');
      game.enemy.tower = states.table.createTower('enemy', 'J1');    
    },
    placeHeroes: function(){      
      
      this.heroesDeck = Deck('heroes', game.player.picks, function(heroesDeck){        
        heroesDeck.el.appendTo(states.table.el);
        var c = 0;
        $.each(heroesDeck.cards, function(id, card){   
          card.el.addClass('player').click(Card.select);
          Map.place(card.el, Map.letters[c]+'4');
          c += 1;
        });
      });     

      this.enemyDeck = Deck('heroes', game.enemy.picks, function(enemyDeck){
        enemyDeck.el.appendTo(states.table.enemyArea);        
        var c = 11;
        $.each(enemyDeck.cards, function(id, card){       
          card.el.addClass('enemy').click(Card.select);          
          Map.place(card.el, Map.letters[c]+'2');          
          c -= 1;
        });
      });   
      
    },
    buildSkills: function(){
      
      //todo: skills
      
      console.log(game);
      
    },
    buildTurns: function(){
      game.player.turn = 0;
      game.enemy.turn = 0;
            
      game.currentData[game.player.type + 'Turn'] = 0;
      game.currentData[game.enemy.type + 'Turn'] = 0;
      
      //todo: storage.state - each hero hp position buffs etc, each player skill hand 
      
      game.currentData.moves = [];
      
      if(game.player.type == 'challenged') game.status = 'turn';
      if(game.player.type == 'challenger') game.status = 'unturn';      
      
      states.table.timeout = setTimeout(states.table.beginTurn, 1000);
      
    },
    beginTurn: function(){
      
      //todo: game.storage = game.state;
      
      states.table.turnCounter.text('Turns: '+game.player.turn+' / '+game.enemy.turn);   
      states.table.el.removeClass('load').addClass(game.status);  
      
      if(game.status == 'turn'){        
        $('.card.done').removeClass('done');
        game.currentData.moves = [];
        if(game.selectedCard){
          Map.highlightMove(game.selectedCard);
          Map.highlightAttack(game.selectedCard);       
        }
      }      
         
      states.table.counter = game.timeToPlay;            
      states.table.timeout = setTimeout(states.table.turnCount, 1000);
    },
                                               
    turnCount: function(){
      if(game.status == 'turn') states.table.message.text('Your turn is now, you have '+states.table.counter+' seconds to finish your moves');
      else if(game.status == 'unturn') states.table.message.text('Your enemy is playing, your turn starts in '+states.table.counter+' seconds');

      if(states.table.counter-- < 0){
         
        if(game.status == 'turn') states.table.sendMoves();
        else if(game.status == 'unturn') states.table.getMoves();       
        
      } else states.table.timeout = setTimeout(states.table.turnCount, 1000);

    },
    
    sendMoves: function(){
      Map.unhighlight();      
      game.status = 'unturn';
      states.table.el.removeClass('turn').addClass('load');      
      game.player.turn++;
      game.currentData[game.player.type + 'Turn']++;      
      game.currentData.moves = game.currentData.moves.join('|');      
      states.table.message.text('Uploading your moves...');
      states.table.sendData();
    },
    
    getMoves: function(){
      states.table.tries = 1;  
      states.table.el.removeClass('unturn').addClass('load');
      states.table.timeout = setTimeout(states.table.getData, 1000);
    },
    
    sendData: function(){
      db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){        
        states.table.timeout = setTimeout(states.table.beginTurn, 1000);
      });      
    },
    
    getData: function(){   
      db({'get': game.id }, function(data){ 
        game.currentData = data;           
        if(game.currentData[game.enemy.type + 'Turn'] == (game.enemy.turn + 1) ){
          game.enemy.turn++;            
          states.table.executeMoves();            
        } else {
          states.table.message.html('Be patient <b>'+game.player.name+'</b>, downloading enemy move '+game.enemy.turn+' <small>('+(states.table.tries++)+')</small>');
          if(states.table.tries > game.connectionLimit) states.load.reset();
          else states.table.timeout = setTimeout(states.table.getData, 1000);
        }
      });
    },
    
    executeMoves: function(moves){
      states.table.message.html('Your enemy moved. Get ready!');
      var moves = game.currentData.moves.split('|');
      for(var m = 0; m < moves.length; m++){
        var move = moves[m].split(':');
        if(move[0] == 'M'){
          var fromSpot = Map.mirrorPosition(move[1]),
              toSpot = Map.mirrorPosition(move[2]);          
          Card.move(fromSpot, toSpot);
        }        
        if(move[0] == 'A'){
          var fromSpot = Map.mirrorPosition(move[1]),
              toSpot = Map.mirrorPosition(move[2]);       
          Card.damage($('#'+fromSpot+' .card').data('damage'), toSpot);
        }        
      }      
      states.table.timeout = setTimeout(function(){
        game.status = 'turn';
        states.table.beginTurn();
      }, 1000);
    }
  }
};

states.build();  

//start the game
game.states.changeTo('intro');  




