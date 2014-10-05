var skills = {
  wk: {
    stun: {
      cast: function(skill, source, target){
        if(game.status == 'turn') states.table.animateCast(skill, target, states.table.playerCemitery);
        source.damage(skill.data('damage'), target, skill.data('damageType'));
        var stunbuff = source.addBuff(target, skill, 'stun', skill.data('stunduration'));
        target.addStun(skill.data('stunduration'));
        var duration = skill.data('stunduration') + skill.data('dotduration');
        target.on('turnstart.wk', this.turnstart).data('wk-buff', {
          duration: duration,
          currentduration: duration, 
          source: source, 
          skill: skill
        });
      },
      turnstart: function(event, data){
        var target = data.target;
        var buff = target.data('wk-buff');
        var source = buff.source;
        var skill = buff.skill;
        var duration = buff.duration; 
        if(duration > 0){
          var dotstart = skill.data('dotduration') + 1;
          if(duration == dotstart) source.addBuff(target, skill, 'dot');
          if(duration <= dotstart) source.damage(skill.data('dot'), target, skill.data('damageType'));            
          duration--;
          buff.duration = duration;
          target.data('wk-buff', buff);
        } else {
          target.off('turnstart.wk');
          target.data('wk-buff', null);
          target.removeBuff('wk-dot');
        } 
      }
    },
    lifesteal: {
      activate: function(skill, source){
        var side = 'player'; if(source.hasClass('enemy')) side = 'enemy';
        var team = $('.table .card.heroes.'+side);
        source.addBuff(team, skill);
        team.on('attack', this.attack);     
      },
      attack: function(event, data){ 
        var source = data.source, target = data.target;        
        var damage = source.data('damage');
        var skillData = game.skills.wk.lifesteal;
        var bonus = skillData.percentage / 100;
        source.heal(damage * bonus);
      }
    },
    crit: {
      activate: function(skill, source){
        source.addBuff(source, skill)
        source.data('replacedamage', true).on('attack', this.attack);
      },
      attack: function(event, data){
        var source = data.source, target = data.target;
        var skill = game.skills.wk.crit;
        var damage = source.data('damage');
        var chance = skill.chance / 100;
        var bonus = skill.percentage / 100;
        var r = game.random();
        console.log('hit', r, chance, damage);
        if(r < chance){
          damage *= bonus;
          source.data('crit', true);          
        }
        source.damage(damage, target, 'Physical');
      }
    },
    ult: {
      activate: function(skill, source){},
      die: function(){},
      reborn: function(){}
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
          this.skill.appendTo(states.table.playerCemitery);
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