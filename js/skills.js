var skills = {
  wk: {
    stun: {
      cast: function(skill, source, target){
        if(game.status == 'turn') states.table.animateCast(skill, target, states.table.playerCemitery);
        source.damage(skill.data('damage'), target, skill.data('damageType'));
        var stunbuff = source.addBuff(target, skill, skill.data('stunduration'), 'stun');
        target.addStun(skill.data('stunduration'));
        var duration = skill.data('stunduration') + skill.data('dotduration');
        target.on('turnstart.wkdot', this.dot).data('wk-dot', {
          dotduration: skill.data('dotduration'),
          duration: duration, 
          source: source, 
          skill: skill
        });
      },
      dot: function(event, data){
        var target = data.target;
        var data = target.data('wk-dot');
        var source = data.source;
        var skill = data.skill;
        var dotduration = data.dotduration; 
        var duration = data.duration; 
        if(duration > 0){
          if(duration == dotduration) source.addBuff(target, skill, dotduration, 'dot');
          if(duration <= dotduration) source.damage(skill.data('dot'), target, skill.data('damageType'));            
          duration--;
          data.duration = duration;
          target.data('wk-dot', data);
        } else {
          target.off('turnstart.wkdot');
          target.data('wk-dot', null);
          //target.removeBuff('wk-dot');
        } 
      }
    },
    lifesteal: {
      activate: function(skill, source){
        var side = source.data('side');
        var team = $('.table .card.heroes.'+side).data('wk-ls', skill);
        source.addBuff(team, skill);
        team.on('attack', this.attack);     
      },
      attack: function(event, data){ 
        var source = data.source, target = data.target;        
        var damage = source.data('damage');
        var skill = source.data('wk-ls');
        var bonus = skill.data('percentage') / 100;
        source.heal(damage * bonus);
      }
    },
    crit: {
      activate: function(skill, source){
        source.addBuff(source, skill);
        source.data('replacedamage', true).on('attack', this.attack).data('wk-crit', skill);
      },
      attack: function(event, data){
        var source = data.source, target = data.target;
        var skill = source.data('wk-crit');
        var damage = source.data('damage');
        var chance = skill.data('chance') / 100;
        var bonus = skill.data('percentage') / 100;
        var r = game.random();
        if(r < chance){
          damage *= bonus;
          source.data('crit', true);          
        }
        source.damage(damage, target, 'Physical');
      }
    },
    ult: {
      activate: function(skill, source){
        source.on('die.wkult', this.die); game.log('ult', skill, source);
      },
      die: function(event, data){       
        var target = data.target;        
        var spot = $('#'+data.spot).addClass('cript'); 
        var skill = $('.player.hand .wk-ult');
        if(target.hasClass('player')) {
          states.table.animateCast(skill, spot, states.table.playerCemitery);
        } else skill = $('.enemy.hand .wk-ult');
        target.off('die.wkult');
        target.data('wk-ult', {
          duration: game.skills.wk.ult.delay, 
          spot: data.spot,
          skill: skill
        }).on('turnstart.wkult', skills.wk.ult.reborn);  game.log('die',target, spot);
      },
      reborn: function(event, data){
        var wk = data.target;        
        wk.off('turnstart.wkult');
        var data = wk.data('wk-ult');
        var spot = data.spot;
        var skill = data.skill;
        var duration = data.delay; game.log('reborn',wk, spot, duration);
        var side = source.data('side');
        if(duration > 0){
          duration--;
          data.duration = duration;
          wk.data('wk-ult', data);
        } else {
          $('#'+spot).removeClass('cript');
          wk.reborn(spot).data('wk-ult', null);
          Map.inRange(spot, game.skills.wk.ult.range, function(neighbor){      
            var card = $('.card', neighbor).not(side); 
            var slowbuff = wk.addBuff(card, skill, skill.data('duration'));            
          });
          game[side].buyCard();
        }
      }
    }    
  },
  

  ktol: {
    illuminate: {      
      cast: function(skill, source, target){},
      release: function(){}
    },
    illuminateult: {
      cast: function(skill, source, target){},
      release: function(){}
    },
    leak: {
      cast: function(skill, source, target){
        states.table.animateCast(skill, target, states.table.playerCemitery);
      },
      movement: function(){},
      end: function(){}
    },
    mana: {
      cast: function(skill, source, target){
        states.table.animateCast(skill, target, states.table.playerCemitery);
      },
    },
    ult: {
      cast: function(skill, source){
        states.table.animateCast(skill, source, states.table.playerCemitery);
      },
      end: function(){}
    },
    blind: {
      cast: function(skill, source, target){
        states.table.animateCast(skill, target, states.table.playerCemitery);
      },
      hit: function(){},
      end: function(){}
    },
    recall: {
      cast: function(skill, source, target){},
      damage: function(){},
      end: function(){}
    }
  },
  

  cm: {
    slow: {
      cast: function(skill, source, target){
        states.table.animateCast(skill, source, states.table.playerCemitery);
      },
      end: function(){}
    },
    aura: {
      activate: function(skill, source){},
      buy: function(){}
    },
    freeze: {
      cast: function(skill, source, target){
        states.table.animateCast(skill, target, states.table.playerCemitery);
      },
      dot: function(){},
      end: function(){}
    },
    ult: {
      cast: function(skill, source){
        states.table.animateCast(skill, source, states.table.playerCemitery);
      },
      dot: function(){},
      end: function(){}
    }    
  },
  

  am: {
    burn: {
      activate: function(skill, source){},
      damage: function(){}
    },
    passive: {
      activate: function(skill, source){},
      damage: function(){}
    },
    blink: {
      cast: function(skill, source, target){
        source.css({opacity: 0});
        skill.css({opacity: 0});
        setTimeout(function(){
          this.source.place(this.target).css({opacity: 1});
          this.skill.discard();
          source.select();
        }.bind({skill: skill, source: source, target: target}), 500);        
      }
    },
    ult: {
      cast: function(skill, source, target){}
    }    
  },


  pud: {
    hook: {
      cast: function(skill, source, target){}
    },
    rot: {
      cast: function(skill, source){}
    },
    passive: {
      activate: function(skill, source){},
      damage: function(){},
      die: function(){}
    },
    ult: {
      cast: function(skill, source, target){},
      dot: function(){},
      end: function(){}
    }    
  },


  nyx: {
    stun: {
      cast: function(skill, source, target){},
      end: function(){}
    },
    burn: {
      cast: function(skill, source, target){},
      damage: function(){} 
    },
    spike: {
      cast: function(skill, source){},
      damage: function(){}
    },
    ult: {
      cast: function(skill, source){},
      damage: function(){}
    }    
  },

  ld: {
    summon: {
      cast: function(skill, source, target){}
    },
    rabid: {
      cast: function(skill, source){},
      end: function(){}
    },
    passive: {
      activate: function(skill, source){}
    },
    ult: {
      cast: function(skill, source){}  
    },
    cry: {
      cast: function(skill, source){},
      end: function(){}
    },
    transform: {
      cast: function(skill, source){}      
    }
  }

};