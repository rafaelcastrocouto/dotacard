$(function(){
  var game = {
    limit: 60,
    clock: 20000,
    container: $('<div>').appendTo('body').attr('id','container')
  };
  //STATES
  /* 
  every state:
   has an element (this.el) 
   if has build function will run once
   if has start function will run every time
   if has end function will run every time

  State
    .changeTo('state')  -> set current state
    .currentState -> get current state
    .el -> states div appended to container
  */
  var states = {
    'load': {
      end: function(){
        console.log('Welcome to DotaCard!');        
      }
    },
    'intro': {
      build: function(){          
        this.list = $('<div>').appendTo(this.el).attr({'class': 'box'});

        this.text = $('<p>').appendTo(this.list).attr({'class': 'intro'}).html('DotaCard <a target="_blank" href="http://scriptogr.am/rafaelcastrocouto">æ</a>');

        this.timeout = setTimeout(function(){
          State.changeTo('login');
        }, 3000);

        this.el.click(function(){
          clearTimeout(states.intro.timeout);
          State.changeTo('login');
        });        
      }
    },
    'login': {  
      build: function(){ 
        this.menu = $('<div>').appendTo(this.el).attr({'class': 'box'});

        this.title = $('<h1>').appendTo(this.menu).text('Choose a name');

        this.input = $('<input>').appendTo(this.menu).attr({ 'placeholder': 'Type any name here',
                                                            'type': 'text'          
                                                           }).keydown(function(e){
          if(e.which == 13) states.login.button.click();
        }).focus();

        this.button = $('<button>').appendTo(this.menu).attr({ 'placeholder': 'Choose a name and click to play',
                                                              'title': 'Choose a name and click to play'          
                                                             }).text('Play').click(function(){
          game.player = {name: states.login.input.val()};
          if(game.player.name) State.changeTo('menu');
          else states.login.input.focus();
        });

        this.text = $('<div>').appendTo(this.menu);

        this.extlog = $('<p>').appendTo(this.text).html('Login with: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard">Facebook, Google</a>');

        this.lang = $('<p>').appendTo(this.text).html('Language: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard">Translate</a>');
      }
    },
    'menu': {
      build: function(){       

        this.text = $('<p>').appendTo(this.el).html('Welcome <b>'+game.player.name+'</b>!');

        this.menu = $('<div>').appendTo(this.el).attr({'class': 'box'}); 

        this.title = $('<h1>').appendTo(this.menu).text('Choose a game mode');

        this.public = $('<button>').appendTo(this.menu).text('Play public match').attr({ 
          'title': 'Find an adversary online'
        }).click(function(){

          game.id = btoa(new Date().valueOf() +''+ parseInt(Math.random()*10E10));

          //check if there is someone waiting
          db({'get':'waiting'}, function(waiting){
            if(!waiting) State.changeTo('intro');
            if(waiting == 'none') {
              //go to the waiting line
              db({'set': 'waiting', 'data': game.id }, function(){ 
                game.status = 'waiting';
                State.changeTo('choose');
              });

            } else { //found waiting game id
              game.id = waiting;              
              //tell enemy to leave the waiting line
              db({'set': 'waiting', 'data': 'none'}, function(){ 
                game.status = 'found';
                State.changeTo('choose');
              });

            }
          });

        });

        this.friend = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Search for a friend to play',
                                                              'disabled': true
                                                             }).text('Play with a friend');        

        this.bot = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Play with against the computer',
                                                           'disabled': true
                                                          }).text('Play with a bot');    

      }
    },
    'choose': {      
      build: function(){   
        this.message = $('<p>').appendTo(this.el).attr({'class': 'challenge'});
        this.heroesbox = $('<div>').appendTo(this.el).attr({'class': 'heroesbox'});

        this.challenge();

        this.heroesDeck = deck('heroes', function(heroesDeck){
          heroesDeck.el.appendTo(states.choose.heroesbox);

          states.choose.size = 100;
          
          $.each(heroesDeck.cards, function(id, hero){    //console.log(id, hero);
            hero.el.click(function(){
              $('.card').removeClass('active');
              var c = $(this);
              c.addClass('active');
              heroesDeck.el.css('left', c.index() * states.choose.size * -1);
            });       
          });
          heroesDeck.el.width((states.choose.size + 100) * heroesDeck.length);
        });


      },
      challenge: function(){        
        if(game.status == 'waiting') {          
          this.message.html('Just wait <b>'+ game.player.name +'</b>, we are searching for an enemy player');
          this.tries = 0;
          this.interval = setInterval(function(){ 
            //search for a challenger
            db({'get': game.id }, function(data){ 
              if(data) {                         
                clearInterval(states.choose.interval);
                var found = JSON.parse(data);   
                game.enemy = {name: found.challenger};
                //accept the challenge
                db({'set': game.id, 'data': JSON.stringify({
                  challenged: game.player.name,
                  challenger: game.enemy.name
                })}, function(){
                  states.choose.battle();
                });                
              } else {
                states.choose.message.html('Be patient <b>'+game.player.name+'</b>, we are still searching. <small>'+(states.choose.tries++)+'</small>');                
                if(states.choose.tries > game.limit) location.reload(true); // sugest bot match                          
              }
            });

          }, game.clock/10);          

        } else { //found game
          this.message.html('We found a game: <b>'+ game.player.name +'</b>, establishing connection.');
          //challenge the other player
          db({'set': game.id, 'data': JSON.stringify({
            challenger: game.player.name
          })}, function(){
            //check if the challenge was accepted
            states.choose.tries = 0;
            states.choose.interval = setInterval(function(){ 
              db({'get': game.id }, function(data){ 
                var found = JSON.parse(data); 
                if(found.challenged) {
                  clearInterval(states.choose.interval);
                  game.enemy = {name: found.challenged};
                  states.choose.battle();
                } else {
                  states.choose.message.html('Be patient <b>'+game.player.name+'</b>, we are still trying. <small>'+(states.choose.tries++)+'</small>');  
                  if(states.choose.tries > game.limit) location.reload(true);
                }                         
              });  
            }, game.clock/10);   

          });

        }        
      },
      battle: function(){        
        this.message.html('Battle Found! <b>'+ game.player.name + '</b> vs <b>' + game.enemy.name +'</b> Pick your deck ');
        this.counter = $('<h1>').appendTo(this.el).addClass('battle');
        //play sound and stuff!   
        game.status = 'battle';
        this.count = 30;
        states.choose.pick();
        this.interval = setInterval(function(){ 
          states.choose.counter.text('Game starts in: '+(states.choose.count--));
          if(states.choose.count == 0) {
            clearInterval(states.choose.interval);
            //send the deck ...
            State.changeTo('table');
          }
        }, 1000);

      },
      pick: function(){
        this.pickbox = $('<div>').appendTo(this.el).attr({'class': 'pickbox'});
        for(var s = 0; s < 5; s++){
          $('<div>').appendTo(this.pickbox).addClass('slot available').click(function(){
            var slot = $(this);
            if(slot.hasClass('available')){
              var pick = $('.heroesbox .card.active');
              if(pick.length) {
                pick.removeClass('active').appendTo(slot);
                slot.removeClass('available');
              }
            } else {
              var c = slot.children().first();
              c.appendTo($('.heroesbox .deck'));
              states.choose.heroesDeck.el.css('left', c.index() * states.choose.size * -1);
              slot.addClass('available');              
            } 
          });
        }        
      }
    },
    'table': {
      build: function(){
        this.map = map.build({
          'width': 12,
          'height': 5,
          'class': 'map'
        }).appendTo(this.el);        
      }
    }
  };

  //BUILD STATES
  var State = {
    el: $('<div>').attr('id','states').appendTo(game.container),
    currentState: 'load',
    changeTo: function(s){ 
      if(s == State.currentState) return;
      $('#states').removeClass(State.currentState).addClass(s);    
      var oldState = states[State.currentState];
      if(oldState.end) oldState.end()
      if(oldState.el) oldState.el.addClass('hidden'); 
      var newState = states[s];
      if(newState.build && !newState.builded) {      
        newState.build();
        newState.builded = true;
      }
      if(newState.start) newState.start();
      if(newState.el) newState.el.removeClass('hidden');
      State.currentState = s;
    },
    build: function(){
      $.each(states, function(id){
        states[id].el = $('<div>').attr('id',id).appendTo(State.el).addClass('hidden');
      });      
    }
  };
  State.build();  


  //TO DO ... PRE LOAD

  //LOAD END
  State.changeTo('intro');  
});



