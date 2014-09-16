var game = {
  width: 12,
  height: 5,
  connectionLimit: 90,
  timeToPick: 1,
  timeToPlay: 5,
  container: $('<div>').appendTo('body').attr('id','container')
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
          db({'get':'status'}, function(status){
            if(status == 'online') states.changeTo('menu');
            else alert('Error: No server connection, please try again later.');
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
          if(waiting == 'none'){
            //go to the waiting line
            db({'set': 'waiting', 'data': game.id }, function(){ 
              game.status = 'waiting';
              states.changeTo('choose');
            });
          } else { //found waiting game id              
            game.id = waiting;              
            //tell enemy to leave the waiting line
            db({'set': 'waiting', 'data': 'none'}, function(){ 
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
      
      if(game.status == 'found'){
        this.message.html('We found a game: <b>'+ game.player.name +'</b>, establishing connection');
        game.player.type = 'challenger';
        //challenge the other player
        game.currentData = {
          challenger: game.player.name
        };
        db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){
          //check if the challenge was accepted
          states.choose.tries = 0;

          states.choose.interval = setInterval(function(){
            db({'get': game.id }, function(data){ 
              var found = JSON.parse(data); 
              if(found.challenged){
                game.currentData = {
                  challenger: game.player.name,
                  challenged: found.challenged
                };                  
                states.choose.countToBattle(found.challenged, 'challenged');
              } else {
                states.choose.message.html('Be patient <b>'+game.player.name+'</b>, we are still trying - <small>'+(states.choose.tries++)+'</small>');  
                if(states.choose.tries > game.connectionLimit) states.load.reset();
              }
            });
          }, 1000);
        });
      }
      
      if(game.status == 'waiting'){
        this.message.html('Just wait <b>'+ game.player.name +'</b>, we are searching for an enemy player');
        game.player.type = 'challenged';

        this.tries = 0;          
        this.interval = setInterval(function(){ 
          //search for a challenger
          db({'get': game.id }, function(data){ 
            if(data){                         
              clearInterval(states.choose.interval);
              var found = JSON.parse(data);   
              //accept the challenge
              game.currentData = {
                challenged: game.player.name,
                challenger: found.challenger
              };
              db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){
                states.choose.countToBattle(found.challenger, 'challenger');
              });
            } else {
              states.choose.message.html('Be patient <b>'+game.player.name+'</b>, we are still searching - <small>'+(states.choose.tries++)+'</small>');                
              if(states.choose.tries > game.connectionLimit) states.load.reset(); // sugest bot match               
            }
          });

        }, 1000);

      }  
    },
    countToBattle: function(enemy, ch){     
      clearInterval(states.choose.interval);
      game.enemy = {name: enemy, type: ch};  
      this.message.html('Battle Found! <b>'+ game.player.name + '</b> vs <b>' + game.enemy.name +'</b>');
      this.counter.removeClass('hidden');
      //play sound and stuff!   
      game.status = 'picking';
      this.count = game.timeToPick;

      this.interval = setInterval(function(){ 
        states.choose.counter.text('Pick your deck, game starts in: '+(states.choose.count--));
        if(states.choose.count < 0){
          clearInterval(states.choose.interval); 
          states.choose.sendDeck();            
        }
      }, 1000);

      this.enablePick();
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
          states.choose.tries = 0;

          states.choose.interval = setInterval(function(){ 
            db({'get': game.id }, function(data){ 
              var found = JSON.parse(data); 
              if(found.challengerDeck){
                game.currentData = found;
                game.enemy.picks = game.currentData.challengerDeck.split('|');
                states.changeTo('table');
              } else {
                states.choose.message.html('Be patient <b>'+game.player.name+'</b>, your opponent is choosing - <small>'+(states.choose.tries++)+'</small>');
                if(states.choose.tries > game.connectionLimit) states.load.reset();
              }
            });
          }, 1000);

        });
      }

      if(game.player.type == 'challenger'){
        states.choose.tries = 0;  
        states.choose.interval = setInterval(function(){
          db({'get': game.id }, function(data){ 
            var found = JSON.parse(data); 
            if(found.challengedDeck){
              game.currentData = found;    
              game.currentData.challengerDeck = picks.join('|');
              game.enemy.picks = game.currentData.challengedDeck.split('|');
              db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){
                states.changeTo('table');
              });    
            } else {
              states.choose.message.html('Be patient <b>'+game.player.name+'</b>, your opponent is choosing. <small>'+(states.choose.tries++)+'</small>');
              if(states.choose.tries > game.connectionLimit) states.load.reset();
            }      
          });  
        }, 1000);   
      }
    },
    end: function(){
      clearInterval(states.choose.interval);
      $('.card').removeClass('active picked');
      $('.pickbox .card').appendTo(this.heroesDeck.el);
      this.counter.addClass('hidden');
      this.pickbox.addClass('hidden');
      this.prepickbox.addClass('hidden');
    }
  },
  'table': {
    build: function(){        
      this.message =  $('<p>').appendTo(this.el).attr({'class': 'message'}).text('Muuuuuuuuuuuuu!');
      
      this.turnCount =  $('<p>').appendTo(this.el).attr({'class': 'turnCount'}).text('Turns: 0 - 0');
      
      this.selectedArea = $('<div>').appendTo(this.el).attr({'class': 'selectedarea'});
      
      this.enemyArea = $('<div>').appendTo(this.el).attr({'class': 'enemyarea'});

      this.buildMap();   
      
      this.placeTowers(); 
      
      this.placeHeroes(); 
      
      this.buildSkills();    
      
      setTimeout(states.table.startTurns, 1000);
      
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
          
          card.el.addClass('player').click(states.table.select);
          
          Map.placeCard(card.el, Map.letters[c]+'4');
          
          c += 1;
        });
      });     

      this.enemyDeck = Deck('heroes', game.enemy.picks, function(enemyDeck){
        enemyDeck.el.appendTo(states.table.enemyArea);        
        var c = 11;
        $.each(enemyDeck.cards, function(id, card){      
        
          card.el.addClass('enemy').click(states.table.select);
          
          Map.placeCard(card.el, Map.letters[c]+'2');
          
          c -= 1;
        });
      });   
      
    },
    buildSkills: function(){
      
      //TODO
      
      console.log(game);
      
    },
    startTurns: function(){
      
      game.player.turn = 0;
      game.enemy.turn = 0;
            
      game.currentData[game.player.type + 'Turn'] = 0;
      game.currentData[game.enemy.type + 'Turn'] = 0;
      
      //storage.state = [];// todo: each hero hp position buffs etc, each player skill hand 
      
      game.currentData.moves = [];
      
      if(game.player.type == 'challenged') game.status = 'turn';
      if(game.player.type == 'challenger') game.status = 'unturn';
      
      states.table.countTurn();
      
    },
    countTurn: function(){
      clearInterval(states.table.countInterval);
      
      //game.storage = game.currentData state;
      
      states.table.el.removeClass('load').addClass(game.status);  
      
      if(game.status == 'turn'){        
        $('.card.done').removeClass('done');
        game.currentData.moves = [];
        if(game.selectedCard){
          Map.highlightMove(game.selectedCard);
          Map.highlightAttack(game.selectedCard);       
        }
      }
      
      states.table.turnCount.text('Turns: '+game.player.turn+' - '+game.enemy.turn);
      
      states.table.counter = game.timeToPlay;            
      states.table.countInterval = setInterval(function(){
        if(game.status == 'turn')
          states.table.message.text('Your turn is now, you have '+states.table.counter+' seconds to finish your moves');

        if(game.status == 'unturn')
          states.table.message.text('Your enemy is playing, your turn starts in '+states.table.counter+' seconds');
        
        states.table.counter--;
        
        if(states.table.counter < 0){
          clearInterval(states.table.countInterval);        
          
          if(game.status == 'turn') states.table.sendMoves();
          if(game.status == 'unturn') states.table.getMoves();
        }
        
      }, 1000);      
    },
    sendMoves: function(){
      Map.unhighlight();
      
      game.status = 'unturn';
      states.table.el.removeClass('turn').addClass('load');
      
      game.player.turn++;
      game.currentData[game.player.type + 'Turn']++;
      
      game.currentData.moves = game.currentData.moves.join('|');
      
      states.table.message.text('Uploading your moves...');
      db({'set': game.id, 'data': JSON.stringify(game.currentData)}, function(){        
        setTimeout(states.table.countTurn, 1000);
      });      
    },
    getMoves: function(){
      states.table.tries = 0;  
      states.table.el.removeClass('unturn').addClass('load');
      clearInterval(states.table.getInterval);
      states.table.getInterval = setInterval(function(){   
        db({'get': game.id }, function(data){ 
          game.currentData = JSON.parse(data);           
          if(game.currentData[game.enemy.type + 'Turn'] == (game.enemy.turn + 1) ){
            clearInterval(states.table.getInterval);    
            game.enemy.turn++;            
            states.table.executeMoves();            
          } else {
            states.table.message.html('Be patient <b>'+game.player.name+'</b>, downloading enemy move '+game.enemy.turn+'. <small>'+(states.table.tries++)+'</small>');
            if(states.table.tries > game.connectionLimit) states.load.reset();
          }
        });
      }, 1000);
    },
    
    select: function(){
      var card = $(this);      
      $('.card.selected').removeClass('selected');      
      Map.unhighlight();      
      game.selectedCard = card;
      if(game.status == 'turn'){
        Map.highlightMove(card); 
        Map.highlightAttack(card); 
      }
      states.table.selectedArea.empty();      
      var zoom = card.clone().appendTo(states.table.selectedArea);
      card.addClass('selected');
    },
    
    damage: function(attacker, target){
      if(typeof target == 'string') target = $('#'+target+' .card');
      if(typeof attacker == 'string') attacker = $('#'+attacker+' .card');
      var targetData = target.data('card');
      var hp = targetData.currenthp - attacker.data('card').damage;
      target.children('span.hp').text(hp);
      targetData.currenthp = hp;
      target.data('card', targetData);
    },
    
    attack: function(){
      if(game.status == 'turn' && !game.selectedCard.hasClass('done')){ 
        var fromSpot = Map.getPosition(game.selectedCard);
        var toSpot = Map.getPosition($(this));
        game.currentData.moves.push('A:'+fromSpot+':'+toSpot);
        states.table.damage(fromSpot, toSpot);
        game.selectedCard.addClass('done');        
      }
      Map.unhighlight();
      return false;
    },
    
    move: function(){
      if(game.status == 'turn' && !game.selectedCard.hasClass('done')){
        var fromSpot = Map.getPosition(game.selectedCard);
        var toSpot = Map.getPosition($(this));
        Map.moveCard(fromSpot, toSpot);        
        game.currentData.moves.push('M:'+fromSpot+':'+toSpot);
        game.selectedCard.addClass('done');
      }
      Map.unhighlight();
      return false;
    },
    
    executeMoves: function(moves){
      states.table.message.html('Your enemy moved. Get ready!');
      var moves = game.currentData.moves.split('|');
      for(var m = 0; m < moves.length; m++){
        var move = moves[m].split(':');
        if(move[0] == 'M'){
          var fromSpot = Map.mirrorPosition(move[1]),
              toSpot = Map.mirrorPosition(move[2]);
          
          Map.moveCard(fromSpot, toSpot);
        }        
        if(move[0] == 'A'){
          var fromSpot = Map.mirrorPosition(move[1]),
              toSpot = Map.mirrorPosition(move[2]);
          
          states.table.damage(fromSpot, toSpot);
        }        
      }      
      setTimeout(function(){
        game.status = 'turn';
        states.table.countTurn();
      }, 1000);
    }
  }
};

states.build();  

//start the game
game.states.changeTo('intro');  




