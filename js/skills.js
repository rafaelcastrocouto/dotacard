var skills = {
  wk: {
    stun: {
      cast: function(skill, source, target){       
        states.table.animateCast(skill, target, states.table.playerCemitery);
      },
      dot: function(){},
      end: function(){}
    },
    lifesteal: {
      activate: function(skill, source){},
      hit: function(){}
    },
    crit: {
      activate: function(skill, source){
        source.addBuff(skill).data('hit', true).on('hit', this.hit);
      },
      hit: function(e, data){
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
        source.addClass('done').damage(damage, target, 'Physical');
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