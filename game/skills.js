var Skills = {
  
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
      },
      movement: function(){}
    },
    mana: {
      cast: function(skill, source, target){
      },
    },
    ult: {
      cast: function(skill, source){
      }
    },
    blind: {
      cast: function(skill, source, target){
      },
      hit: function(){}
    },
    recall: {
      cast: function(skill, source, target){},
      damage: function(){}
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
      dot: function(){}
    }    
  },

  nyx: {
    stun: {
      cast: function(skill, source, target){
        
      },
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
      cast: function(skill, source, target){
        var side = source.data('side');
        var bear = $('.'+side+'.unit.ld.spiritbear');       
        if(!bear.hasClass('summoned')){
          source.data('bear', bear);         
          bear.addBuff(bear, game.buffs.ld.demolish);
          bear.data('ld-demolish', skill.data('demolishpercentage'));
          bear.on('attack', this.demolish);          
          bear.addBuff(bear, game.buffs.ld.entangle);
          bear.on('attack', this.entangle);
          bear.data('ld-entangle-skill', skill);
          bear.data('ld-return-cooldown', skill.data('returncooldown'));
          bear.on('damage', Skills.ld['return'].breakreturn);          
        } else bear.addClass('summoned');              
        var returnskillcard = $('.'+side+'.skill.ld-return');
        returnskillcard.appendTo(game.states.table.playerPermanent);      
        bear.changehp(bear.data('hp'));
        bear.place(target);
        if(side == 'player') bear.select();
        
      },
      demolish: function(event, eventdata){ 
        var source = eventdata.source;
        var target = eventdata.target;
        if(target.hasClass('tower')){
          var damage = source.data('currentdamage') * source.data('ld-demolish') / 100;
          source.damage(damage, target, 'Physical');
        }
      },
      entangle: function(event, eventdata){
        var source = eventdata.source;
        var target = eventdata.target;
        var skill = source.data('ld-entangle-skill');
        var chance = skill.data('entanglechance') / 100;
        if(game.random() < chance && !target.hasClass('entangled')){
          source.addBuff(target, game.buffs.ld.entangle);
          target.addClass('entangled');
          target.data('ld-entangle', {
            duration: skill.data('entangleduration'),
            source: source,
            skill: skill
          });
          target.on('turnstart.ld-entangle', Skills.ld.summon.entangling);
        }  
      },
      entangling: function(event, eventdata){
        var target = eventdata.target; 
        var data = target.data('ld-entangle');
        var skill = data.skill;
        var source = data.source;
        if(data.duration > 0) {
          data.duration--;
          target.data('ld-entangle', data);
          source.damage(skill.data('entangledamage'), target, 'Physical');
        } else {
          target.removeClass('entangled');
          target.off('turnstart.ld-entangle');
          target.data('ld-entangle', null);
          target.removeBuff('ld-entangle');
        }
      }
    },
    'return': {
       cast: function(skill, source, target){
        var side = source.data('side');
        var ld = $('.'+side+'.hero.ld');
        var bear = ld.data('bear');
        bear.css({opacity: 0});
        if(game.status == 'turn') skill.css({opacity: 0});
        setTimeout(function(){
          this.bear.place(this.target).css({opacity: 1});
          this.ld.select();
        }.bind({ld: ld, bear: bear, target: target }), 400);        
      },
      breakreturn: function(event, eventdata){
        var bear = eventdata.target;
        var side = bear.data('side');
        var returnskillcard = $('.'+side+'.skill.ld-return');
        returnskillcard.appendTo(game.states.table.playerTemp);
        bear.data('currentreturncooldown', bear.data('ld-return-cooldown'));
        bear.on('turnstart.ld-return', Skills.ld['return'].turnstart);
      },
      turnstart: function(event, eventdata){
        var bear = eventdata.target; 
        var duration = bear.data('currentreturncooldown');        
        if(duration > 0) {
          duration--;
        } else {
          returnskillcard.appendTo(game.states.table.playerPermanent);
          bear.data('currentreturncooldown', null);
          bear.off('turnstart.ld-return');
        }
      }
    },
    rabid: {
      cast: function(skill, source){
        var side = source.data('side');
        var ld = $('.'+side+'.hero.ld');
        ld.addBuff(ld, skill.data('buff'));
        var damage = ld.data('currentdamage');
        ld.changedamage(damage + skill.data('damagebonus'));
        var speed = ld.data('currentspeed');
        ld.data('currentspeed', speed + 1);
        var bear = ld.data('bear');
        if(bear && !bear.hasClass('dead')){
          var beardamage = bear.data('currentdamage');
          bear.changedamage(beardamage + skill.data('damagebonus'));
          var bearspeed = bear.data('currentspeed');
          bear.data('currentspeed', bearspeed + 1);
          ld.addBuff(bear, skill.data('buff'));
        }
        ld.data('ld-rabid', skill.data('duration'));
        ld.data('ld-rabid-damagebonus', skill.data('damagebonus'));
        ld.on('turnstart.ld-rabid', Skills.ld.rabid.turnstart);
      },
      turnstart: function(event, eventdata){
        var target = eventdata.target; 
        var duration = target.data('ld-rabid');
        if(duration > 0){
          duration--;
          target.data('ld-rabid', duration);
        } else {
          var damage = target.data('currentdamage');
          target.changedamage(damage - target.data('ld-rabid-damagebonus'));
          var speed = target.data('currentspeed');
          target.data('currentspeed', speed - 1);
          target.off('turnstart.ld-rabid');
          target.data('ld-rabid', null);
          target.removeBuff('ld-rabid');
          var bear = target.data('bear');
          if(bear && bear.hasBuff('ld-rabid')){
            var beardamage = bear.data('currentdamage');
            bear.changedamage(beardamage - target.data('ld-rabid-damagebonus'));
            var bearspeed = bear.data('currentspeed');
            bear.data('currentspeed', bearspeed - 1);            
            bear.removeBuff('ld-rabid');
          }
        }
      }
    },
    passive: {
      activate: function(skill, source){
        var side = source.data('side');
        var ld = $('.'+side+'.hero.ld');
        ld.addBuff(ld, skill.data('buff'));
        var rabids = $('.'+side+'.skill.ld-rabid');
        var duration = rabids.data('duration');
        rabids.data('duration', duration + skill.data('rabidbonus'));
        var ults = $('.'+side+'.skill.ld-ult');
        var hpbonus = ults.data('hpbonus');
        ults.data('hpbonus', hpbonus + skill.data('ultbonus'));
        var bear = ld.data('bear');
        if(bear){
          ld.addBuff(bear, skill.data('buff'));
          var beardamage = bear.data('currentdamage');
          bear.changedamage(beardamage + skill.data('bearbonus'));
          var bearhp = bear.data('hp'); 
          var currenthp = bear.data('currenthp'); 
          var relativehp = currenthp / bearhp;
          bear.data('hp', bearhp + skill.data('hpbonus'));
          bear.data('currenthp', bear.data('hp') * relativehp);         
        }
      }
    },
    ult: {
      cast: function(skill, source){
        var side = source.data('side');
        var transform = $('.'+side+'.skill.ld-transform');
        transform.appendTo(game.states.table.playerPermanent);       
        var cry = $('.'+side+'.skill.ld-cry');
        cry.appendTo(game.states.table.playerPermanent);        
        var ldhp = source.data('hp'); 
        var currenthp = source.data('currenthp');
        var relativehp = currenthp / ldhp;
        source.data('hp', ldhp + skill.data('hpbonus'));
        source.data('currenthp', source.data('hp') * relativehp);
        var armor = source.data('armor');
        source.data('armor', + skill.data('armorbonus'));   
        source.addClass('transformed');
      }  
    },
    transform: {
      cast: function(skill, source){
        var side = source.data('side');
        var transform = $('.'+side+'.skill.ld-transform');
        transform.appendTo(game.states.table.playerTemp);        
        var cry = $('.'+side+'.skill.ld-cry');
        cry.appendTo(game.states.table.playerTemp);
        var ldhp = source.data('hp'); 
        var currenthp = source.data('currenthp');
        var relativehp = currenthp / ldhp;
        source.data('hp', ldhp - skill.data('hpbonus'));
        source.data('currenthp', source.data('hp') * relativehp);
        var armor = source.data('armor');
        source.data('armor', - skill.data('armorbonus'));           
        source.removeClass('transformed');        
      }      
    },    
    cry: {
      cast: function(skill, source){
        source.addBuff(source, skill.data('buff'));
        var armor = source.data('armor');
        source.data('armor', + skill.data('armorbonus'));  
        var damage = source.data('currentdamage');
        source.changedamage(damage + skill.data('damagebonus'));
        var bear = source.data('bear');
        if(bear){
          source.addBuff(bear, skill.data('buff'));
          var beararmor = bear.data('armor');
          bear.data('armor', beararmor + skill.data('armorbonus'));  
          var beardamage = bear.data('currentdamage');
          bear.changedamage(beardamage + skill.data('damagebonus'));
        }
        source.data('ld-cry', skill.data('duration'));
        source.data('ld-cry-damagebonus', skill.data('damagebonus'));
        source.data('ld-cry-armorbonus', skill.data('armorbonus'));
        source.on('turnstart.ld-cry', Skills.ld.cry.turnstart);
      },
      turnstart: function(event, eventdata){
        var target = eventdata.target; 
        var duration = target.data('ld-cry');
        if(duration > 0) {
          duration--;
          target.data('ld-cry', duration);
        } else {
          var damage = target.data('currentdamage');
          target.changedamage(damage - target.data('ld-cry-damagebonus'));        
          var armor = target.data('armor');
          target.data('armor', armor - target.data('ld-cry-armorbonus'));
          target.off('turnstart.ld-cry');
          target.data('ld-cry', null);
          target.removeBuff('ld-cry');
          var bear = source.data('bear');
          if(bear && bear.hasBuff('ld-cry')){
            var beardamage = bear.data('currentdamage');
            bear.changedamage(beararmor - target.data('ld-cry-damagebonus'));                
            var beararmor = bear.data('armorbonus');
            bear.data('armorbonus', beararmor - target.data('ld-cry-armorbonus'));           
            bear.removeBuff('ld-rabid');
          }
        }
      }
      
    }
    
  },  
  
  wk: {
    stun: {
      cast: function(skill, source, target){           
        var wk = source;
        var stun = skill.data('stunduration');
        var dot = skill.data('dotduration');
        if(game.status == 'turn') game.states.table.animateCast(skill, target, game.states.table.playerCemitery);
        wk.damage(skill.data('damage'), target, skill.data('damageType'));
        wk.addStun(target, stun);        
        target.on('turnstart.wk-stun', this.dot).data('wk-stun', {
          duration: stun + dot, 
          source: source, 
          skill: skill
        });
      },
      dot: function(event, eventdata){
        var target = eventdata.target;
        var data = target.data('wk-stun');
        var source = data.source;
        var skill = data.skill;
        var dotduration = skill.data('dotduration'); 
        var duration = data.duration; 
        if(duration > 0){
          if(duration == dotduration) {
            source.addBuff(target, skill.data('buff'), dotduration);
            var speed = target.data('speed') - 1;
            target.data('currentspeed', speed);
          }
          if(duration <= dotduration) source.damage(skill.data('dot'), target, skill.data('damageType'));            
          data.duration--;
          target.data('wk-stun', data);
        } else {
          var speed = target.data('speed') + 1;
          target.data('currentspeed', speed);
          target.removeBuff('wk-stun')
          target.off('turnstart.wk-stun');
          target.data('wk-stun', null);
        } 
      }
    },
    lifesteal: {
      activate: function(skill, source){
        var side = source.data('side');
        var team = $('.card.heroes.'+side);
        team.on('attack.wk-lifesteal', this.attack);
        team.data('wk-lifesteal', skill);
        source.addBuff(team, skill.data('buff'));
        source.on('die.wk-lifesteal', this.die);
        source.on('reborn.wk-lifesteal', this.reborn);
      },
      attack: function(event, eventdata){ 
        var source = eventdata.source;
        var target = eventdata.target;        
        var damage = source.data('currentdamage');
        var skill = source.data('wk-lifesteal');
        var bonus = skill.data('percentage') / 100;
        source.heal(damage * bonus);
      },
      die: function(event, eventdata){       
        var source = eventdata.target; 
        var side = source.data('side');
        var team = $('.card.heroes.'+side);        
        team.removeBuff('wk-lifesteal');
        team.off('attack.wk-lifesteal');
        team.data('wk-lifesteal', null);
      },
      reborn: function(event, eventdata){
        var source = eventdata.target; 
        var skill = source.data('wk-lifesteal');
        var side = source.data('side');
        var team = $('.card.heroes.'+side);
        source.addBuff(team, skill.data('buff'));
        team.on('attack.wk-lifesteal', this.attack);
        team.data('wk-lifesteal', skill);
      }
    },
    crit: {
      activate: function(skill, source){
        source.addBuff(source, skill.data('buff'));
        source.on({
          'beforeattack.wk': this.attack,
          'afterattack.wk': this.afterattack,
        }).data('wk-crit', skill);        
      },
      attack: function(event, eventdata){
        var source = eventdata.source;
        var target = eventdata.target;
        var skill = source.data('wk-crit');
        var damage = source.data('currentdamage');
        var chance = skill.data('chance') / 100;
        var bonus = skill.data('percentage') / 100;
        if(game.random() < chance){
          game.sounds.crit.start();
          damage *= bonus;
          source.data({
            'crit': true,
            'currentdamage': damage
          });
        }
      },
      afterattack: function(event, eventdata){
        var source = eventdata.source;
        source.data('currentdamage', source.data('damage'));
      }
    },
    ult: {
      activate: function(skill, source){
        source.on('die.wk-ult', this.die);
        source.data('wk-ult', skill);
        skill.on('discard', this.deactivate);
      },
      die: function(event, eventdata){       
        var wk = eventdata.target;      
        var spot = eventdata.spot;
        var skill = wk.data('wk-ult');
        $('#'+spot).addClass('cript');         
        wk.off('die.wk-ult');        
        wk.on('turnstart.wk-ult', Skills.wk.ult.resurrect).data('wk-ult', {
          skill: skill,
          spot: spot,
          duration: skill.data('delay')
        });
        if(this.hasClass('player')) this.appendTo(game.states.table.playerCemitery);
        else this.appendTo(game.states.table.enemySkillsDeck);
      },
      resurrect: function(event, eventdata){
        var wk = eventdata.target;
        var data = wk.data('wk-ult');
        var skill = data.skill;
        var spot = data.spot;
        var duration = data.duration; 
        var side = wk.data('side');
        if(duration > 0){
          data.duration--;
          wk.data('wk-ult', data);
        } else {
          $('#'+spot).removeClass('cript');
          wk.reborn(spot).data('wk-ult', null);
          Map.inRange(spot, Map.getRange(skill.data('aoe')), function(neighbor){      
            var otherside = 'enemy';
            if(side == 'enemy') otherside = 'player';
            var card = neighbor.find('.card.'+otherside); 
            if(card.length){
              wk.addBuff(card, skill.data('buff'));  
              var speed = card.data('speed') - 1;
              card.data('currentspeed', speed);
              card.on('turnstart.wk-ult', Skills.wk.ult.turnstart);
              card.data('wk-ult', skill.data('duration'));
            }
          });
          game[side].buyCard();
          wk.off('turnstart.wk-ult');
        }
      },
      turnstart: function(event, eventdata){
        var target = eventdata.target; 
        var duration = target.data('wk-ult');
        if(duration > 0) {
          duration--;
          target.data('wk-ult', duration);
        } else {
          var speed = target.data('currentspeed') + 1;
          target.data('currentspeed', speed);
          target.off('turnstart.wk-ult');
          target.data('wk-ult', null);
          target.removeBuff('wk-ult');
        }
      },
      deactivate: function(){
        source.off('die.wk-ult').data('wk-ult', null);
      }
    }    
  },

  cm: {
    slow: {
      cast: function(skill, source, target){
        var spot = Map.getPosition(target); 
        if(game.status == 'turn') game.states.table.animateCast(skill, spot, game.states.table.playerCemitery);
        var side = source.data('side');        
        var otherside = (side == 'enemy') ? 'player': 'enemy';
        Map.inRange(spot, Map.getRange(skill.data('aoe')), function(neighbor){      
          var card = neighbor.find('.card.'+otherside); 
          if(card.length){
            source.damage(skill.data('damage'), card, skill.data('damageType'));              
            if(card.data('cm-slow')){
              card.data('cm-slow', skill.data('duration'));
            } else {
              card.data('cm-slow', skill.data('duration'));
              source.addBuff(card, skill.data('buff'));                
              var speed = card.data('speed') - 1;
              card.data('currentspeed', speed);
              card.on('turnstart.cm-slow', Skills.cm.slow.turnstart);
            }            
          }
        });
      },
      turnstart: function(event, eventdata){
        var target = eventdata.target; 
        var duration = target.data('cm-slow');
        if(duration > 0) {
          duration--;
          target.data('cm-slow', duration);
        } else {
          var speed = target.data('currentspeed') + 1;
          target.data('currentspeed', speed);
          target.off('turnstart.cm-slow');
          target.data('cm-slow', null)
          target.removeBuff('cm-slow');
        }
      }
    },
    aura: {
      activate: function(skill, source){
        var side = source.data('side');
        game[side].cardsPerTurn++;
        source.on('die.cm-aura');        
        source.on('reborn.cm-aura');        
      },
      die: function(event, eventdata){   
        var cm = eventdata.target;
        var side = cm.data('side');  
        game[side].cardsPerTurn--;
      },
      reborn: function(event, eventdata){
        var cm = eventdata.target;
        var side = cm.data('side');   
        game[side].cardsPerTurn++;
      }
    },
    freeze: {
      cast: function(skill, source, target){
        source.addBuff(target, skill.data('buff'));
        target.addClass('frozen');
        target.data('cm-freeze', {
          source: source,
          skill: skill,
          duration: skill.data('duration')
        });
        target.on('turnstart.cm-freeze', this.dot);
      },
      dot: function(event, eventdata){
        var target = eventdata.target;
        var data = target.data('cm-freeze');
        var source = data.source;
        var skill = data.skill;
        var duration = data.duration;
        if(duration > 0) {
          source.damage(skill.data('dot'), target, skill.data('damageType'));
          duration--;
          data.duration = duration;
          target.data('cm-freeze', data);          
        } else {
          target.removeClass('frozen');
          target.data('cm-freeze', null);
          target.off('turnstart.cm-freeze');
          target.removeBuff('cm-freeze');
        }
      }
    },
    ult: {
      cast: function(skill, source){
        var spot = Map.getPosition(source); 
        if(game.status == 'turn') game.states.table.animateCast(skill, spot, game.states.table.playerCemitery);        
        source.on('channel', Skills.cm.ult.channel).data('cm-ult', skill);
        source.trigger('channel', {target: source});
      },
      channel: function(event, eventdata){
        var cm = eventdata.target;
        var skill = cm.data('cm-ult');
        var spot = Map.getPosition(cm); 
        var side = cm.data('side');        
        var otherside = (side == 'enemy') ? 'player': 'enemy';        
        Map.inRange(spot, Map.getRange(skill.data('range')), function(neighbor){      
          var card = neighbor.find('.card.'+otherside); 
          if(card.length){
            cm.damage(skill.data('damage'), card, skill.data('damageType'));              
            if(card.data('cm-ult')){
              card.data('cm-ult', skill.data('duration'));
            } else {
              card.data('cm-ult', skill.data('duration'));
              cm.addBuff(card, skill.data('buff'));                
              var speed = card.data('speed') - 1;
              card.data('currentspeed', speed);
              card.on('turnstart.cm-ult', Skills.cm.ult.turnstart);
            }            
          }
        });
      },
      turnstart: function(event, eventdata){
        var target = eventdata.target; 
        var duration = target.data('cm-ult');
        if(duration > 0) {
          duration--;
          target.data('cm-ult', duration);
        } else {
          var speed = target.data('currentspeed') + 1;
          target.data('currentspeed', speed);
          target.off('turnstart.cm-ult');
          target.data('cm-ult', null);
          target.removeBuff('cm-ult');
        }
      }
    }    
  },

  am: {
    burn: {
      activate: function(skill, source){
        source.on('attack.wk', this.attack).data('am-burn', skill);
        source.addBuff(source, skill.data('buff'));
        source.on('die.am-burn', this.die);
        source.on('reborn.am-burn', this.reborn);
      },
      attack: function(event, eventdata){ 
        var source = eventdata.source;
        var target = eventdata.target;
        var hero = target.data('hero');
        var side = source.data('side');
        if(side == 'enemy' && hero){
          var cards = game.states.table.playerHand.children('.'+hero);
          if(cards.length > 0){
            var card = Deck.randomCard(cards, 'noseed');
            card.discard();
          }
        }
      },
      die: function(event, eventdata){       
        var source = eventdata.target;      
        source.removeBuff('am-burn');
        source.off('attack.am-burn').data('am-burn', null);
      },
      reborn: function(event, eventdata){
        var source = eventdata.target; 
        var skill = source.data('am-burn');
        source.addBuff(source, skill.data('buff'));
        source.on('attack.am-burn', this.attack).data('am-burn', skill);
      }
    },
    passive: {
      activate: function(skill, source){
        source.data('resistance', skill.data('percentage') / 100);
      }
    },
    blink: {
      cast: function(skill, source, target){
        source.css({opacity: 0});
        if(game.status == 'turn') skill.css({opacity: 0});
        setTimeout(function(){
          if(this.skill.hasClass('player')) this.skill.appendTo(game.states.table.playerCemitery);
          else this.skill.appendTo(game.states.table.enemySkillsDeck);
          this.source.place(this.target).css({opacity: 1});
          this.source.select();
        }.bind({skill: skill, source: source, target: target}), 400);        
      }
    },
    ult: {
      cast: function(skill, source, target){
        var spot = Map.getPosition(target); 
        if(game.status == 'turn') game.states.table.animateCast(skill, spot, game.states.table.playerCemitery);
        var side = source.data('side');
        var otherside = (side == 'enemy') ? 'player': 'enemy';
        var damage = game.enemy.maxCards - game.enemy.hand;
        damage *= skill.data('multiplier');
        Map.inRange(spot, Map.getRange(skill.data('aoe')), function(neighbor){      
          var card = neighbor.find('.card.'+otherside); 
          if(card.length){
            source.damage(damage, card, skill.data('damageType'));
          }
        });
      }
    }    
  }

};