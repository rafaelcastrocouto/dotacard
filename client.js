/* by rafælcastrocouto */
var game = { 
  vs: 0.059,
  debug: (location.host == "localhost"),   
  id: null, currentData: {}, 
  currentstate: 'load',
  status: 'loading',
  mode: '',
  scrollspeed: 0.4,
  skills: null, heroes: null, buffs: null, //json
  player: {}, enemy: {},   
  container: $('.container').first(), 
  loader: $('<span>').addClass('loader'), 
  message: $('<p>').addClass('message'), 
  triesCounter: $('<small>').addClass('triescounter'), tries: 0,  
  timeToPick: 30, timeToPlay: 10, waitLimit: 90, connectionLimit: 30, //seconds    
  dayLength: 10, deadLength: 10, //turns   
  map: null, width: 12,  height: 5, //slots  
  nomenu: function(){return false;},  
  seed: 0, random: function(){  
    if(game.debug) return 0;
    return parseFloat('0.'+Math.sin(++game.seed).toString().substr(6));
  },  
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
       Modernizr.rgba ) game.states.build();
    else $('.unsupported').show();
  },
  build: function(){
    game.loader.addClass('loading'); 
    game.message.text('The battle begins');
    game.sounds.horn.start();
    game.states.table.placeTowers(); 
    game.states.table.placeTrees(); 
    game.states.table.placeHeroes(); 
    game.states.table.buildUnits(); 
    game.states.table.buildSkills(); 
    game.states.table.buildTurns(); 
    //todo: build storage.state
    game.builded = true;
    game.timeout = setTimeout(game.states.table.firstTurn, 1000);
  },  
/*///////////////////////////////////////////////////////

states.changeTo('yourState')  -> set current state
       .currentstate -> get current state
       .el -> states div appended to game.container

each state: has an element (this.el) appended to states.el
if (build function) will run only once
if (start function) will run every time it enters the state
if (end function) will run every time it leaves the state

////////////////////////////////////////////////////////*/  
  currentstate: 'load',
  preBuild: ['intro', 'login', 'menu', 'options', 'choose', 'table'],
  states: {    
    build: function(){
      this.load.preLoadImages();
      this.load.preLoadAudio();
      this.el = $('<div>').attr('id','states').appendTo(game.container);
      game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
      $.each(this, function(id){      
        if(game.preBuild.indexOf(id) >= 0){
          game.states[id].el = $('<div>').attr('id',id).appendTo(game.states.el).addClass('hidden');
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
      if(oldstate.el) oldstate.el.addClass('hidden'); 
      if(oldstate.end) oldstate.end();    
      var newstate = this[state];
      if(newstate.build && !newstate.builded){      
        newstate.build();
        newstate.builded = true;
      }
      this.el.removeClass(pre).addClass(state);
      if(newstate.el) newstate.el.removeClass('hidden').append(game.topbar);
      game.currentstate = state;
      game.backstate = pre;
      if(newstate.start) newstate.start();
    },

    backState: function(){
      this.changeTo(game.backstate);
    },

    ////////////////////////////////////////////////////////////////////////////////////////
    'load': {
    ////////////////////////////////////////////////////////////////////////////////////////  

      preLoadImages: function(){
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

      preLoadAudio: function(){
        var pre = [
          'matchready',
          'horn',
          'crit',
          'towerprojectile'
        ];
        for(var i=0; i < pre.length; i++){ console.log(pre[i])
          game.audio(pre[i]);
        }
      },

      end: function(){
        if(!game.debug){
          window.oncontextmenu = game.nomenu;
          window.onbeforeunload = function(){
            return 'Sure you wanna leave?';
          };
        }
      },

      reset: function(){
        if(game.debug){
          console.log('Reset', game);
        } else {
          alert('Connection error, sorry.');
          location.reload(true);
        }
      }
    },

    ////////////////////////////////////////////////////////////////////////////////////////
    'intro': {   
      ////////////////////////////////////////////////////////////////////////////////////////  

      build: function(){         
        if(!game.debug){ 
          this.video = $('<div>').addClass('video').hide().appendTo(this.el);
          this.youtube = $('<video>').attr({id: 'introvideo'}).appendTo(this.video);
          this.skipvideo = $('<div>').addClass('skipvideo').appendTo(this.video).click(function(){
            clearTimeout(game.timeout);  
            game.states.changeTo('login');
          }).contextmenu(game.nomenu);
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
                  game.states.intro.videoReady = true; 
                  game.youTubePlayer = event.target;
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
          this.box.fadeIn(3000);
          game.timeout = setTimeout(function(){
            game.message.text('');
            game.loader.removeClass('loading');
            if(game.states.intro.videoReady) game.states.intro.playVideo();
            else game.states.changeTo('login');    
          }, 4000); 

        } else {        
          game.states.changeTo('login'); 
        }
      },

      playVideo: function(){   
        this.box.delay(6000).fadeOut(3000);
        this.video.delay(3000).fadeIn(3000);
        setTimeout(function(){
          if(game.states.currentstate == 'intro') game.youTubePlayer.playVideo();
        }, 3000);
        game.timeout = setTimeout(function(){
          if(game.states.currentstate == 'intro'){  
            game.states.changeTo('login');
          }
        }, 105400);       
      },

      end: function(){
        if(!game.debug && game.youTubePlayer) {
          game.youTubePlayer.pauseVideo()
        }
      }
    },

    ////////////////////////////////////////////////////////////////////////////////////////
    'login': {  
    ////////////////////////////////////////////////////////////////////////////////////////

      build: function(){       
        this.menu = $('<div>').appendTo(this.el).addClass('box');
        this.title = $('<h1>').appendTo(this.menu).text('Choose a name');
        this.input = $('<input>').appendTo(this.menu).attr({ 
          placeholder: 'Type any name here', 
          type: 'text',
          maxlength: 24
        })
        .keydown(function(e){
          if(e.which == 13) game.states.login.button.click();
        });    
        var c = 'Choose a name and click to play';
        this.button = $('<button>').appendTo(this.menu).attr({
          placeholder: c, 
          title: c
        }).text('Play')
        .click(function(){        
          var name = game.states.login.input.val();        
          if(!name) game.states.login.input.focus();
          else {
            game.player.name = name;
            game.states.login.button.attr( "disabled", true );
            game.loader.addClass('loading');
            game.db({'get':'server'}, function(server){
              if(server.status == 'online') game.states.changeTo('menu');
              else game.states.load.reset();
            });            
          } 
        });
        this.text = $('<div>').appendTo(this.menu);
        this.logwith = $('<p>').appendTo(this.text).html('Login with: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Facebook, Google</a>');
        this.lang = $('<p>').appendTo(this.text).html('Language: <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard" title="Coming soon">Translate</a>');
      },

      start: function(){
        game.message.text('');
        this.input.focus();
        game.loader.removeClass('loading');
        if(game.debug){
          this.input.val('Bot'+(parseInt(Math.random()*100)));
          //this.button.click();
        }
      },

      end: function(){
        this.button.attr( "disabled", false );
      },
    },

    ////////////////////////////////////////////////////////////////////////////////////////
    'menu': {
      ////////////////////////////////////////////////////////////////////////////////////////  

      build: function(){     
        this.menu = $('<div>').appendTo(this.el).addClass('box'); 
        this.title = $('<h1>').appendTo(this.menu).text('Choose a game mode');
        this.public = $('<button>').appendTo(this.menu).attr({'title': 'Find an adversary online'}).text('Play public match').click(function(){    
          game.mode = 'public';
          game.states.changeTo('choose');
        });

        this.friend = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Search for a friend to play', 'disabled': true }).text('Play with a friend');        
        this.bot = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Play with against the computer', 'disabled': true }).text('Play with a bot');    
        this.options = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - User Configurations'}).text('Options').click(function(){
          game.states.changeTo('options');
        }); 
        this.credits = $('<button>').appendTo(this.menu).attr({ 'title': 'Coming soon - Credits', 'disabled': true }).text('Credits');
      },

      start: function(){      
        game.loader.removeClass('loading');
        game.triesCounter.text('');
        game.message.html('Welcome <b>'+game.player.name+'</b>! ');
        $('<small>').addClass('logout').appendTo(game.message).text('Logout').click(function(){
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
    ////////////////////////////////////////////////////////////////////////////////////////
    'options': {
      ////////////////////////////////////////////////////////////////////////////////////////  

      build: function(){     
        this.menu = $('<div>').appendTo(this.el).addClass('box'); 
        this.title = $('<h1>').appendTo(this.menu).text('Options');

        this.resolution = $('<div>').appendTo(this.menu).attr({'title': 'Screen resolution'}).addClass('screenresolution');
        $('<h2>').appendTo(this.resolution).text('Resolution');
        $('<label>').text('High').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'high'}).change(this.changeResolution));
        $('<label>').text('Medium').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', checked: true}).change(this.changeResolution));
        $('<label>').text('Low').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'low'}).change(this.changeResolution));

        this.audio = $('<div>').appendTo(this.menu).attr({'title': 'Audio configuration'}).addClass('audioconfig');
        $('<h2>').appendTo(this.audio).text('Audio');
        this.muteinput = $('<input>').attr({type: 'checkbox', name: 'mute'}).change(this.mute);
        $('<label>').text('Mute').appendTo(this.audio).append(this.muteinput);      
        this.volumecontrol = $('<div>').addClass('volumecontrol');
        this.volumeinput = $('<div>').addClass('volume').on('mousedown.volume', this.volumedown).append(this.volumecontrol);
        $('<label>').text('Volume').appendTo(this.audio).append(this.volumeinput);
        $(document).on('mouseup.volume', game.states.options.volumeup);
        this.back = $('<button>').appendTo(this.menu).attr({'title': 'Back'}).text('Back').click(function(){ game.states.backState(); });

        this.opt =  $('<img src="img/opt.png">').appendTo(game.topbar).addClass('opt').hide().click(function(){
          game.states.changeTo('options');        
        });
      },

      mute: function(){
        if(this.checked) {
          game.mute.gain.value = 0;
          game.states.options.volumecontrol.css('transform', 'scale(0)');
        } else {
          game.mute.gain.value = 1;
          game.states.options.volumecontrol.css('transform', 'scale(1)');
        }

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
      },

      changeResolution: function(){ 
        var resolution = $('input[name=resolution]:checked', '.screenresolution').val();
        game.states.el.removeClass('low high').addClass(resolution);
      }
    },

    ////////////////////////////////////////////////////////////////////////////////////////
    'choose': {   
      ////////////////////////////////////////////////////////////////////////////////////////  

      build: function(){    
        this.pickbox = $('<div>').appendTo(this.el).addClass('pickbox').attr('title', 'Choose your heroes');
        this.pickedbox = $('<div>').appendTo(this.el).addClass('pickedbox').addClass('hidden').on('contextmenu', game.nomenu);
        for(var slot = 0; slot < 5; slot++){
          $('<div>').appendTo(this.pickedbox).attr({title: 'Right click here to pick'}).data('slot', slot).addClass('slot available');
        }
        this.prepickbox = $('<div>').appendTo(this.el).addClass('prepickbox').html('My Decks<br>Comming soon...').addClass('hidden');
        this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').addClass('hidden');

        this.pickDeck = Deck({
          name: 'heroes', 
          cb: function(pickDeck){
            pickDeck.addClass('pickdeck').appendTo(game.states.choose.pickbox);
            game.states.choose.size = 100;
            $.each(pickDeck.data('cards'), function(id, card){
              card.on('click.active', game.states.choose.active);
            });
            pickDeck.width(100 + $('.card').width() * pickDeck.children().length);
            pickDeck.children().first().click();
          }
        });      
      },

      start: function(){ 
        game.loader.addClass('loading');      
        game.currentData = {};
        if(game.mode == 'public') this.checkPublic();
      },

      active: function(){
        var card = $(this);
        $('.card.active').removeClass('active');
        card.addClass('active');
        game.states.choose.pickDeck.css('margin-left', card.index() * card.width()/2 * -1);
      },

      checkPublic: function(){
        game.db({'get':'waiting'}, function(waiting){         
          if(waiting.id == 'none'){
            game.seed = new Date().valueOf();
            game.id = btoa(game.seed);
            game.db({'set': 'waiting', 'data': {id: game.id}}, function(){ 
              game.player.type = 'challenged';
              game.states.choose.searchGame();            
            });
          } else {             
            game.id = waiting.id;     
            game.seed = parseInt(atob(game.id));
            var clearWait = {id: 'none'};            
            game.db({'set': 'waiting', 'data': clearWait}, function(){    
              game.player.type = 'challenger';
              game.states.choose.foundGame();
            });              
          }
        });   
      },

      searchGame: function(){   
        game.currentData.challenged = game.player.name;
        game.db({'set': game.id, 'data': game.currentData}, function(){
          game.message.text('Waiting for an enemy');        
          game.tries = 1;   
          game.states.choose.keepSearching();
        }); 
      },    

      keepSearching: function(){
        game.db({'get': game.id }, function(found){
          if(found.challenger){
            game.triesCounter.text('');
            game.currentData = found;
            game.states.choose.battle(found.challenger, 'challenger');         
          } else {
            game.triesCounter.text(game.tries++);                
            if(game.tries > game.waitLimit) {
              game.message.text('Sorry but we could not find an opponent');
              var clearWait = {id: 'none'};            
              game.db({'set': 'waiting', 'data': clearWait}, function(){    
                setTimeout(function(){                
                  game.states.changeTo('menu'); //todo: sugest bot match 
                }, 2000); 
              });
            }
            else game.timeout = setTimeout(game.states.choose.keepSearching, 1000);
          }
        });
      },

      foundGame: function(){       
        game.message.text('We found a game! Connecting');
        game.db({'get': game.id }, function(found){     
          if(found.challenged){
            game.triesCounter.text('');
            game.currentData = found;  
            game.currentData.challenger = game.player.name;
            game.db({'set': game.id, 'data': game.currentData}, function(){
              game.states.choose.battle(found.challenged, 'challenged');
            });  
          } else game.states.load.reset();
        });
      },  

      battle: function(enemy, challenge){     
        game.status = 'picking';
        game.loader.removeClass('loading');
        this.el.addClass('turn');
        game.enemy.name = enemy; 
        game.enemy.type = challenge; 
        game.message.html('Battle Found! <b>'+ game.player.name + '</b> vs <b class="enemy">' + game.enemy.name+'</b>');                
        this.counter.removeClass('hidden');
        game.sounds.matchready.start();
        this.count = game.debug ? 1 : game.timeToPick;
        this.enablePick();
        clearTimeout(game.timeout);
        game.timeout = setTimeout(game.states.choose.pickCount.bind(this), 1000);      
      },

      enablePick: function(){
        this.pickedbox.removeClass('hidden');
        this.prepickbox.removeClass('hidden');
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
        card.addClass('active');
        game.states.choose.pickDeck.css('margin-left', card.index() * card.width()/2 * -1);    
        pick.removeClass('active').appendTo(slot).off('click.active');
        if($('.slot.available').length == 0){
          game.player.mana = 0;
          $('.slot .card').each(function(){
            var card = $(this);
            game.player.mana += card.data('mana');
          });
          game.player.cardsPerTurn = 1 + Math.round(game.player.mana/10); 
          game.states.choose.counter.text('Game starts in: '+(game.states.choose.count--)+' Cards per turn: '+ game.player.cardsPerTurn); 
        } else states.choose.counter.text('Pick your deck, game starts in: '+(game.states.choose.count--));
        return false;
      },

      pickCount: function(){ 
        if($('.slot.available').length != 0) this.counter.text('Pick your deck, game starts in: '+(this.count--)); 
        else this.counter.text('Game starts in: '+(this.count--)+' Cards per turn: '+ game.player.cardsPerTurn); 
        if(this.count < 0) {
          this.counter.text('Get Ready!');  
          this.disablePick();        
          this.fillDeck();   
        }
        else setTimeout(this.pickCount.bind(this), 1000);
      },

      fillDeck: function(){
        game.player.picks = [];
        $('.pickbox .card.active').removeClass('active');
        if(game.debug){
          if(game.player.type == 'challenger') game.player.picks = ['wk','cm','ld','nyx','kotl'];
          else game.player.picks = ['ld','cm','pud','am','kotl'];
          game.states.choose.sendDeck();        
          return;
        }      
        $('.slot').each(function(){
          var slot = $(this), card;
          if(slot.hasClass('available')){
            card = Deck.randomCard($('.pickbox .card'), 'noseed');
            slot.append(card).removeClass('available');
          } else  card = $('.card', slot);
          game.player.picks[slot.data('slot')] = card.data('hero');
          if(game.player.picks.length == 5) game.states.choose.sendDeck();        
        });   
      },

      sendDeck: function(){     
        this.el.removeClass('turn'); 
        this.pickDeck.css('margin-left', 0);
        clearTimeout(this.timeout);
        this.tries = 1;
        if(game.player.type == 'challenged'){
          game.currentData.challengedDeck = game.player.picks.join('|');
          game.db({'set': game.id, 'data': game.currentData}, function(){          
            game.states.choose.getChallengerDeck();
          });
        }
        if(game.player.type == 'challenger') this.getChallengedDeck();         
      },

      getChallengerDeck: function(){ 
        game.message.text('Loading challenger deck');
        game.loader.addClass('loading');
        game.db({'get': game.id }, function(found){         
          if(found.challengerDeck){
            game.triesCounter.text('');
            game.currentData = found;
            game.enemy.picks = game.currentData.challengerDeck.split('|');
            game.states.changeTo('table');          
          } else {
            game.triesCounter.text(game.tries++);
            if(game.tries > game.connectionLimit) game.states.load.reset();
            else game.timeout = setTimeout(game.states.choose.getChallengerDeck, 1000);
          }
        });
      },

      getChallengedDeck: function(){
        game.message.text('Loading enemy deck');
        game.loader.addClass('loading');
        game.db({'get': game.id }, function(found){         
          if(found.challengedDeck){ 
            game.triesCounter.text('');
            game.currentData = found;    
            game.currentData.challengerDeck = game.player.picks.join('|');
            game.enemy.picks = game.currentData.challengedDeck.split('|');
            game.db({'set': game.id, 'data': game.currentData}, function(){            
              game.states.changeTo('table');
            });              
          } else {
            game.triesCounter.text(game.tries++);
            if(game.tries > game.connectionLimit) game.states.load.reset();
            else game.timeout = setTimeout(game.states.choose.getChallengedDeck, 1000);
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
        this.time =  $('<p>').appendTo(game.topbar).addClass('time').text('Time: 0:00 Day').hide();
        this.turns =  $('<p>').appendTo(game.topbar).addClass('turns').text('Turns: 0/0 (0)').hide();
        this.selectedArea = $('<div>').appendTo(this.el).addClass('selectedarea');
        this.buildMap();        
      },

      start: function(){      
        if(!game.builded) game.build();      
        this.time.show();
        this.turns.show();
        game.states.options.opt.show();
      },

      end: function(){
        this.time.hide();
        this.turns.hide();
        game.states.options.opt.hide();
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
          name: 'Tower',        
          attribute: 'Building',
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
          game.sounds.towerprojectile.start();  
          game.player.tower.attack(lowestHp);
          var fromSpot = Map.getPosition(game.player.tower);
          var toSpot = Map.getPosition(lowestHp);
          game.currentData.moves.push('A:'+fromSpot+':'+toSpot); 
        }
      },

      createTree: function(spot){
        var tree = Card({
          className: 'tree static neutral',
          name: 'Tower',        
          attribute: 'Forest Tree'
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

      placeHeroes: function(){ 

        var xxx = 'F3';//'I1';
        if(game.player.picks && game.enemy.picks){

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
                  if(p==0) card.place(xxx);
                }

              });
            }
          });  

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
                  if(p==0) card.place(Map.mirrorPosition(xxx));
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

        game.enemy.maxCards = Math.round(game.enemy.mana/2); 
        game.enemy.cardsPerTurn = 1 + Math.round(game.enemy.mana/10);   

        this.playerHand = $('<div>').appendTo(this.el).addClass('player deck skills hand');
        this.playerPermanent = $('<div>').appendTo(this.el).addClass('player deck skills permanent');
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
              if(skill.data('special')) {              
                if(skill.data('special') == 'Permanent') skill.appendTo(game.states.table.playerPermanent);              
              } else if(skill.data('skill') == 'ult') skill.appendTo(game.states.table.playerUlts);       
            });        
          }
        });
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

        game.player.buyCard = function(){
          if(game.player.turn == 6) ('.player.deck.skills.ult .card').appendTo(game.states.table.playerSkillsDeck);
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
        };

        game.enemy.buyCard = function(){ 
          game.enemy.hand++;
          game.random(); 
        }

      },

      selectHand: function(){      
        for(var i=0; i<game.player.cardsPerTurn; i++){
          if(game.states.table.playerHand.children().length < game.player.maxCards) 
            game.player.buyCard();
        }      
      },    

      enemyHand: function(){
        for(var i=0; i<game.enemy.cardsPerTurn; i++){
          if(game.enemy.hand < game.enemy.maxCards){
            game.enemy.buyCard();          
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

      firstTurn: function(){ 
        game.currentData = {};
        game.player.kills = 0;
        game.enemy.kills = 0;

        game.states.table.el.click(function(event){
          var target = $(event.target)
          if(!target.closest('.selected').length && 
             !target.closest('.selectedarea').length) Card.unselect();
        });
        game.player.tower.select();
        game.states.table.beginTurn();
      },

      beginTurn: function(){      
        //todo: update storage.state = game.state - each hero hp position buffs etc, each player skill hand
        if(game.status != 'over') {    
          game.currentData.moves = []; 
          game.states.table.el.addClass(game.status);
          if(game.status == 'turn') game.message.text('Your turn now!');
          if(game.status == 'unturn') game.message.text('Enemy turn now');       
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
            game.states.table.selectHand();               
            game.states.table.towerAutoAttack();        
            Map.highlight(); 
          } else {
            $('.map .card.enemy').removeClass('done');
            game.states.table.enemyHand();
          }
          game.time = game.player.turn + game.enemy.turn;  
          game.states.table.counter = (game.debug) ? 5 : game.timeToPlay;
          clearTimeout(game.timeout);
          game.timeout = setTimeout(game.states.table.turnCount.bind(game.states.table), 1000);
        }
      },

      turnCount: function(){
        game.loader.removeClass('loading');
        this.time.text('Time: '+this.hours()+' '+this.dayNight());     
        this.turns.text('Turns: '+game.player.turn+'/'+game.enemy.turn +' ('+parseInt(game.time)+')');     
        if(game.status == 'turn') game.message.text('Your turn, you have '+this.counter+' seconds');
        if(game.status == 'unturn') game.message.text('Enemy turn ends in '+this.counter+' seconds');     
        if(this.counter-- < 1){
          $('.card.heroes').each(function(){
            var hero = $(this);
            hero.trigger('turnend', {target: hero});
          });
          if(game.status == 'turn') this.sendMoves();
          if(game.status == 'unturn') this.getMoves();    
        } else {
          game.time += 1 / game.timeToPlay;
          game.timeout = setTimeout(game.states.table.turnCount.bind(game.states.table), 1000);
        }
      },

      sendMoves: function(){
        $('.card.heroes').each(function(){
          var hero = $(this);
          hero.trigger('playerturnend', {target: hero});
        });
        game.message.text('Uploading your turn '+game.player.turn);
        game.loader.addClass('loading');
        Map.unhighlight();
        $('.card .damaged').remove();
        $('.card .heal').remove();
        game.status = 'unturn';
        game.states.table.el.removeClass('turn');    
        clearTimeout(game.timeout);
        game.states.table.sendData();
      },

      getMoves: function(){   
        game.message.text('Loading enemy turn '+(game.enemy.turn + 1));
        game.loader.addClass('loading');
        game.tries = 1;  
        game.states.table.el.removeClass('unturn');
        clearTimeout(game.timeout);
        game.timeout = setTimeout(game.states.table.getData, 1000);
      },

      sendData: function(){
        game.player.turn++;
        game.currentData[game.player.type + 'Turn'] = game.player.turn;  
        game.currentData.moves = game.currentData.moves.join('|');   
        game.db({'set': game.id, 'data': game.currentData}, function(){
          clearTimeout(game.timeout);
          game.timeout = setTimeout(game.states.table.beginTurn, 1000);
        });      
      },

      getData: function(){        
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
        if(hours < (game.dayLength/2) ) return 'Day';
        else return 'Night';
      },

      moveSelected: function(){
        var spot = $(this), card = game.selectedCard;
        if(game.selectedCard.hasClass('skill') && game.selectedCard.data('hero')) card = $('.map .card.player.'+game.selectedCard.data('hero'));
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

      passiveActivate: function(){
        var target = $(this), skill = game.selectedCard;
        var hero = skill.data('hero');
        var skillid = skill.data('skill');
        var toSpot = Map.getPosition(target);  
        if(hero && skillid && game.status == 'turn'){ 
          game.currentData.moves.push('P:'+toSpot+':'+skillid+':'+hero); 
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
        var target = $(this), skill = game.selectedCard, source = game.castSource;
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
        game.message.text('Your enemy moved. Get ready!');
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
            if(skills[hero][skillid].cast && skill && !source.hasClass('done') && source.hasClass('enemy') && source.cast){
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
            if(skills[hero][skillid].activate && skill && target.hasClass('enemy') && skill.activate){
              skill.activate(target);
              game.enemy.hand--;
            }
          }        
        }      
        $('.card.heroes').each(function(){
          var hero = $(this);
          hero.trigger('enemyturnend', {target: hero});
        });         
        clearTimeout(game.timeout);
        game.timeout = setTimeout(function(){
          if(game.status != 'over'){
            game.status = 'turn';
            game.states.table.enemySkillsDeck.removeClass('slide');
            $('.card.enemy.heroes').removeClass('done');
            $('.enemy.skills .card').hide();
            game.states.table.beginTurn();
            if(game.selectedCard) game.selectedCard.select()
              }
        }, 2000);
      },

      animateCast: function(skill, target, destiny){
        if(typeof target == 'string') target = $('#'+target);
        var t = skill.offset(), d = target.offset();
        skill.css({top: d.top - t.top + 30, left: d.left - t.left + 20, transform: 'translate(-50%, -50%) scale(0.3)'});
        setTimeout(function(){          
          $(this.card).css({top: '', left: '', transform: ''}).appendTo(this.destiny);          
          if(skill.hasClass('selected') && game.castSource) game.castSource.select();
        }.bind({ card: skill, destiny: destiny }), 500);
      },

      win: function(){
        game.winner = game.player.name;
        game.states.table.el.addClass('turn');
        game.message.text('Congratulations, you won!'); 
        game.states.table.sendData();
        game.status = 'over';      
        game.states.table.showResults();
      },    

      lose: function(){      
        game.winner = game.enemy.name;
        game.states.table.el.addClass('unturn');
        game.message.text('Game Over!');
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
        $('<button>').appendTo(this.resultsbox).text('Close')
        .click(function(){  
          $('#table .card').remove();
          $('#table .deck').remove();
          this.resultsbox.remove();
          game.builded = false;
          game.states.changeTo('menu');
        });
      }

    } //states.table end
    
  }, //states end
  
  db: function(send, cb){
    if(send.data) send.data = JSON.stringify(send.data);
    $.ajax({
      type: "GET", 
      url: game.debug ? 'http://localhost/db' : 'http://dotacard.herokuapp.com/db', 
      data: send, 
      complete: function(receive){
        var data;
        if(receive.responseText) data = JSON.parse(receive.responseText); 
        if(cb) cb(data || {});
      }
    });
  },
  
  audioctx: new AudioContext(), sounds: {}, 
  audio: function(name){
    if(!game.mute) game.createMuteGain();
    var ajax = new XMLHttpRequest(); 
    ajax.open("GET", '/audio/'+name+'.mp3', true); 
    ajax.responseType = "arraybuffer"; 
    ajax.onload = function(){ 
      game.audioctx.decodeAudioData(ajax.response, function(buffer){ 
        game.sounds[name] = game.audioctx.createBufferSource();
        game.sounds[name].buffer = buffer;
        game.sounds[name].connect(game.mute);
      }); 
    }; 
    ajax.send();   
  },
  createMuteGain: function(){
    game.mute = game.audioctx.createGain();
    game.mute.connect(game.audioctx.destination);
  }
};
$(game.start);

