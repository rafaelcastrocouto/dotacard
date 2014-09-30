/*
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
    if(newstate.el) newstate.el.removeClass('hidden').append(game.message, game.loader, game.triesCounter);
    states.currentstate = state;
    if(newstate.start) newstate.start();
  },
  
  build: function(){
    $.each(states, function(id){
      if(id == 'load' || id == 'el' || id == 'changeTo' || id == 'build' || id == 'currentstate') return;
      states[id].el = $('<div>').attr('id',id).appendTo(states.el).addClass('hidden');
      if(states[id].build) {
        states[id].build();
        states[id].builded = true;
      }
    });      
    game.states = states;
    game.states.changeTo('intro');
  }, 
  
  currentstate: 'load',

  ////////////////////////////////////////////////////////////////////////////////////////
  'load': {
  ////////////////////////////////////////////////////////////////////////////////////////  
    
    end: function(){
      console.log('Welcome to DotaCard!');
      if(!game.debug){
        window.oncontextmenu = game.nomenu;
        window.onbeforeunload = function(){
          return 'Sure you wanna leave?';
        };
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
      var sure = confirm('Sure you wanna leave?');
      if(sure) location.reload(true);
    }
  },
  
  ////////////////////////////////////////////////////////////////////////////////////////
  'intro': {   
  ////////////////////////////////////////////////////////////////////////////////////////  
    
    build: function(){        
      if(!game.debug){ 
        this.video = $('<div>').addClass('introvideo').hide().appendTo(this.el).tubular({
          videoId: '-cSFPIwMEq4',
          scale: 1.2,
          onReady: function(video){
            states.intro.videoLoaded = true;
            if(states.currentstate == 'intro' && game.status != 'playing'){              
              states.intro.playVideo();
            }
          }
        });  
        this.box = $('<div>').hide().appendTo(this.el).addClass('box');
        this.text = $('<p>').appendTo(this.box).addClass('intro').html('DotaCard <a target="_blank" href="http://scriptogr.am/rafaelcastrocouto">beta</a>');
      }
    },
    
    start: function(){
      if(!game.debug){
        if(this.videoLoaded && game.status != 'playing') this.playVideo();
        this.box.fadeIn(3000);
      } else {
        states.changeTo('login'); 
      }
    },
    
    playVideo: function(){
      game.status = 'playing';
      game.loader.hide();
      this.box.delay(6000).fadeOut(3000);
      this.video.delay(3000).fadeIn(3000);
      setTimeout(function(){
        var player = states.intro.video.data('tubular-player');
        player.seekTo(0);
        player.playVideo();
      }, 3000);
      game.timeout = setTimeout(function(){
        states.intro.pauseVideo();     
        states.changeTo('login');
      }, 102600);
      this.el.click(function(){
        clearTimeout(game.timeout);
        states.intro.pauseVideo();    
        states.changeTo('login');
      });      
    },
    
    pauseVideo: function(){
      game.status = 'paused';
      var player = states.intro.video.data('tubular-player');
      player.pauseVideo();      
    }
  },
  
  ////////////////////////////////////////////////////////////////////////////////////////
  'login': {  
  ////////////////////////////////////////////////////////////////////////////////////////
    
    build: function(){       
      this.menu = $('<div>').appendTo(this.el).addClass('box');
      this.title = $('<h1>').appendTo(this.menu).text('Choose a name');
      this.input = $('<input>').appendTo(this.menu).attr({ 'placeholder': 'Type any name here', 'type': 'text'})
      .keydown(function(e){
        if(e.which == 13) states.login.button.click();
      });    
      var c = 'Choose a name and click to play';
      this.button = $('<button>').appendTo(this.menu).attr({'placeholder': c, 'title': c}).text('Play')
      .click(function(){        
        var name = states.login.input.val();        
        if(!name) states.login.input.focus();
        else {
          game.player.name = name;
          states.login.button.attr( "disabled", true );
          game.loader.show();
          db({'get':'server'}, function(server){
            if(server.status == 'online'){
              game.status = 'logged';
              states.changeTo('menu');
            }
            else states.load.reset();
          });            
        } 
      });
      this.text = $('<div>').appendTo(this.menu);
      this.logwith = $('<p>').appendTo(this.text).html('Login with: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Facebook, Google</a>');
      this.lang = $('<p>').appendTo(this.text).html('Language: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Translate</a>');
    },
    
    start: function(){
      game.loader.hide();
      this.input.focus();
      game.status = 'logging';
    },
    
    end: function(){
      this.button.attr( "disabled", false );
    },
  },
  
  ////////////////////////////////////////////////////////////////////////////////////////
  'menu': {
  ////////////////////////////////////////////////////////////////////////////////////////  
    
    build: function(){      
      this.text = $('<p>').appendTo(this.el);
      this.logout = $('<small>').appendTo(this.text).text('Logout').click(states.load.quit);
      this.menu = $('<div>').appendTo(this.el).addClass('box'); 
      this.title = $('<h1>').appendTo(this.menu).text('Choose a game mode');
      this.public = $('<button>').appendTo(this.menu).attr({'title': 'Find an adversary online'}).text('Play public match')
      .click(function(){        
        states.menu.public.attr( "disabled", true );
        db({'get':'waiting'}, function(waiting){          
          if(waiting.id == 'none'){
            game.id = btoa(new Date().valueOf() +''+ parseInt(Math.random()*10E10));
            var myGame = {id: game.id};
            db({'set': 'waiting', 'data': myGame}, function(){ 
              game.status = 'waiting';
              states.changeTo('choose');
            });
            
          } else {             
            game.id = waiting.id;         
            game.status = 'found';
            var clearWait = {id: 'none'};            
            db({'set': 'waiting', 'data': clearWait}, function(){               
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
    
    start: function(){
      game.loader.hide();
      this.text.html('Welcome <b>'+game.player.name+'</b>! ');
    },
    
    end: function(){
      states.menu.public.attr( "disabled", false );
    }
  },
  
  ////////////////////////////////////////////////////////////////////////////////////////
  'choose': {   
  ////////////////////////////////////////////////////////////////////////////////////////  
    
    build: function(){    
      this.pickbox = $('<div>').appendTo(this.el).attr({'class': 'pickbox'});
      this.pickedbox = $('<div>').appendTo(this.el).attr({'class': 'pickedbox'}).addClass('hidden').on('contextmenu', game.nomenu);
      for(var slot = 0; slot < 5; slot++){
        $('<div>').appendTo(this.pickedbox).attr({title: 'Click here to pick'}).data('slot', slot).addClass('slot available');
      }
      this.prepickbox = $('<div>').appendTo(this.el).attr({'class': 'prepickbox'}).html('My Decks<br>Comming soon...').addClass('hidden');
      this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').addClass('hidden');
      
      this.pickDeck = Deck('heroes', function(pickDeck){
        pickDeck.addClass('pickdeck').appendTo(states.choose.pickbox);
        states.choose.size = 100;
        $.each(pickDeck.data('cards'), function(id, card){
          card.data('place', card.index());  
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
    },
    
    start: function(){
      this.findGame();
    },

    findGame: function(){   
      game.tries = 1;        
      if(game.status == 'found'){
        game.message.text('We found a game! Connecting ');
        game.loader.show();
        game.player.type = 'challenger';
        game.currentData.challenger = game.player.name;
        db({'set': game.id, 'data': game.currentData}, function(){
          states.choose.getChallenged();
        });        
      } 
      if(game.status == 'waiting'){
        game.message.text('Searching for an enemy ');
        game.loader.show();
        game.player.type = 'challenged';
        states.choose.getChallenger();
      }  
    },
    
    getChallenged: function(){
      db({'get': game.id }, function(found){         
        if(found.challenged){
          game.triesCounter.text('');
          game.currentData = found;  
          states.choose.battle(found.challenged, 'challenged');
        } else {
          game.triesCounter.text('('+(game.tries++)+')');  
          if(game.tries > game.connectionLimit) states.load.reset();
          else game.timeout = setTimeout(states.choose.getChallenged, 1000);
        }
      });
    },

    getChallenger: function(){
      db({'get': game.id }, function(found){
        if(found.challenger){
          game.triesCounter.text('');
          game.currentData = found;
          game.currentData.challenged = game.player.name;
          db({'set': game.id, 'data': game.currentData}, function(){
            states.choose.battle(found.challenger, 'challenger');
          });          
        } else {
          game.triesCounter.text('('+(game.tries++)+')');                
          if(game.tries > game.waitLimit) states.load.reset(); //todo: sugest bot match         
          else game.timeout = setTimeout(states.choose.getChallenger, 1000);
        }
      });
    },

    battle: function(enemy, challenge){     
      game.status = 'picking';
      game.loader.hide();
      this.el.addClass('turn');
      game.enemy = {name: enemy, type: challenge}; 
      game.message.html('Battle Found! <b>'+ game.player.name + '</b> vs <b>' + game.enemy.name+'</b>');                
      this.counter.removeClass('hidden');
      //todo: play sound and stuff!         
      this.count = game.debug ? 1 : game.timeToPick;
      this.enablePick();
      clearTimeout(game.timeout);
      game.timeout = setTimeout(states.choose.pickCount, 1000);      
    },

    enablePick: function(){
      this.pickedbox.removeClass('hidden');
      this.prepickbox.removeClass('hidden');
      $('.slot').on('click.pick contextmenu.pick', states.choose.pick);
    },
    
    disablePick: function(){
      game.status = 'battle';
      $('.slot').off('click.pick contextmenu.pick', states.choose.pick);
    },

    pick: function(){
      var slot = $(this);
      if(slot.hasClass('available')){
        var pick = $('.pickbox .card.active');
        if(pick.length){
          slot.removeClass('available');
          pick.removeClass('active').appendTo(slot);
        }
      } else {        
        var card = slot.children('.card').addClass('active');
        if(card.length){
          $('.pickbox .card.active').removeClass('active');
          var cardInPlace = $('.pickbox .deck').children()[card.data('place')];
          $(cardInPlace).before(card);
          states.choose.pickDeck.css('left', card.index() * states.choose.size * -1);
          slot.addClass('available');
        }
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
      game.player.picks = [];
      $('.pickbox .card.active').removeClass('active');
      $('.slot').each(function(){
        var slot = $(this), card;
        if(slot.hasClass('available')){
          card = Deck.randomCard($('.pickbox .card'));
          slot.append(card).removeClass('available');
        } else {
          card = $('.card', slot);
        }       
        game.player.picks[slot.data('slot')] = card.data('hero');
        if(game.player.picks.length == 5) states.choose.sendDeck();        
      });   
    },

    sendDeck: function(){     
      this.el.removeClass('turn'); 
      states.choose.pickDeck.css('left', 0);
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
      game.message.text('Loading challenger deck');
      game.loader.show();
      db({'get': game.id }, function(found){         
        if(found.challengerDeck){
          game.triesCounter.text('');
          game.currentData = found;
          game.enemy.picks = game.currentData.challengerDeck.split('|');
          states.changeTo('table');          
        } else {
          game.triesCounter.text('('+(game.tries++)+')');
          if(game.tries > game.connectionLimit) states.load.reset();
          else game.timeout = setTimeout(states.choose.getChallengerDeck, 1000);
        }
      });
    },

    getChallengedDeck: function(){
      game.message.text('Loading enemy deck');
      game.loader.show();
      db({'get': game.id }, function(found){         
        if(found.challengedDeck){ 
          game.triesCounter.text('');
          game.currentData = found;    
          game.currentData.challengerDeck = game.player.picks.join('|');
          game.enemy.picks = game.currentData.challengedDeck.split('|');
          db({'set': game.id, 'data': game.currentData}, function(){
            states.changeTo('table');
          });              
        } else {
          game.triesCounter.text('('+(game.tries++)+')');
          if(game.tries > game.connectionLimit) states.load.reset();
          else game.timeout = setTimeout(states.choose.getChallengedDeck, 1000);
        }      
      });  
    },

    end: function(){           
      clearTimeout(game.timeout);                   
      this.pickedbox.addClass('hidden');
      this.prepickbox.addClass('hidden');       
      $('.pickedbox .card').appendTo(this.pickDeck);
      $('.slot').addClass('available');
      this.counter.addClass('hidden');
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  'table': {
  ////////////////////////////////////////////////////////////////////////////////////////
    
    build: function(){      
      this.time =  $('<p>').appendTo(this.el).addClass('time').text('Time: 0:00 Day Turns: 0/0 (0)');
      this.selectedArea = $('<div>').appendTo(this.el).addClass('selectedarea');
      this.buildMap();        
    },
    
    start: function(){      
      if(game.status == 'battle'){
        game.message.text('Muuuuuuuuuuuuu!');
        game.loader.show(); 
        this.placeTowers(); 
        this.placeHeroes(); 
        this.buildSkills(); 
        this.buildTurns(); 
        //todo: build storage.state
        game.timeout = setTimeout(states.table.beginTurn, 1000);
      }
    },
    
    buildMap: function(){
      this.map = Map.build({
        'width': game.width,
        'height': game.height,
        'class': 'map'
      }).appendTo(this.el);
    },
    
    createTower: function(type, spot){
      var tower = Card({
        className: 'towers static '+type,
        name: 'Tower',        
        attribute: 'Building',
        attackType: 'Ranged',
        damage: 7,
        hp: 80
      });        
      tower.click(Card.select).place(spot);
      Map.around(spot, 4, function(td){
         td.addClass(type == 'player' ? 'playerarea' : 'enemyarea');
      }, true);
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
      if(game.player.picks && game.enemy.picks){
        game.player.mana = 0;      
        this.playerHeroesDeck = Deck('heroes', game.player.picks, function(deck){        
          deck.addClass('player').appendTo(states.table.el);
          var x = 0, y = 3;
          $.each(deck.data('cards'), function(i, card){          
            card.addClass('player').click(Card.select);
            card.place(Map.toId(x,y)); 
            x++;
            game.player.mana += card.data('mana');
          });
        });  

        this.enemyHeroesDeck = Deck('heroes', game.enemy.picks, function(deck){
          deck.addClass('enemy').hide().appendTo(states.table.el);        
          var x = 11, y = 1;
          $.each(deck.data('cards'), function(i, card){       
            card.addClass('enemy').click(Card.select);          
            card.place(Map.toId(x,y));          
            x--;
          });
        }); 
      }
    },
    
    buildSkills: function(){      
      game.player.cardsPerTurn = 1 + Math.round(game.player.mana/10);      
      game.player.maxCards = Math.round(game.player.mana/2);      
      this.playerHand = $('<div>').appendTo(this.el).addClass('player skills hand');
      this.playerPermanent = $('<div>').appendTo(this.el).addClass('player skills hand permanent');
      this.playerUlt = $('<div>').hide().appendTo(this.el).addClass('player skills ult');      
      this.playerCemitery = $('<div>').hide().appendTo(this.el).addClass('player skills cemitery');
      this.playerSkillsDeck = Deck('skills', game.player.picks, function(deck){        
        deck.addClass('player').hide().appendTo(states.table.el);
        $.each(deck.data('cards'), function(i, skill){   
          skill.addClass('player').click(Card.select);
          if(skill.data('special')) {
            if(skill.data('special') == 'permanent') skill.appendTo(states.table.playerPermanent);
            if(skill.data('special') == 'ult') skill.appendTo(states.table.playerUlt);
          }        
        });        
      });
      this.enemySkillsDeck = Deck('skills', game.player.picks, function(deck){        
        deck.addClass('enemy').hide().appendTo(states.table.el);
        $.each(deck.data('cards'), function(i, skill){   
          skill.addClass('enemy');        
        });        
      });
    },
    
    selectHand: function(){      
      for(var i=0; i<game.player.cardsPerTurn; i++){
        if(states.table.playerHand.children().length < game.player.maxCards){
          var availableSkills = $('.deck.skills.player .card');
          var card = Deck.randomCard(availableSkills);
          card.appendTo(states.table.playerHand);
        }
      }      
    },
    
    buildTurns: function(){
      game.time = 0;      
      game.player.turn = 0;
      game.enemy.turn = 0;
      game.currentData.moves = [];
      if(game.player.type == 'challenged') game.status = 'turn';
      if(game.player.type == 'challenger') game.status = 'unturn';         
    },
    
    beginTurn: function(){      
      //todo: update storage.state = game.state - each hero hp position buffs etc, each player skill hand
      if(game.status != 'over') {        
        states.table.el.addClass(game.status);
        if(game.status == 'turn') game.message.text('Your turn now!');
        if(game.status == 'unturn') game.message.text('Enemy turn now!');        
        $('.card .damage').remove();
        $('.card.dead').each(function(){
          var dead = $(this);
          if(game.time > dead.data('reborn')) dead.reborn();
        });         
        if(game.status == 'turn'){
          states.table.selectHand();
          $('.card.player.done').removeClass('done');        
          game.currentData.moves = [];        
          states.table.towerAutoAttack();        
          Map.highlight(); 
        }
        game.time = game.player.turn + game.enemy.turn;  
        states.table.counter = game.timeToPlay;
        clearTimeout(game.timeout);
        game.timeout = setTimeout(states.table.turnCount, 1000);
      }
    },
    
    turnCount: function(){
      game.loader.hide();
      states.table.time.text('Time: '+states.table.hours()+' '+states.table.dayNight()+' Turns: '+game.player.turn+'/'+game.enemy.turn +' ('+parseInt(game.time)+')');     
      if(game.status == 'turn') game.message.text('Your turn, you have '+states.table.counter+' seconds');
      if(game.status == 'unturn') game.message.text('Enemy turn ends in '+states.table.counter+' seconds');        
      if(states.table.counter-- < 1){
        if(game.status == 'turn') states.table.sendMoves();
        if(game.status == 'unturn') states.table.getMoves();    
      } else {
        game.time += 1 / game.timeToPlay;
        game.timeout = setTimeout(states.table.turnCount, 1000);
      }
    },
    
    sendMoves: function(){
      game.message.text('Uploading your turn '+game.player.turn);
      game.loader.show();
      Map.unhighlight();       
      game.status = 'unturn';
      states.table.el.removeClass('turn');
      game.player.turn++;
      game.currentData[game.player.type + 'Turn'] = game.player.turn;      
      game.currentData.moves = game.currentData.moves.join('|');      
      clearTimeout(game.timeout);
      states.table.sendData();
    },

    getMoves: function(){
      game.message.text('Loading enemy turn '+(game.enemy.turn + 1));
      game.loader.show();
      game.tries = 1;  
      states.table.el.removeClass('unturn');
      clearTimeout(game.timeout);
      game.timeout = setTimeout(states.table.getData, 1000);
    },

    sendData: function(){
      db({'set': game.id, 'data': game.currentData}, function(){
        clearTimeout(game.timeout);
        game.timeout = setTimeout(states.table.beginTurn, 1000);
      });      
    },

    getData: function(){        
      db({'get': game.id }, function(data){                    
        if(data[game.enemy.type + 'Turn'] == (game.enemy.turn + 1) ){
          game.triesCounter.text('');
          game.currentData = data;
          game.enemy.turn++;
          states.table.executeEnemyMoves();            
        } else {
          game.triesCounter.text('('+(game.tries++)+')');
          if(game.tries > game.connectionLimit) states.load.reset();
          else game.timeout = setTimeout(states.table.getData, 1000);
        }
      });
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
      else return 'Night';
    },
    
    moveSelected: function(){
      var spot = $(this), card = game.selectedCard;
      if(game.selectedCard.hasClass('skills') && game.selectedCard.data('hero')) card = $('.map .card.player.'+game.selectedCard.data('hero'));
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

    passiveSelected: function(){
      var target = $(this), skill = game.selectedCard;
      var hero = skill.data('hero');
      var skillid = skill.data('skill');
      if(hero && skillid && game.status == 'turn'){ 
        game.currentData.moves.push('P:'+toSpot+':'+hero+':'+skillid); 
        skill.activate(target);
        var t = skill.offset(), d = target.offset();
        skill.css({top: d.top - t.top - 22, left: d.left - t.left - 22, transform: 'scale(0.3)'});
        setTimeout(function(){          
          $(this.card).css({top: '', left: '', transform: ''}).appendTo(this.destiny);
          source.select();
        }.bind({ card: skill, destiny: states.table.playerCemitery }), 500);        
      }
    },
    
    castWithSelected: function(){
      var target = $(this), skill = game.selectedCard, source = game.castSource;
      var fromSpot = Map.getPosition(source);
      var toSpot = Map.getPosition(target);  
      var hero = skill.data('hero');
      var skillid = skill.data('skill');
      if(hero && skillid && fromSpot && toSpot && game.status == 'turn' && !source.hasClass('done')){ 
        game.currentData.moves.push('C:'+fromSpot+':'+toSpot+':'+skillid+':'+hero); 
        source.cast(skill, target);    
        var t = skill.offset(), d = target.offset();
        skill.css({top: d.top - t.top - 22, left: d.left - t.left - 22, transform: 'scale(0.3)'});
        setTimeout(function(){          
          $(this.card).css({top: '', left: '', transform: ''}).appendTo(this.destiny);
          source.select();
        }.bind({ card: skill, destiny: states.table.playerCemitery }), 500);           
      }
    },

    executeEnemyMoves: function(){
      game.message.text('Your enemy moved. Get ready!');
      $('.card.enemy.done').removeClass('done');
      var moves = game.currentData.moves.split('|');      
      for(var m = 0; m < moves.length; m++){
        var move = moves[m].split(':');
        var fromSpot = Map.mirrorPosition(move[1]), toSpot = Map.mirrorPosition(move[2]);
        var source, target, hero, skillid, skill, sk;
        
        if(move[0] == 'M'){   
          target = $('#'+fromSpot+' .card');
          if(toSpot && !target.hasClass('done') && target.hasClass('enemy') && target.move) target.move(toSpot);
        }        
        if(move[0] == 'A'){
          source = $('#'+fromSpot+' .card');
          if(toSpot && !source.hasClass('done') && source.hasClass('enemy') && source.attack) source.attack(toSpot);
        }        
        if(move[0] == 'C'){
          skillid = move[3]; 
          hero = move[4];   
          source = $('#'+fromSpot+' .card');
          target = $('#'+toSpot+' .card');
          sk = skills[hero][skillid].cast;
          skill = $('.enemy.skills .'+hero+'-'+skillid);
          if(sk && skill && !source.hasClass('done') && source.hasClass('enemy') && source.cast) source.cast(skill, target);
        }         
        if(move[0] == 'P'){
          skillid = move[3]; 
          hero = move[4];
          target = $('#'+toSpot+' .card');
          sk = skills[hero][skillid].passive;
          skill = $('.enemy.skills .'+hero+'-'+skillid);
          if(sk && skill && target.hasClass('enemy') && skill.passive) skill.passive(target);
        }        
      }      
      clearTimeout(game.timeout);
      game.timeout = setTimeout(function(){
        game.status = 'turn';
        states.table.beginTurn();
      }, 2000);
    },

    lose: function(){
      states.table.el.addClass('unturn');
      game.message.text('Game Over!');
      game.status = 'over';      
      states.table.showResults();
    },

    win: function(){
      states.table.el.addClass('turn');
      game.message.text('Congratulations, you won!');
      game.status = 'over';      
      states.table.showResults();
    },

    showResults: function(){
      console.log(game);
    }
  
  } 
  //table end
};
// states end /////////////////////////////////////////////////////////

//start the game///
$(states.build);
///////////////////
