/* by rafælcastrocouto */
var game = { 
  vs: 0.064,
  debug: (location.host == "localhost"),   
  id: null, currentData: {}, currentstate: 'load', 
  status: 'loading', mode: '',
  scrollspeed: 0.4,
  skills: null, heroes: null, buffs: null, units: null, //json
  container: $('.container').first(), 
  loader: $('<span>').addClass('loader'), 
  message: $('<p>').addClass('message'), 
  tries: 0, triesCounter: $('<small>').addClass('triescounter'), 
  timeToPick: 30, timeToPlay: 10, waitLimit: 90, connectionLimit: 30, //seconds
  dayLength: 10, deadLength: 10, //turns   
  map: null, width: 12,  height: 5, //slots   
  seed: null, 
  nomenu: function(){return false;}, 
  start: function(){
    if(window.JSON && 
       window.btoa && window.atob &&
       window.AudioContext && 
       window.XMLHttpRequest &&
       Modernizr.backgroundsize && 
       Modernizr.boxshadow && 
       Modernizr.cssanimations &&
       Modernizr.csstransforms &&
       Modernizr.csstransitions &&
       Modernizr.generatedcontent &&
       Modernizr.opacity &&
       Modernizr.rgba ) 
      
      game.load();
    
    else $('.unsupported').show();
  },
  load: function(){
    game.states.load.fonts();
    game.states.load.youtube();
    game.states.load.images();
    game.audio.load();
    game.states.load.language(function(){      
      game.states.load.data(function(){
        game.states.build();
      });           
      game.states.load.analytics();         
    });
  },  
  player: {
    
    buy: function(){
      if(game.player.turn == 6 || game.debug) $('.player.deck.skills.ult .card').appendTo(game.states.table.playerSkillsDeck);
      var availableSkills = $('.skills.available.player.deck .card');        
      var card = Deck.randomCard(availableSkills);
      card.appendTo(game.states.table.playerHand);
      if(card.data('target') == 'Autoactivate') {
        var heroid = card.data('hero');        
        var hero = $('.map .player.heroes.'+heroid);
        var toSpot = Map.getPosition(hero);
        card.activate(toSpot); 
        game.currentData.moves.push('P:'+toSpot+':'+card.data('skill')+':'+heroid); 
      }
    },
    
    buyhand: function(){      
      for(var i=0; i<game.player.cardsPerTurn; i++){
        if(game.states.table.playerHand.children().length < game.player.maxCards) 
          game.player.buy();
      }      
    }
    
  },   
  enemy: {
    
    playtime: 2, //seconds
    
    buy: function(){ 
      game.enemy.hand++;
      game.random(); 
    },
    
    buyhand: function(){
      for(var i=0; i<game.enemy.cardsPerTurn; i++){
        if(game.enemy.hand < game.enemy.maxCards){
          game.enemy.buy();
        }
      }      
    }
    
  },
  tutorial: {
    
    build: function(){
      game.mode = 'tutorial';
      game.seed = new Date().valueOf();
      game.id = btoa(game.seed);
      game.message.text(game.language.waiting);
      game.states.choose.counter.show().text(game.language.rightpick);
      game.enemy.name = 'axe'; 
      game.enemy.type = 'challenged';
      game.player.type = 'challenger';
      game.audio.play('tutorial/axe1');
      game.states.choose.count = game.debug ? 10 : game.timeToPick;
      game.states.choose.enablePick();   
      game.tutorial.axe =  $('<div>').addClass('axe tutorial').appendTo(game.states.choose.el);      
      game.tutorial.axeimg = $('<div>').addClass('img').appendTo(game.tutorial.axe);
      game.tutorial.axebaloon = $('<div>').addClass('baloon').appendTo(game.tutorial.axe);
      game.tutorial.message = $('<div>').addClass('txt').appendTo(game.tutorial.axebaloon).html(game.language.axepick);
      game.tutorial.axebaloon.hide();
      setTimeout(function(){ game.tutorial.axe.addClass('up'); }, 1000);
      setTimeout(function(){ 
        game.tutorial.axebaloon.fadeIn('slow'); 
        game.message.text(game.language.tutorialstart);
        game.loader.removeClass('loading');
      }, 2000);      
    },
    
    pick: function(){
      game.player.mana = 0;      
      $('.slot .card').each(function(){
        var card = $(this);
        game.player.mana += card.data('mana');
      });
      game.player.cardsPerTurn = 1 + Math.round(game.player.mana/10);
      game.tutorial.oldAvailableSlots = 5;
      var availableSlots = $('.slot.available').length;
      if(availableSlots == 4) game.tutorial.message.html(game.language.axeheroes);        
      else if(availableSlots == 3)  game.tutorial.message.html(game.language.axemaxcards);
      else if(availableSlots == 2) game.tutorial.message.html(game.language.axecardsperturn);
      else if(availableSlots == 1) game.tutorial.message.html(game.language.axeautodeck);            
      if(availableSlots < game.tutorial.oldAvailableSlots) game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.oldAvailableSlots = availableSlots;
      if(availableSlots) game.states.choose.counter.text($('.slot.available').length + ' ' + game.language.togo + '. ' + game.language.cardsperturn+': '+ game.player.cardsPerTurn); 
      else {    
        game.message.text(game.language.getready);
        game.states.choose.counter.text(game.language.cardsperturn+': '+ game.player.cardsPerTurn);
        game.tutorial.message.html(game.language.axebattle);
        game.audio.play('tutorial/axe2');
        setTimeout(function(){
          game.tutorial.deck();
        }, 2000);
      }
    },
    
    deck: function(){      
      game.player.picks = []; 
      $('.slot').each(function(){
        var slot = $(this);
        var card = slot.find('.card');
        game.player.picks[slot.data('slot')] = card.data('hero');
        if(game.player.picks.length == 5) game.states.changeTo('table');    
      });   
    },
    
    start: function(){
      game.message.text(game.language.battle);
      game.loader.removeClass('loading');
      game.audio.play('horn');
      game.tutorial.placeHeroes(); 
      game.states.table.placeTowers();
      game.states.table.placeTrees();       
      game.states.table.buildUnits();      
      game.tutorial.started = true;
      game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
      game.tutorial.axebaloon.hide();
      game.tutorial.lessonSelectEnemy = true;
      game.states.table.time.text(game.language.time+': 0:00 '+game.language.day); 
      setTimeout(function(){game.tutorial.axe.addClass('up')}, 500);
      setTimeout(game.tutorial.selectEnemy, 1000);
      game.player.kills = 0;
      game.enemy.kills = 0;
    },
    
    placeHeroes: function(){
      game.player.mana = 0;
      this.playerHeroesDeck = Deck({
        name: 'heroes', 
        filter: game.player.picks, 
        cb: function(deck){
          deck.addClass('player').appendTo(game.states.table.el);
          var x = 0, y = 3;
          $.each(deck.data('cards'), function(i, card){   
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player hero').data('side','player').on('click.select', game.tutorial.select);
            card.place(Map.toId(x + p,y));
            game.player.mana += card.data('mana');
          });
        }
      });  
      game.enemy.picks = ['am','kotl','pud','ld','nyx'];
      this.enemyHeroesDeck = Deck({
        name: 'heroes', 
        filter: game.enemy.picks, 
        cb: function(deck){
          deck.addClass('enemy').hide().appendTo(game.states.table.el);        
          var x = 0, y = 3;
          $.each(deck.data('cards'), function(i, card){
            var p = game.enemy.picks.indexOf(card.data('hero'));
            card.addClass('enemy hero').data('side','enemy').on('click.select', game.tutorial.select);  
            card.place(Map.mirrorPosition(Map.toId(x + p,y))); 
          });
        }
      }); 
    },
    
    selectEnemy: function(){          
      game.tutorial.axebaloon.fadeIn('slow');
      game.tutorial.message.html(game.language.axeselectenemy);
      game.message.text(game.language.yourturncount+' 5');      
      $('.map .enemy.hero').addClass('tutorialblink');
    },   
    
    select: function(){
      var card = $(this);
      if(game.tutorial.lessonSelectEnemy){
        if(card.hasAllClasses('hero enemy')){
          $('.map .enemy.hero').removeClass('tutorialblink');
          game.tutorial.lessonSelectEnemy = false;
          game.tutorial.zoom();
        }
      }
      if(game.tutorial.lessonSelectPlayer){
        if(card.hasAllClasses('hero player')){
          $('.map .player.hero').removeClass('tutorialblink');
          game.tutorial.lessonSelectPlayer = false;          
          game.tutorial.move();
        }
      }       
      if(game.tutorial.lessonSelectSkill){
        if(card.hasAllClasses('skill player')){
          $('.player.skill').removeClass('tutorialblink');
          game.tutorial.lessonSelectSkill = false;          
          game.tutorial.skill();
        }
      }      
      card.select();
    },
    
    zoom: function(){
      game.tutorial.lessonZoom = true;
      game.tutorial.axe.css({
        right: '',
        left: '0',
        transform: 'scaleX(-1)'
      });
      game.tutorial.axebaloon.hide().fadeIn('slow');      
      game.tutorial.message.html(game.language.axezoom).css({transform: 'scaleX(-1)'});
      game.message.text(game.language.yourturncount+' 4');
      game.states.table.selectedArea.addClass('tutorialblink');
      game.states.table.selectedArea.on('mouseover.tutorial', '.card', game.tutorial.over);
    },   

    over: function(){
      if(game.tutorial.lessonZoom){
        var card = $(this);
        game.states.table.selectedArea.removeClass('tutorialblink'); 
        game.tutorial.unselect();
        game.tutorial.lessonZoom = false;
      }
    },
        
    unselect: function(){
      game.tutorial.lessonUnselect = true;
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.message.html(game.language.axeunselect);   
      game.message.text(game.language.yourturncount+' 3');
      game.states.table.selectedArea.on('unselect.tutorial', game.tutorial.unselected);
    }, 

    unselected: function(){
      if(game.tutorial.lessonUnselect){
        game.tutorial.selectPlayer();
        game.tutorial.lessonUnselect = false;
      }
    },
    
    selectPlayer: function(){
      game.tutorial.lessonSelectPlayer = true;
      $('.map .player.hero').addClass('tutorialblink');
      game.tutorial.axe.css({left: '', transform: ''});
      game.tutorial.message.css({transform: ''});
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.message.html(game.language.axeselectplayer);   
      game.message.text(game.language.yourturncount+' 2');
    },    
    
    move: function(){
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.message.html(game.language.axemove);
      game.status = 'turn';
      game.message.text(game.language.yourturncount+' 1');
      $('.map .hero.player').on('move', game.tutorial.done);
    },    
    
    done: function(){
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.message.html(game.language.axedone);
      game.message.text(game.language.enemyturn);
      game.message.addClass('tutorialblink');
      game.status = 'unturn';
      setTimeout(game.tutorial.wait, 4000);
    },
    
    wait: function(){
      game.tutorial.axebaloon.hide().fadeIn('slow');      
      game.tutorial.message.html(game.language.axewait);
      game.message.text(game.language.enemyturncount+' 2');
      game.states.table.time.text(game.language.time+': 1:30 '+game.language.night); 
      game.message.removeClass('tutorialblink');
      game.states.table.time.addClass('tutorialblink');
      setTimeout(game.tutorial.time, 4000);
    },    
    
    time: function(){
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.message.text(game.language.enemyturncount+' 1');
      game.tutorial.message.html(game.language.axetime);
      game.states.table.time.removeClass('tutorialblink');      
      game.states.table.turns.addClass('tutorialblink');
      game.states.table.turns.text(game.language.turns+': 1/1 (2)')
      setTimeout(game.tutorial.enemyMove, 4000);
    },
    
    enemyMove: function(){
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.message.html(game.language.axeenemymove);
      game.message.html(game.language.enemymove);
      game.states.table.turns.removeClass('tutorialblink');
      var am = $('.map .enemy.hero.am');
      if($('#E3').hasClass('block')) am.place('F4').addClass('tutorialblink');
      else am.place('E3').addClass('tutorialblink');            
      setTimeout(game.tutorial.attack, 4000);
    },   
    
    attack: function(){
      $('.player.hero').removeClass('done');
      game.status = 'turn';
      game.tutorial.buildSkills();
      game.tutorial.axebaloon.hide().fadeIn('slow');       
      game.tutorial.message.html(game.language.axeattack);
      game.message.html(game.language.yourturn);
      if(game.selectedCard) game.selectedCard.select();
      $('.player.hero').on('attack.tutorial', game.tutorial.skillSelect);
    },
    
    buildSkills : function(){
      game.player.maxCards = Math.round(game.player.mana/2);  
      game.player.cardsPerTurn = 1 + Math.round(game.player.mana/10);
      
      game.states.table.playerHand = $('<div>').hide().appendTo(game.states.table.el).addClass('player deck skills hand');
       game.states.table.playerCemitery = $('<div>').hide().appendTo(game.states.table.el).addClass('player deck skills cemitery');
       game.states.table.playerSkillsDeck = Deck({
        name: 'skills', 
        multi: 'cards',
        filter: game.player.picks, 
        cb: function(deck){        
          deck.addClass('player available').hide().appendTo(game.states.table.el);
          $.each(deck.data('cards'), function(i, skill){   
            skill.addClass('player skill').data('side','player').on('click.select', game.tutorial.select);              
          });        
        }
      });
    },
    
    skillSelect: function(){    
      $('.map .enemy.hero.am').removeClass('tutorialblink');
      game.tutorial.lessonSelectSkill = true;      
      game.tutorial.axebaloon.hide().fadeIn('slow'); 
      game.tutorial.message.html(game.language.axeskillselect);   
      game.player.buyhand();
      game.states.table.playerHand.show();
      $('.player.skill').addClass('tutorialblink');   
      setTimeout(function(){
        $('.player.hero').removeClass('done');
      }, 200);
    },
    
    skill: function(){
      game.tutorial.axebaloon.hide().fadeIn('slow'); 
      game.tutorial.message.html(game.language.axeskill); 
      $('.card').on('cast.tutorial', game.tutorial.end);
      $('.card').on('activate.tutorial', game.tutorial.end);
    },
    
    end: function(){
      game.tutorial.axebaloon.hide().fadeIn('slow'); 
      game.tutorial.message.html(game.language.axeend); 
      game.states.table.showResults();
      game.tutorial.started = false;
    }    
    
  },  
  match: {
    
    public: function(){
      game.mode = 'public';
      game.seed = new Date().valueOf();
      game.id = btoa(game.seed);
      game.db({'set':'waiting', 'data': {id: game.id}}, function(waiting){
        if(game.id == waiting.id){
          game.player.type = 'challenged';
          game.match.wait();            
        } else {             
          game.id = waiting.id;     
          game.seed = parseInt(atob(game.id));
          game.player.type = 'challenger';
          game.match.found();            
        }
      });   
    },

    wait: function(){
      game.currentData.challenged = game.player.name;
      game.db({'set': game.id, 'data': game.currentData}, function(){
        game.message.text(game.language.waiting);        
        game.tries = 1;   
        game.match.search();
      }); 
    },    

    search: function(){
      clearTimeout(game.timeout);
      game.db({'get': game.id }, function(found){
        if(found.challenger){
          game.triesCounter.text('');
          game.currentData = found;
          game.match.battle.call(game.states.choose, found.challenger, 'challenger');         
        } else {
          game.triesCounter.text(game.tries++);                
          if(game.tries > game.waitLimit) {
            game.message.text(game.language.noenemy);  
            setTimeout(function(){                
              game.states.changeTo('menu'); //todo: sugest bot match 
            }, 2000);
          }
          else game.timeout = setTimeout(game.match.search, 1000);
        }
      });
    },

    found: function(){       
      game.message.text(game.language.gamefound);
      game.db({'get': game.id }, function(found){     
        if(found.challenged){
          game.triesCounter.text('');
          game.currentData = found;  
          game.currentData.challenger = game.player.name;
          game.db({'set': game.id, 'data': game.currentData}, function(){
            game.match.battle(found.challenged, 'challenged');
          });  
        } else game.states.load.reset();
      });
    },  
    
    pick: function(){
      if($('.slot.available').length == 0){
        game.player.mana = 0;
        $('.slot .card').each(function(){
          var card = $(this);
          game.player.mana += card.data('mana');
        });
        game.player.cardsPerTurn = 1 + Math.round(game.player.mana/10); 
        game.states.choose.counter.text(game.language.startsin+': '+(game.states.choose.count)+' '+game.language.cardsperturn+': '+ game.player.cardsPerTurn); 
      } else game.states.choose.counter.text(game.language.pickdeck+': '+(game.states.choose.count));      
    },
    
    pickCount: function(){ 
      game.states.choose.count--;
      if($('.slot.available').length != 0) game.states.choose.counter.text(game.language.pickdeck+': '+(game.states.choose.count)); 
      else game.states.choose.counter.text(game.language.startsin+': '+(this.count)+' '+game.language.cardsperturn+': '+ game.player.cardsPerTurn); 
      if(game.states.choose.count < 0) {
        game.states.choose.counter.text(game.language.getready);  
        game.states.choose.disablePick();        
        game.match.fillDeck();   
      }
      else setTimeout(game.match.pickCount, 1000);
    },

    fillDeck: function(){
      game.player.picks = [];
      $('.pickbox .card.active').removeClass('active');
      if(game.debug){
        if(game.player.type == 'challenger') game.player.picks = ['wk','cm','ld','nyx','kotl'];
        else game.player.picks = ['ld','cm','pud','am','kotl'];
        game.match.sendDeck();        
        return;
      }      
      $('.slot').each(function(){
        var slot = $(this), card;
        if(slot.hasClass('available')){
          card = Deck.randomCard($('.pickbox .card'), 'noseed');
          slot.append(card).removeClass('available');
        } else  card = $('.card', slot);
        game.player.picks[slot.data('slot')] = card.data('hero');
        if(game.player.picks.length == 5) game.match.sendDeck();      
      });   
    },

    sendDeck: function(){     
      game.states.choose.el.removeClass('turn'); 
      game.states.choose.pickDeck.css('margin-left', 0);
      game.states.choose.tries = 1;
      if(game.player.type == 'challenged'){
        game.currentData.challengedDeck = game.player.picks.join('|');
        game.db({'set': game.id, 'data': game.currentData}, function(){          
          game.match.getChallengerDeck();
        });
      }
      if(game.player.type == 'challenger') game.match.getChallengedDeck();         
    },

    getChallengerDeck: function(){ 
      clearTimeout(game.timeout);
      game.message.text(game.language.loadingdeck);
      game.loader.addClass('loading');
      game.db({'get': game.id }, function(found){         
        if(found.challengerDeck){
          game.triesCounter.text('');
          game.currentData = found;
          game.enemy.picks = game.currentData.challengerDeck.split('|');
          game.states.choose.reset();
          game.states.changeTo('table');          
        } else {
          game.triesCounter.text(game.tries++);
          if(game.tries > game.connectionLimit) game.states.load.reset();
          else game.timeout = setTimeout(game.match.getChallengerDeck, 1000);
        }
      });
    },

    getChallengedDeck: function(){
      clearTimeout(game.timeout);
      game.message.text(game.language.loadingdeck);
      game.loader.addClass('loading');
      game.db({'get': game.id }, function(found){         
        if(found.challengedDeck){ 
          game.triesCounter.text('');
          game.currentData = found;    
          game.currentData.challengerDeck = game.player.picks.join('|');
          game.enemy.picks = game.currentData.challengedDeck.split('|');
          game.db({'set': game.id, 'data': game.currentData}, function(){ 
            game.states.choose.reset();
            game.states.changeTo('table');
          });              
        } else {
          game.triesCounter.text(game.tries++);
          if(game.tries > game.connectionLimit) game.states.load.reset();
          else game.timeout = setTimeout(game.match.getChallengedDeck, 1000);
        }      
      });  
    },

    battle: function(enemy, challenge){
      game.status = 'picking';
      game.loader.removeClass('loading');
      game.states.choose.el.addClass('turn');
      game.enemy.name = enemy; 
      game.enemy.type = challenge;
      game.message.html(game.language.battlefound+' <b>'+ game.player.name + '</b> vs <b class="enemy">' + game.enemy.name+'</b>');                
      game.states.choose.counter.show();
      game.audio.play('battle');
      game.states.choose.count = game.debug ? 1 : game.timeToPick;
      game.states.choose.enablePick();        
      setTimeout(game.match.pickCount, 1000);      
    },
    
    start: function(){
      game.loader.addClass('loading'); 
      game.message.text(game.language.battle);
      game.audio.play('horn');
      game.states.table.placeTowers();
      game.states.table.placeTrees(); 
      game.states.table.placePlayerHeroes(); 
      game.states.table.placeEnemyHeroes(); 
      game.states.table.buildUnits(); 
      game.states.table.buildSkills(); 
      game.turn.build(); 
      //todo: build storage.state
      game.match.started = true;
      setTimeout(game.turn.first, 1000);
    },   

    end: function(){
      game.match.started = false;
    }
    
  },  
  turn: {
    
    first: function(){ 
      game.currentData = {};
      game.player.kills = 0;
      game.enemy.kills = 0;
      game.turn.begin();
    },   
    
    build: function(){
      game.time = 0;      
      game.player.turn = 0;
      game.enemy.turn = 0;
      game.currentData.moves = [];
      if(game.player.type == 'challenged') game.status = 'turn';
      if(game.player.type == 'challenger') game.status = 'unturn';         
    },

    begin: function(){      
      //todo: update storage.state = game.state - each hero hp position buffs etc, each player skill hand
      if(game.status != 'over') {    
        game.currentData.moves = []; 
        game.states.table.el.addClass(game.status);
        if(game.status == 'turn') game.message.text(game.language.yourturn);
        if(game.status == 'unturn') game.message.text(game.language.enemyturn);       
        $('.card .damaged').remove();
        $('.card .heal').remove();
        $('.card.dead').each(function(){
          var dead = $(this);
          if(game.time > dead.data('reborn')) dead.reborn();
        });  
        $('.card.heroes').each(function(){
          var hero = $(this);
          if(hero.data('channeling')) hero.trigger('channel', {target: hero});
        });
        $('.card').each(function(){          
          var card = $(this);          
          card.trigger('turnstart', {target: card});                  
          if(game.status == 'turn')  card.trigger('playerturnstart', {target: card});
          else card.trigger('enemyturnstart', {target: card});
          card.reduceStun();
        });
        if(game.turn == 6) $('.card', game.states.table.playerUlts).appendTo(game.states.table.playerSkillsDeck);
        if(game.status == 'turn'){         
          $('.map .card.player').removeClass('done');
          game.player.buyhand();               
          game.states.table.towerAutoAttack();        
          Map.highlight(); 
        } else {
          $('.map .card.enemy').removeClass('done');
          game.enemy.buyhand();
        }
        game.time = game.player.turn + game.enemy.turn;  
        game.states.table.counter = (game.debug) ? 5 : game.timeToPlay;          
        setTimeout(game.turn.count.bind(game.states.table), 1000);
      }
    },

    count: function(){
      clearTimeout(game.timeout);
      game.loader.removeClass('loading');
      game.states.table.time.text(game.language.time+': '+game.states.table.hours()+' '+game.states.table.dayNight());     
      game.states.table.turns.text(game.language.turns+': '+game.player.turn+'/'+game.enemy.turn +' ('+parseInt(game.time)+')');     
      if(game.status == 'turn') game.message.text(game.language.yourturncount+' '+game.states.table.counter+' '+game.language.seconds);
      else if(game.status == 'unturn') game.message.text(game.language.enemyturncount+' '+game.states.table.counter+' '+game.language.seconds);     
      if(this.counter-- < 1){
        $('.card.heroes').each(function(){
          var hero = $(this);
          hero.trigger('turnend', {target: hero});
        });
        if(game.status == 'turn') this.sendMoves();
        else if(game.status == 'unturn') this.getMoves();    
      } else {
        game.time += 1 / game.timeToPlay;
        game.timeout = setTimeout(game.turn.count, 1000);
      }
    },
    
    enemyend: function(){
      if(game.status != 'over'){
        game.status = 'turn';
        game.states.table.enemySkillsDeck.removeClass('slide');
        $('.card.enemy.heroes').removeClass('done');
        $('.enemy.skills .card').hide();
        game.turn.begin();
        if(game.selectedCard) game.selectedCard.select()
      }
    },
    
  },
  loadJSON: function(name, cb){
    $.ajax({
      type: "GET", 
      url: 'json/'+name+'.json',
      complete: function(response){
        var data = JSON.parse(response.responseText);
        game[name] = data;
        if(cb) cb(data);
      }
    });
  },  
  db: function(send, cb){
    if(send.data) send.data = JSON.stringify(send.data);
    $.ajax({
      type: "GET", 
      url:  '/db', 
      data: send, 
      complete: function(receive){
        var data;
        if(receive.responseText) data = JSON.parse(receive.responseText); 
        if(cb) cb(data || {});
      }
    });
  },  
  random: function(){  
    if(game.debug) return 0;
    return parseFloat('0.'+Math.sin(++game.seed).toString().substr(6));
  },    
  audio: {

    buffers: {},
    
    build: function(){
      game.audio.context = new AudioContext();
      game.mute = game.audio.context.createGain();
      game.mute.connect(game.audio.context.destination);
      var sounds = [
        'activate',
        'crit',
        'horn',
        'battle',
        'pick',         
        'tower',
        'tutorial/axe1',
        'tutorial/axe2'
      ];
      for(var i=0; i < sounds.length; i++) game.audio.load(sounds[i]);      
    },

    load: function(name){
      if(!game.audio.context) game.audio.build();
      var ajax = new XMLHttpRequest(); 
      ajax.open("GET", '/audio/'+name+'.mp3', true); 
      ajax.responseType = "arraybuffer"; 
      ajax.onload = function(){ 
        game.audio.context.decodeAudioData(ajax.response, function(buffer){ 
          game.audio.buffers[name] = buffer;
        }); 
      }; 
      ajax.send();   
    },

    play: function(name){ 
      var sound = game.audio.context.createBufferSource();
      sound.buffer = game.audio.buffers[name];
      sound.connect(game.mute);
      sound.start();
    }
    
  },     
  states: {    

    /*////////////////////////game.states.system//

    states.changeTo('somestate')  -> set current state
    states.currentstate -> get current state
    states.el -> states div appended to game.container
    states[states.currentstate].el -> state div appended to states.el
    states.backState() -> change to the previous state

    if a state has a build function, it will run once
    if a state has a start function, it will run every time it enters the state
    if a state has a end function, it will run every time it leaves the state

    ///////////////////////////////////////*/
    
    preBuild: ['intro', 'login', 'menu', 'options', 'choose', 'table'],  
    
    build: function(){
      this.el = $('<div>').attr('id','states').appendTo(game.container);
      game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
      $.each(this, function(id){      
        if(game.states.preBuild.indexOf(id) >= 0){
          game.states[id].el = $('<div>').addClass('state-'+id).appendTo(game.states.el).hide();
          if(game.states[id].build) {
            game.states[id].build();
            game.states[id].builded = true;
          }
        }
      }); 
      setTimeout(function(){
        game.states.changeTo('intro'); 
      }, 1000);
    }, 
    
    changeTo: function(state){
      if(this == game.currentstate) return;   
      var pre = game.currentstate;
      var oldstate = this[pre];
      if(oldstate.el) oldstate.el.hide(); 
      if(oldstate.end) oldstate.end();    
      var newstate = this[state];
      if(newstate.build && !newstate.builded){      
        newstate.build();
        newstate.builded = true;
      }
      this.el.removeClass(pre).addClass(state);
      if(newstate.el) newstate.el.show().append(game.topbar);
      game.currentstate = state;
      game.backstate = pre;
      if(newstate.start) newstate.start();
    },
    
    backState: function(){
      game.states.changeTo(game.backstate);
    },
    
    //states////////////////////////////////////////////////
    
    load: {

      data: function(cb){
        game.loadJSON('heroes');        
        game.loadJSON('units');        
        game.loadJSON('skills', function(){          
          for(var hero in game.skills){
            for(var skill in game.skills[hero]){
              game.skills[hero][skill].buff = hero + '-' + skill;              
              game.skills[hero][skill].hero = hero;
              game.skills[hero][skill].skill = skill;
            }
          }
        });        
        game.loadJSON('buffs', function(){          
          for(var hero in game.buffs){
            for(var buff in game.buffs[hero]){
              game.buffs[hero][buff].buff = hero + '-' + buff;              
              game.buffs[hero][buff].hero = hero;
              game.buffs[hero][buff].skill = buff;
            }
          }
        });
        if(cb) setTimeout(cb, 500);
      },

      language: function(cb){
        game.loadJSON('languages', function(){
          game.db({'get':'lang'}, function(data){
            game.lang = 'en-US';
            if(data && data.lang){
              game.lang = data.lang.split(';')[0].split(',')[0];     
            }
            game.language = game.languages[game.lang];
            if(cb) cb();
          });         
        });
      },

      images: function(){
        var allImgs = [];//new array for all the image urls  
        var k = 0; //iterator for adding images
        var sheets = document.styleSheets;//array of stylesheets
        for(var i = 0; i<sheets .length; i++){//loop through each stylesheet
          var cssPile = '';//create large string of all css rules in sheet
          var csshref = (sheets[i].href) ? sheets[i].href : 'window.location.href';
          var baseURLarr = csshref.split('/');//split href at / to make array
          baseURLarr.pop();//remove file path from baseURL array
          var baseURL = baseURLarr.join('/');//create base url for the images in this sheet (css file's dir)
          if(baseURL!="") baseURL+='/'; //tack on a / if needed
          if(document.styleSheets[i].cssRules){//w3
            var thisSheetRules = document.styleSheets[i].cssRules; //w3
            for(var j = 0; j<thisSheetRules.length; j++){
              cssPile+= thisSheetRules[j].cssText;
            }
          } else cssPile+= document.styleSheets[i].cssText;
          //parse cssPile for image urls and load them into the DOM
          var imgUrls = cssPile.match(/[^(]+.(gif|jpg|jpeg|png)/g);//reg ex to get a string of between a "(" and a ".filename"
          if(imgUrls != null && imgUrls.length>0 && imgUrls != ''){//loop array
            var arr = $.makeArray(imgUrls);//create array from regex obj        
            $.each(arr, function(){
              allImgs[k] = new Image(); //new img obj
              allImgs[k].src = (this[0] == '/' || this.match('http://')) ? this : baseURL + this;//set src either absolute or rel to css dir
              k++;
            });
          }
        }//loop
        return allImgs;
      },

      ping: function(cb){
        var start = new Date();
        $.ajax({
          type: "GET", 
          url: 'http://dotacard.herokuapp.com',
          complete: function(response){
            game.ping = new Date() - start;
            if(response.readyState != 4) game.offline = true;     
            if(cb) cb();
          }
        });
      }, 

      fonts: function(){
        if(!game.offline){
          var fontstyles = [
            '<style rel="stylesheet">',
            '@import url("http://fonts.googleapis.com/css?family=Open+Sans");',
            '@import url("http://fonts.googleapis.com/css?family=Julius+Sans+One");',
            '@import url("http://fonts.googleapis.com/css?family=Sansita+One");',
            '</style>'
          ].join('\n');
          $(fontstyles).appendTo('head');
        }
      },

      analytics: function(){
        if(!game.offline) $('<script src="browser_modules/google.analytics.min.js">').appendTo('body');
      },

      youtube: function(){
        if(!game.offline) $('<script src="browser_modules/youtube.iframe.min.js">').appendTo('body');
      },

      end: function(){
        if(!game.debug){
          window.oncontextmenu = game.nomenu;
          window.onbeforeunload = function(){
            return game.language.leave;
          };
        }
      },

      reset: function(){
        if(game.debug){
          console.log('Internal error: ', game);
        } else {
          alert(game.language.error);
          location.reload(true);
        }
      }
    },
    
    intro: {    

      build: function(){         
        if(!game.debug){ 
          this.video = $('<div>').addClass('video').hide().appendTo(this.el);
          this.youtube = $('<video>').attr({id: 'introvideo'}).appendTo(this.video);
          this.skipvideo = $('<div>').addClass('skipvideo').appendTo(this.el).click(function(){game.states.changeTo('login');}).contextmenu(game.nomenu);
          var ratio = 16/9;
          var width = game.states.el.width() * 1.1;
          var height = Math.ceil(width / ratio);
          window.onYouTubeIframeAPIReady = function(){
            new YT.Player('introvideo', {          
              videoId: '-cSFPIwMEq4',
              width: width,
              height: height,        
              playerVars: {
                controls: 0,
                showinfo: 0,
                modestbranding: 1,
                wmode: 'transparent'
              },
              events: {
                onReady: function(event){ 
                  game.youTubePlayer = event.target;
                  game.states.intro.play();
                }
              }
            });
          }
          this.box = $('<div>').hide().appendTo(this.el).addClass('box');
          this.text = $('<h1>').appendTo(this.box).addClass('introheader').html('DotaCard <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard/commits/gh-pages">alpha '+game.vs+'</a>');
        }
      },

      start: function(){
        game.loader.addClass('loading');
        game.message.text('Loading');
        if(!game.debug){
          this.box.fadeIn(2000);
          setTimeout(function(){
            if(game.currentstate == 'intro'){
              if(game.offline) game.states.changeTo('login');
              else setTimeout(function(){
                if(!game.youTubePlayer) game.states.changeTo('login');
              }, 2000);
            }
          }, 4000); 

        } else {        
          game.states.changeTo('login'); 
        }
      },

      play: function(){   
        if(game.currentstate == 'intro'){
          game.message.text('');
          game.loader.removeClass('loading');        
          this.box.delay(4000).fadeOut(1000);
          this.video.delay(6000).fadeIn(1000);
          setTimeout(function(){
            if(game.currentstate == 'intro') game.youTubePlayer.playVideo();
          }, 2000);
          setTimeout(function(){
            if(game.currentstate == 'intro') game.states.changeTo('login');          
          }, 105400);     
        }
      },

      end: function(){
        if(game.youTubePlayer) game.youTubePlayer.pauseVideo();
      }
    },
    
    login: {  

      build: function(){       
        this.menu = $('<div>').appendTo(this.el).addClass('box');
        this.title = $('<h1>').appendTo(this.menu).text(game.language.choosename);
        this.input = $('<input>').appendTo(this.menu).attr({ 
          placeholder: game.language.type, 
          type: 'text',
          maxlength: 24
        })
        .keydown(function(e){
          if(e.which == 13) game.states.login.button.click();
        });    
        this.button = $('<button>').appendTo(this.menu).text(game.language.login).attr({
          placeholder: game.language.choosename, 
          title: game.language.choosename
        }).click(function(){        
          var name = game.states.login.input.val();        
          if(!name) game.states.login.input.focus();
          else {
            game.player.name = name;
            if(game.states.login.remembername) $.cookie('name', name);
            else $.removeCookie('name');
            game.states.login.button.attr('disabled', true );
            game.loader.addClass('loading');
            game.db({'get':'server'}, function(server){
              if(server.status == 'online') game.states.changeTo('menu');
              else game.states.load.reset();
            });            
          } 
        });
        this.rememberlabel = $('<label>').appendTo(this.menu).text(game.language.remember);
        this.remembercheck = $('<input>').attr({type: 'checkbox', name: 'remember'}).change(this.remember).appendTo(this.rememberlabel).click();
        var rememberedname = $.cookie('name');
        if(rememberedname) this.input.val(rememberedname);
      },

      start: function(){
        game.message.text('');
        this.input.focus();
        game.loader.removeClass('loading');
        if(game.debug){
          this.input.val('Bot'+(parseInt(Math.random()*100)));
          this.button.click();
        }
      },

      end: function(){
        this.button.attr('disabled', false );
      },

      remembername: false,

      remember: function(){
        game.states.login.remembername = !game.states.login.remembername;
      }

    },
    
    menu: {  
      
      build: function(){     
        this.menu = $('<div>').appendTo(this.el).addClass('box'); 
        this.title = $('<h1>').appendTo(this.menu).text(game.language.choosemode);
        this.tutorial = $('<button>').appendTo(this.menu).attr({'title': game.language.tutorial}).text(game.language.tutorial).click(function(){    
          game.tutorial.build();
          game.states.changeTo('choose');
        });
        this.public = $('<button>').appendTo(this.menu).attr({'title': game.language.choosepublic}).text(game.language.public).click(function(){    
          game.match.public();
          game.states.changeTo('choose');
        });
        this.friend = $('<button>').appendTo(this.menu).attr({ 'title': game.language.choosefriend, 'disabled': true }).text(game.language.friend);        
        this.bot = $('<button>').appendTo(this.menu).attr({ 'title': game.language.choosebot, 'disabled': true }).text(game.language.bot);    
        this.options = $('<button>').appendTo(this.menu).attr({ 'title': game.language.chooseoptions}).text(game.language.options).click(function(){
          game.states.changeTo('options');
        }); 
        this.credits = $('<button>').appendTo(this.menu).attr({ 'title': game.language.choosecredits, 'disabled': true }).text(game.language.credits);
      },
      start: function(){      
        game.states.options.opt.show();  
        game.loader.removeClass('loading');
        game.triesCounter.text('');
        game.message.html(game.language.welcome+' <b>'+game.player.name+'</b>!');
        $('<small>').addClass('logout').appendTo(game.message).text(game.language.logout).click(function(){
          game.states.changeTo('login');
        });
        this.public.focus();
        if(!game.debug && !this.chat) this.chat = $('<iframe src="http://webchat.freenode.net?nick='+game.player.name+'&channels=%23dotacard" width="450" height="570"></iframe>').addClass('chat').appendTo(this.el);
        else {
          this.chat = $('<div>').addClass('chat').appendTo(this.el).text('Chat window');
          //this.public.click();
        }
      }  
    }, 
    
    options: {

      build: function(){     
        this.menu = $('<div>').appendTo(this.el).addClass('box'); 
        this.title = $('<h1>').appendTo(this.menu).text(game.language.options);

        this.resolution = $('<div>').appendTo(this.menu).attr({'title': game.language.screenres}).addClass('screenresolution');
        $('<h2>').appendTo(this.resolution).text(game.language.screenres);
        this.high = $('<label>').text(game.language.high).appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'high'}).change(this.changeResolution));
        $('<label>').text(game.language.medium).appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', checked: true}).change(this.changeResolution));
        this.low = $('<label>').text(game.language.low).appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'low'}).change(this.changeResolution));
        
        var rememberedres = $.cookie('resolution');
        if(rememberedres) this[rememberedres].click();
        
        this.audio = $('<div>').appendTo(this.menu).attr({'title': game.language.audioconfig}).addClass('audioconfig');
        $('<h2>').appendTo(this.audio).text(game.language.audioconfig);
        this.muteinput = $('<input>').attr({type: 'checkbox', name: 'mute'}).change(this.mute);
        $('<label>').text('Mute').appendTo(this.audio).append(this.muteinput);      
        this.volumecontrol = $('<div>').addClass('volumecontrol');
        this.volumeinput = $('<div>').addClass('volume').on('mousedown.volume', this.volumedown).append(this.volumecontrol);
        $('<label>').text(game.language.volume).appendTo(this.audio).append(this.volumeinput);
        $(document).on('mouseup.volume', game.states.options.volumeup);
        
        var rememberedvol = $.cookie('volume');
        if(rememberedvol){ 
          var vol = parseFloat(rememberedvol);
          if(vol == 0) this.muteinput.prop('checked', true);
          game.mute.gain.value = vol;          
          game.states.options.volumecontrol.css('transform', 'scale('+rememberedvol+')');
        }
        
        this.back = $('<button>').appendTo(this.menu).attr({'title': game.language.back}).text(game.language.back).click(game.states.backState);
        
        this.opt =  $('<img src="img/opt.png">').appendTo(game.topbar).addClass('opt').hide().on('click.opt', function(){ game.states.changeTo('options'); });
      },
      
      start: function(){
        game.states.options.opt.off('click.opt').on('click.back', game.states.backState);  
      },

      mute: function(){
        var vol = game.unmutedvolume || 1;
        if(this.checked) vol = 0;
        $.cookie('volume', vol);
        game.mute.gain.value = vol;
        game.states.options.volumecontrol.css('transform', 'scale('+vol+')');        
      }, 

      volumedown: function(event){
        game.states.options.volumechange(event);
        game.states.options.volumeinput.on('mousemove.volume', game.states.options.volumechange);
      },  

      volumeup: function(){
        game.states.options.volumeinput.off('mousemove.volume');
      },  

      volumechange: function(event){
        var volume = parseInt((event.clientX - game.states.options.volumecontrol.offset().left)/4.8)/10;
        if(volume > 1) volume = 1; 
        if(volume <= 0) {
          volume = 0;
          game.states.options.muteinput.prop('checked', true);
        } else game.states.options.muteinput.prop('checked', false);
        game.states.options.volumecontrol.css('transform', 'scale('+volume+')');
        game.mute.gain.value = volume;
        game.unmutedvolume = volume;
        $.cookie('volume', volume);
      },

      changeResolution: function(){ 
        var resolution = $('input[name=resolution]:checked', '.screenresolution').val();
        game.states.el.removeClass('low high').addClass(resolution);
        $.cookie('resolution', resolution);
      },
      
      end: function(){
        game.states.options.opt.off('click.back').on('click.opt', game.states.backState);  
      }
      
    },
    
    choose: {   
      ////////////////////////////////////////////////////////////////////////////////////////  

      build: function(){    
        this.pickbox = $('<div>').appendTo(this.el).addClass('pickbox').attr('title', game.language.chooseheroes);
        this.pickedbox = $('<div>').appendTo(this.el).addClass('pickedbox').hide().on('contextmenu', game.nomenu);
        for(var slot = 0; slot < 5; slot++){
          $('<div>').appendTo(this.pickedbox).attr({title: game.language.rightpick}).data('slot', slot).addClass('slot available');
        }
        this.prepickbox = $('<div>').appendTo(this.el).addClass('prepickbox').html(game.language.customdecks).hide();
        this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').hide();

        this.pickDeck = Deck({
          name: 'heroes', 
          cb: function(pickDeck){
            pickDeck.addClass('pickdeck').appendTo(game.states.choose.pickbox);
            game.states.choose.size = 100;
            $.each(pickDeck.data('cards'), function(id, card){
              card.on('click.active', game.states.choose.active);
              $.each(game.skills[card.data('hero')], function(){
                if(this.display) card.addBuff(card, this);
              });
              
            });
            pickDeck.width(100 + $('.card').width() * pickDeck.children().length);            
          }
        });        
      },

      start: function(){ 
        game.loader.addClass('loading');      
        game.states.options.opt.show(); 
        this.pickDeck.children().first().click();
      },

      active: function(){
        var card = $(this);
        $('.card.active').removeClass('active');
        card.addClass('active');
        game.states.choose.pickDeck.css('margin-left', card.index() * card.width()/2 * -1);
      },
      
      enablePick: function(){
        this.pickedbox.show();
        if(game.mode !== 'tutorial') this.prepickbox.show();
        $('.slot').on('contextmenu.pick', game.states.choose.pick);
      },

      disablePick: function(){      
        $('.slot').off('contextmenu.pick', game.states.choose.pick);
      },

      pick: function(){
        var slot = $(this).closest('.slot');
        var pick = $('.pickbox .card.active');
        var card;
        if(slot.hasClass('available')){          
          slot.removeClass('available');
          if(pick.next().length) card = pick.next();
          else card = pick.prev();
        } else {
          var card = slot.children('.card');
          card.on('click.active', game.states.choose.active).insertBefore(pick);             
        }
        game.audio.play('pick');
        card.addClass('active');
        game.states.choose.pickDeck.css('margin-left', card.index() * card.width()/2 * -1);    
        pick.removeClass('active').appendTo(slot).off('click.active');
        if(game.mode == 'tutorial') game.tutorial.pick();
        else game.match.pick();
        return false;
      },
      
      reset: function(){
        $('.pickedbox .card').appendTo(this.pickDeck);
        $('.slot').addClass('available');
        this.counter.hide();
      },

      end: function(){     
        this.pickedbox.hide();
        this.prepickbox.hide(); 
      }
      
    },
    
    table: {
      ////////////////////////////////////////////////////////////////////////////////////////

      build: function(){      
        this.time =  $('<p>').appendTo(game.topbar).addClass('time').text(game.language.time+': 0:00 Day').hide();
        this.turns =  $('<p>').appendTo(game.topbar).addClass('turns').text(game.language.turns+': 0/0 (0)').hide();
        this.selectedArea = $('<div>').appendTo(this.el).addClass('selectedarea');
        this.buildMap();
        this.el.click(function(event){
          var target = $(event.target)
          if(!target.closest('.selected').length && !target.closest('.selectedarea').length) Card.unselect();
        });
      },

      start: function(){     
        if(game.mode == 'tutorial' && !game.tutorial.started) game.tutorial.start();
        else if(!game.match.started) game.match.start();
        this.time.show();
        this.turns.show();
        game.states.options.opt.show();
      },

      buildMap: function(){
        game.scrollX = 40;
        //game.scrollY = 50;
        this.camera = $('<div>').appendTo(this.el).addClass('camera')
        .mousemove(function(event){
          var offset = game.states.table.camera.offset();
          var x = event.clientX - offset.left;        
          if(x < 40) game.scrollingX = -1;
          else if(x > 680) game.scrollingX = 1;
          else game.scrollingX = 0;        
          //var y = event.clientY - offset.top;
          //if(y < 40) game.scrollingY = -1;
          //else if(y > 430) game.scrollingY = 1;
          //else game.scrollingY = 0;     
        }).hover(function(){
          game.scrollingX = 0;
          //game.scrollingY = 0;
        });      

        this.map = Map.build({
          'width': game.width,
          'height': game.height,
          'class': 'map'
        }).appendTo(this.camera);

        setInterval(game.states.table.scroll, 16);      
      },   

      scroll: function(){ 
        if(game.scrollingX || game.scrollingY){
          game.scrollX += (game.scrollspeed * game.scrollingX);
          //game.scrollY += (game.scrollspeed * game.scrollingY);
          if(game.scrollX < 40) game.scrollX = 40; if(game.scrollX > 44) game.scrollX = 44;        
          //if(game.scrollY < 49) game.scrollY = 49; if(game.scrollY > 52) game.scrollY = 52;
          game.states.table.map.css({transform: 'rotateX(30deg) translate(-'+game.scrollX+'%, -50.4%)  scale3d(0.46,0.46,0.46)'});
        }                
      },

      createTower: function(side, pos){
        var tower = Card({
          className: 'tower towers static '+side,
          side: side,
          name: game.language.tower,        
          attribute: game.language.building,
          range: 'Ranged',
          damage: 15,
          hp: 80
        });        
        tower.on('click.select', Card.select).place(pos);
        Map.around(pos, Map.getRange('Ranged'), function(spot){
          spot.addClass(side+'area');
        }, true);
        return tower;
      },

      placeTowers: function(){      
        game.player.tower = this.createTower('player', 'C5');
        game.enemy.tower = this.createTower('enemy', 'J1');    
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
          game.audio.play('tower');  
          game.player.tower.attack(lowestHp);
          var fromSpot = Map.getPosition(game.player.tower);
          var toSpot = Map.getPosition(lowestHp);
          game.currentData.moves.push('A:'+fromSpot+':'+toSpot); 
        }
      },

      createTree: function(spot){
        var tree = Card({
          className: 'tree static neutral',
          name: game.language.tree,        
          attribute: game.language.forest
        }); 
        tree.on('click.select', Card.select).place(spot);
        return tree;
      },

      placeTrees: function(){       
        var treeSpots = 'A2 A3 B3';
        $.each(treeSpots.split(' '), function(){
          game.states.table.createTree(this);
          game.states.table.createTree(Map.mirrorPosition(this));
        });
      },

      placePlayerHeroes: function(){
        if(game.player.picks){
          game.player.mana = 0;      
          this.playerHeroesDeck = Deck({
            name: 'heroes', 
            filter: game.player.picks, 
            cb: function(deck){        
              deck.addClass('player').appendTo(game.states.table.el);
              var x = 0, y = 3;
              $.each(deck.data('cards'), function(i, card){   
                var p = game.player.picks.indexOf(card.data('hero'));
                card.addClass('player hero').data('side','player').on('click.select', Card.select);
                card.place(Map.toId(x + p,y));
                game.player.mana += card.data('mana');
                if(game.debug){
                  if(p==0) card.place('F3');
                }
              });
            }
          });  
        }
      },
      
      placeEnemyHeroes: function(){ 
        if(game.enemy.picks){
          game.enemy.mana = 0;
          this.enemyHeroesDeck = Deck({
            name: 'heroes', 
            filter: game.enemy.picks, 
            cb: function(deck){
              deck.addClass('enemy').hide().appendTo(game.states.table.el);        
              var x = 11, y = 1;
              $.each(deck.data('cards'), function(i, card){   
                var p = game.enemy.picks.indexOf(card.data('hero'));
                card.addClass('enemy hero').data('side','enemy').on('click.select', Card.select);          
                card.place(Map.toId(x - p,y));  
                game.enemy.mana += card.data('mana');
                if(game.debug){
                  if(p==0) card.place(Map.mirrorPosition('F3'));
                }         
              });
            }
          }); 
        }
      },

      buildUnits: function(){       
        $('#A1').addClass('camp');
        $('#L5').addClass('camp');
        this.neutralUnitsDeck = Deck({
          name: 'units', 
          filter: ['forest'], 
          cb: function(deck){
            deck.addClass('neutral units cemitery').hide().appendTo(game.states.table.el);
            $.each(deck.data('cards'), function(i, card){   
              card.addClass('neutral unit').data('side','neutral').on('click.select', Card.select);    
            });
          }
        });       
        this.playerUnitsDeck = Deck({
          name: 'units', 
          filter: game.player.picks, 
          cb: function(deck){
            deck.addClass('player units cemitery').hide().appendTo(game.states.table.el);
            $.each(deck.data('cards'), function(i, card){   
              card.addClass('player unit').data('side','player').on('click.select', Card.select);    
            });
          }
        });       
        this.enemyUnitsDeck = Deck({
          name: 'units', 
          filter: game.enemy.picks, 
          cb: function(deck){
            deck.addClass('enemy units cemitery').hide().appendTo(game.states.table.el);
            $.each(deck.data('cards'), function(i, card){   
              card.addClass('enemy unit').data('side','enemy').on('click.select', Card.select);    
            });
          }
        }); 
      },    

      buildSkills: function(){        
        //10 to 14 = 2 cards; 15 to 20 = 3 cards
        game.player.maxCards = Math.round(game.player.mana/2);  
        game.player.cardsPerTurn = 1 + Math.round(game.player.mana/10)

        this.playerHand = $('<div>').appendTo(this.el).addClass('player deck skills hand');
        this.playerPermanent = $('<div>').appendTo(this.el).addClass('player deck skills permanent');
        this.playerTemp = $('<div>').hide().appendTo(this.el).addClass('player deck skills temp');
        this.playerUlts = $('<div>').hide().appendTo(this.el).addClass('player deck skills ult');      
        this.playerCemitery = $('<div>').hide().appendTo(this.el).addClass('player deck skills cemitery');
        this.playerSkillsDeck = Deck({
          name: 'skills', 
          multi: 'cards',
          filter: game.player.picks, 
          cb: function(deck){        
            deck.addClass('player available').hide().appendTo(game.states.table.el);
            $.each(deck.data('cards'), function(i, skill){   
              skill.addClass('player skill').data('side','player').on('click.select', Card.select);
              if(skill.data('special')){              
                if(skill.data('special') == 'Permanent') skill.appendTo(game.states.table.playerPermanent);              
                if(skill.data('special') == 'Temporary') skill.appendTo(game.states.table.playerTemp);              
                if(skill.data('special') == 'Ultimate') skill.appendTo(game.states.table.playerTemp);              
              } else if(skill.data('skill') == 'ult') skill.appendTo(game.states.table.playerUlts);
            });        
          }
        });

        game.enemy.maxCards = Math.round(game.enemy.mana/2); 
        game.enemy.cardsPerTurn = 1 + Math.round(game.enemy.mana/10);           
        game.enemy.hand = 0;
        this.enemySkillsDeck = Deck({
          name: 'skills', 
          filter: game.enemy.picks, 
          cb: function(deck){        
            deck.addClass('enemy hand cemitery permanent').appendTo(game.states.table.el);
            $.each(deck.data('cards'), function(i, skill){   
              skill.hide().addClass('enemy skill').data('side','enemy');        
            });        
          }
        });

      },   

      sendMoves: function(){
        $('.card.heroes').each(function(){
          var hero = $(this);
          hero.trigger('playerturnend', {target: hero});
        });
        game.message.text(game.language.uploadingturn);
        game.loader.addClass('loading');
        Map.unhighlight();
        $('.card .damaged').remove();
        $('.card .heal').remove();
        game.status = 'unturn';
        game.states.table.el.removeClass('turn');
        game.states.table.sendData();
      },

      getMoves: function(){   
        game.message.text(game.language.loadingturn);
        game.loader.addClass('loading');
        game.tries = 1;  
        game.states.table.el.removeClass('unturn');
        setTimeout(game.states.table.getData, 1000);
      },

      sendData: function(){
        game.player.turn++;
        game.currentData[game.player.type + 'Turn'] = game.player.turn;  
        game.currentData.moves = game.currentData.moves.join('|');   
        game.db({'set': game.id, 'data': game.currentData}, function(){
          setTimeout(game.turn.begin, 1000);
        });      
      },

      getData: function(){
        clearTimeout(game.timeout);
        game.db({'get': game.id }, function(data){                    
          if(data[game.enemy.type + 'Turn'] == (game.enemy.turn + 1) ){
            game.triesCounter.text('');
            game.currentData = data;
            game.enemy.turn++;
            game.states.table.executeEnemyMoves();            
          } else {
            game.triesCounter.text(game.tries++);
            if(game.tries > game.connectionLimit) game.states.load.reset();
            else game.timeout = setTimeout(game.states.table.getData, 1000);
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
        if(hours < (game.dayLength/2) ) return game.language.day;
        else return game.language.night;
      },

      moveSelected: function(){
        var spot = $(this), card = game.selectedCard;
        var fromSpot = Map.getPosition(card);  
        var toSpot = Map.getPosition(spot);
        if(game.status == 'turn' && spot.hasClass('free') && (fromSpot != toSpot) && !card.hasClass('done')){
          card.move(toSpot);        
          if(game.mode != 'tutorial') game.currentData.moves.push('M:'+fromSpot+':'+toSpot);
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
          if(game.mode != 'tutorial') game.currentData.moves.push('A:'+fromSpot+':'+toSpot); 
          Map.unhighlight();
        }
        return false;
      },   

      passiveActivate: function(){
        var target = $(this), skill = game.selectedCard;
        var hero = skill.data('hero');
        var skillid = skill.data('skill');
        var toSpot = Map.getPosition(target);  
        if(hero && skillid && game.status == 'turn'){ 
          game.audio.play('activate');
          if(game.mode != 'tutorial') game.currentData.moves.push('P:'+toSpot+':'+skillid+':'+hero); 
          skill.activate(target);
          var t = skill.offset(), d = target.offset();
          skill.css({top: d.top - t.top + 30, left: d.left - t.left + 20, transform: 'translate(-50%, -50%) scale(0.3)'});
          setTimeout(function(){          
            $(this.card).css({top: '', left: '', transform: ''}).appendTo(this.destiny);
            target.select();
          }.bind({ card: skill, destiny: game.states.table.playerCemitery }), 500);        
        }
      },

      castWithSelected: function(){
        var target = $(this), skill = game.selectedCard, source = $('.map .source');
        var fromSpot = Map.getPosition(source);
        var toSpot = Map.getPosition(target);  
        var hero = skill.data('hero');
        var skillid = skill.data('skill');
        if(hero && skillid && fromSpot && toSpot && game.status == 'turn' && !source.hasClass('done')){ 
          game.currentData.moves.push('C:'+fromSpot+':'+toSpot+':'+skillid+':'+hero); 
          source.cast(skill, toSpot);         
        }
      },

      executeEnemyMoves: function(){
        game.message.text(game.language.enemymove);
        game.states.table.enemySkillsDeck.addClass('slide');
        var moves = game.currentData.moves.split('|');      
        for(var m = 0; m < moves.length; m++){
          var move = moves[m].split(':');
          var fromSpot = Map.mirrorPosition(move[1]), toSpot = Map.mirrorPosition(move[2]);
          var source, target, hero, skillid, skill;

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
            target = $('#'+toSpot);          
            skill = $('.enemy.skills .'+hero+'-'+skillid).show();
            if(skill.data('target') == 'Enemy' || skill.data('target') == 'Player' || skill.data('target') == 'Self')
              target = $('#'+toSpot+' .card');
            if(Skills[hero][skillid].cast && skill && !source.hasClass('done') && source.hasClass('enemy') && source.cast){
              source.cast(skill, target);
              game.enemy.hand--;
            }
          }         
          if(move[0] == 'P'){
            toSpot = Map.mirrorPosition(move[1]);
            skillid = move[2]; 
            hero = move[3];
            target = $('#'+toSpot+' .card');
            skill = $('.enemy.skills .'+hero+'-'+skillid).show();
            if(Skills[hero][skillid].activate && skill && target.hasClass('enemy') && skill.activate){
              skill.activate(target);
              game.enemy.hand--;
            }
          }        
        }      
        $('.card.heroes').each(function(){
          var hero = $(this);
          hero.trigger('enemyturnend', {target: hero});
        });
        setTimeout(game.turn.enemyend, game.enemy.playtime * 1000);
      },

      animateCast: function(skill, target, destiny){
        if(typeof target == 'string') target = $('#'+target);
        var t = skill.offset(), d = target.offset();
        skill.css({top: d.top - t.top + 30, left: d.left - t.left + 20, transform: 'translate(-50%, -50%) scale(0.3)'});
        setTimeout(function(){          
          $(this.card).css({top: '', left: '', transform: ''}).appendTo(this.destiny);          
          if(skill.hasClass('selected')) $('.map .source').select();
        }.bind({ card: skill, destiny: destiny }), 500);
      },

      win: function(){
        game.winner = game.player.name;
        game.states.table.el.addClass('turn');
        game.message.text(game.language.win); 
        game.states.table.sendData();
        game.status = 'over';      
        game.states.table.showResults();
      },    

      lose: function(){      
        game.winner = game.enemy.name;
        game.states.table.el.addClass('unturn');
        game.message.text(game.language.lose);
        game.loader.removeClass('loading');
        game.status = 'over';      
        game.states.table.showResults();
      },

      showResults: function(){
        Map.unhighlight();
        $('#table .card').off('click.select');
        this.resultsbox = $('<div>').appendTo(this.el).attr({'class': 'resultsbox box'});
        $('<h1>').appendTo(this.resultsbox).addClass('result').text(game.winner+' victory');
        $('<h1>').appendTo(this.resultsbox).text('Towers HP: '+game.player.tower.data('currenthp')+' / '+game.enemy.tower.data('currenthp'));
        $('<h1>').appendTo(this.resultsbox).text('Heroes KD: '+game.player.kills+' / '+game.enemy.kills);
        this.playerResults = $('<div>').appendTo(this.resultsbox).attr({'class': 'results'});
        this.enemyResults = $('<div>').appendTo(this.resultsbox).attr({'class': 'results'});
        $('.player.heroes.card').not('.zoom').each(function(){
          var hero = $(this), heroid = $(this).data('hero'); 
          var img = $('<div>').addClass('portrait').append($('<div>').addClass('img'));
          var text = $('<span>').text( hero.data('name')+': '+hero.data('kills')+' / '+hero.data('deaths') );
          $('<p>').appendTo(game.states.table.playerResults).addClass(heroid).append(img, text);
        });      
        $('.enemy.heroes.card').not('.zoom').each(function(){
          var hero = $(this), heroid = $(this).data('hero');
          var img = $('<div>').addClass('portrait').append($('<div>').addClass('img'));
          var text = $('<span>').text( hero.data('name')+': '+hero.data('kills')+' / '+hero.data('deaths') );
          $('<p>').appendTo(game.states.table.enemyResults).addClass(heroid).append(img, text);
        });
        $('<button>').appendTo(this.resultsbox).text('Close').click(function(){  
          game.states.table.clear();
          game.states.changeTo('menu');
        });
      },
      
      clear: function(){
        $('#table .card').remove();
        $('#table .deck').remove();
        this.resultsbox.remove();
        game.match.end();
      },
      
      end: function(){
        this.time.hide();
        this.turns.hide();
      },

    } //states.table end
    
  }, //states end
  currentstate: 'load',  
};
$(game.start);