game.ai = {
  turnStart: function () {
    //console.clear();
    game.message.text(game.data.ui.enemymove);
    // remember ai is playing the enemy cards
    if (game.ai.mode == 'easy') {
      game.ai.movesLoop = 5;
      game.ai.noMovesLoop = 2;
      game.ai.lowChance = 0.3; // eg: if (r > low) choose random target
      game.ai.highChance = 0.6; // eg: if (r > high) choose random move destiny
    }
    if (game.ai.mode == 'normal') {
      game.ai.movesLoop = 8;
      game.ai.noMovesLoop = 4;
      game.ai.lowChance = 0.1;
      game.ai.highChance = 0.5;
    }
    if (game.ai.mode == 'hard') {
      game.ai.movesLoop = 16;
      game.ai.noMovesLoop = 6;
      game.ai.lowChance = 0.05;
      game.ai.highChance = 0.25;
    }
    // activate all passives, other sidehand skills strats per hero
    $('.enemydecks .sidehand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.passives(card);
    });
    // add combo data and strats
    game.ai.combo();
    // move and end turn
    // choose strat and decide moves
    game.ai.moveRandomCard();
  },
  moveRandomCard: function () {
    game.ai.resetData();
    // add attack and move data
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      var card = $(el);
      game.ai.buildData(card, 'enemy');
    });
    // add defensive data and strats
    $('.map .player.card').each(function (i, el) {
      var card = $(el);
      game.ai.buildData(card, 'player');
      //per hero defend
      if (card.hasClass('heroes')) {
        var hero = card.data('hero');
        game.ai.heroes[hero].defend(card);
      }
    });
    // add per hero data and strats
    game.ai.heroPlay();
    // choose random card
    var availableCards = $('.map .enemy.card:not(.towers, .done)');
    var card = availableCards.randomCard();
    var cardData = card.data('ai');
    game.ai.chooseStrat(card, cardData);
    game.ai.decideAction(card, cardData);
    // loop nextMove
    game.timeout(100, function () {
      if (game.currentData.moves.length) {
        game.enemy.autoMove(game.ai.nextMove);
      } else {
        game.ai.nextMove();
      }
    });
  },
  resetData: function () {
    // todo: ai.history
    game.currentData.moves = [];
    $('.map .card').each(function (i, el) {
      $(el).data('ai', game.ai.newData());
    });
  },
  passives: function (card) {
    // activate all pasives
    if (card.data('type') == game.data.ui.passive) {
      var skillId = card.data('skill');
      var heroId = card.data('hero');
      var hero = $('.map .enemy.heroes.'+heroId);
      var spotId = hero.getSpot().attr('id');
      game.currentData.moves.push('P:'+game.map.mirrorPosition(spotId)+':'+skillId+':'+heroId);
    }
  },
  newData: function () {
    var d = {
      'strat': '',
      'strats': {},
      'destiny': '',
      'destinys': [],
      'attack-targets': [],
      'can-move': false,
      'can-attack': false,
      'can-attack-tower': false,
      'attack-can-kill': false,
      'can-be-attacked': false,
      'can-be-killed': false,
      'at-tower-limit': false,
      'at-tower-attack-range': false,
      'at-fountain': false,
      'can-advance': false,
      'can-retreat': false,
      'can-cast': false,
      'cast-strats': [],
      'cast-targets': [],
      'can-make-action': false,
      'has-self-heal': false,
      'has-instant-attack-buff': false
    };
    $(game.ai.strats).each(function (i, strat) {
      d.strats[strat] = 1;
    });
    return d;
  },
  buildData: function (card, side) { 
    // console.log('buildData', card[0], card.data('ai'));
    var cardData = card.data('ai');
    if (card.data('current hp') < card.data('hp')/3) {
      cardData.strats.selfheal += 20;
    }
    var range = card.data('range');
    if (range) {
      card.opponentsInRange(range, function (opponentCard) {
        cardData['can-attack'] = true;
        cardData.strats.attack += 7;
        cardData['can-make-action'] = true;
        cardData['attack-targets'].push(opponentCard);
        var opponentData = opponentCard.data('ai');
        if (card.data('side')=='enemy') console.log(card[0], opponentCard[0]);
        opponentData['can-be-attacked'] = true;
        opponentData.strats.retreat += 6;
        if ( opponentCard.hasClass('towers') ) {
          cardData.strats.attack += 18;
          cardData['can-attack-tower'] = true;
        }
        var hp = opponentCard.data('current hp');
        var damage = card.data('current damage');
        var armor = opponentCard.data('current armor');
        if ( hp <= (damage - armor) ) {
          cardData['attack-can-kill'] = true;
          cardData.strats.attack += 18;
          opponentData['can-be-killed'] = true;
          opponentData.strats.retreat += 10;
        }
        opponentCard.data('ai', opponentData);
      });
    }
    var opponent = game.opponent(side);
    card.around(game.data.ui.melee, function (neighbor) {
      if (neighbor.hasClass(opponent+'area')) {
        cardData['at-tower-limit'] = true;
        cardData.strats.alert += 2;
      }
    });
    var spot = card.getSpot();
    if (spot.hasClass(opponent+'area')) {
      cardData['at-tower-attack-range'] = true;
      cardData.strats.retreat += 5;
    }
    if (spot.hasClass('fountain'+side)) {
      cardData['at-fountain'] = true;
      cardData.strats.advance += 5;
    }
    if (!card.hasClasses('static dead stunned rooted entangled disabled sleeping cycloned taunted') && side == 'enemy') {
      // advance
      var x = spot.getX(), y = spot.getY();
      var bot = game.map.getSpot(x, y + 1);
      var bl = game.map.getSpot(x - 1, y + 1);
      var left = game.map.getSpot(x - 1, y);
      if (bot && bot.hasClass('free')) {
        cardData['can-advance'] = true;
        cardData['can-move'] = true;
        cardData.strats.move += 1;
        cardData.strats.offensive += 1;
        cardData.destinys.push(bot);
      }
      if (left && left.hasClass('free')) {
        cardData['can-advance'] = true;
        cardData['can-move'] = true;
        cardData.strats.move += 1;
        cardData.strats.offensive += 1;
        cardData.destinys.push(left);
      }
      if (bl && bl.hasClass('free') && cardData['can-advance']) {
        cardData.destinys.push(bl);
      }
      // retreat
      var top = game.map.getSpot(x, y - 1);
      var tr = game.map.getSpot(x + 1, y - 1);
      var right = game.map.getSpot(x + 1, y);
      if (tr && tr.hasClass('free')) {
        cardData['can-retreat'] = true;
        cardData['can-move'] = true;
        cardData.strats.move += 1;
        cardData.strats.defensive += 1;
        cardData.destinys.push(tr);
      }
      if (top && top.hasClass('free')) {
        cardData['can-retreat'] = true;
        cardData['can-move'] = true;
        cardData.strats.move += 1;
        cardData.strats.defensive += 1;
        cardData.destinys.push(top);
      }
      if (right && right.hasClass('free') && cardData['can-retreat']) {
        cardData.destinys.push(right);
      }
      // top-left and bot-right
      var tl = game.map.getSpot(x - 1, y - 1);
      var br = game.map.getSpot(x + 1, y + 1);
      if (tl && tl.hasClass('free') && (top.hasClass('free') || left.hasClass('free'))) {
        cardData['can-move'] = true;
        cardData.strats.move += 1;
        cardData.destinys.push(tl);
      }
      if (br && br.hasClass('free') && (bot.hasClass('free') || right.hasClass('free'))) {
        cardData['can-move'] = true;
        cardData.strats.move += 1;
        cardData.destinys.push(br);
      }
    }
    card.data('ai', cardData);
    //console.log(cardData);
  },
  heroPlay: function () {
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      var card = $(el);
      var cardData = card.data('ai');
      card.data('ai', cardData);
      //per hero play
      if (card.hasClass('heroes')) {
        var hero = card.data('hero');
        cardData.strats[game.ai.heroes[hero].move.default] += 5;
        game.ai.heroes[hero].play(card, cardData);
      }
    });
  },
  combo: function () {
    var combos = [];
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      /*
      var card = $(el);
      var cardData = card.data('ai');

      todo: add combo strats {
        attack combos
        single unit skill combos
        aoe combos
        stuners/disablers combos
        displacement combos
      }

      cardData.strats.combo += 10;
      */
    });
  },
  chooseStrat: function (card, cardData) {
    // console.log(cardData.strats)
    var strats = [];
    $(game.ai.strats).each(function (i, strat) {
      strats.push({strat: strat, priority: cardData.strats[strat]});
    });
    // highest priority
    strats.sort(function (a, b) {
      return b.priority - a.priority;
    });
    if (Math.random() > game.ai.lowChance) {
      cardData.strat = strats[0].strat;
    } else {
      var validRandom = ['smart', 'stand', 'alert'];
      if (cardData['can-move']) {
        validRandom.push('move');
        validRandom.push('defensive');
        validRandom.push('retreat');
        validRandom.push('selfheal');
      }
      if (cardData['can-attack']) {
        validRandom.push('siege');
        validRandom.push('offensive');
        validRandom.push('attack');
      }
      if (cardData['can-cast']) {
        //validRandom.push('combo');
        validRandom.push('cast');
      }
      cardData.strat = game.ai.strats.random();
    }
  },
  strats: [
  // combo
    'siege',
    'attack',
    'cast',
    'offensive',
    'smart',
    'move',
    'stand',
    'alert',
    'defensive',
    'retreat',
    'selfheal'
  ],
  decideAction: function (card, cardData) {
    var strat = cardData.strat,
        action,
        target;
    if (strat == 'siege') {
      if (cardData['can-attack-tower']) {
        action = 'attack';
        target = $('.map .towers.enemy');
      } else if (cardData['can-advance']) {
        action = 'advance';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'attack') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'cast') {
      if (cardData['can-cast']) {
        action = 'cast';
      } else if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'combo') {
      action = cardData['combo-action'];
      target = cardData['combo-target'];
    }
    if (strat == 'offensive') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'secure') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (!cardData['can-be-attacked'] && cardData['can-advance']) {
        action = 'advance';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'smart') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance'] && !cardData['at-tower-limit'] && !cardData['can-be-attacked']) {
        action = 'advance';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'move') {
      if (cardData.destiny && cardData.destiny.hasClass('free')) {
        action =  'move';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'stand') {
      if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'alert') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'defensive') {
      if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'retreat') {
      if (cardData['can-retreat']) {
        action = 'retreat';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'selfheal') {
      if (cardData['has-self-heal']) {
        action = 'selfheal';
      } else if (cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (action == 'any') {
      var hero = card.data('hero');
      if (hero && 
          game.ai.heroes[hero] &&
          game.ai.heroes[hero].action == 'attack' && 
          cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-cast']) {
        action = 'cast';
      } else if (cardData['can-attack']) {
        action = 'attack';
      }
    }
    // console.log(card[0],strat, action);
    if (action) {
      if (action == 'move' || action == 'advance' || action == 'retreat') {
        target = cardData.destiny;
        if (!target) {
          target = game.ai.chooseDestiny(cardData.destinys);
        }
      }
      if (action == 'attack'){
        if (!target) target = game.ai.chooseTarget(cardData['attack-targets']);
        if (cardData['has-instant-attack-buff']) {
          // todo: activate instant skills
        }
      }
      if (action == 'cast') {
        var castStrats = cardData['cast-strats'];
        if (castStrats.length) {
          var castStrat = game.ai.chooseCast(castStrats);
          cardData['cast-skill'] = castStrat.skill;
          if (!target) {
            if (Math.random() > game.ai.highChance) target = castStrat.targets[0];
            else target = castStrat.targets.random();
          }
          if (cardData['has-instant-cast-buff']) {
            // todo: activate instant skills
          }
        }
      }
      if ((action == 'move' || action == 'advance' || action == 'retreat' || action == 'attack' || action == 'cast') && !target) {
        cardData.strat = game.ai.strats.random();
        game.ai.decideAction(card, cardData);
      } else if (action) game.ai.parseMove(card, cardData, action, target);
    }
  },
  chooseDestiny: function (destinys) {
    if (Math.random() > game.ai.highChance) return destinys[0];
    else return destinys.random();
  },
  chooseTarget: function (targets) {
    // priority 1: tower
    var target;
    $(targets).each(function (i, t) {
      if (t.hasClass('towers')) target = t;
    });
    if (target) return target;
    else if (Math.random() > game.ai.lowChance) {
      // priority 2: lowest hp
      targets.sort(function (a, b) {
        return a.data('current hp') - b.data('current hp');
      });
      return targets[0];
    } else {
      return targets.random();
    }
  },
  chooseCast: function (castStrats) {
    castStrats.sort(function (a, b) {
      return b.priority - a.priority;
    });
    if (castStrats.length) {
      if (Math.random() > game.ai.lowChance) {
        return castStrats[0];
      } else castStrats.random();
    }
  },
  parseMove: function (card, cardData, action, target) {
    // console.log(card[0], action, target);
    var move = [];
    if (action == 'move' || action == 'advance' || action == 'retreat') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id'));
    }
    if (action == 'attack') {
      move[0] = 'A';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.getSpot().attr('id'));
    }
    if (action == 'cast') {
      move[0] = 'C';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id') || target.getSpot().attr('id'));
      move[3] = cardData['cast-skill']; //skillId
      move[4] = card.data('hero');
    }
    console.log(move.join(':'));
    game.currentData.moves.push(move.join(':'));
  },
  nextMove: function () {
    if (game.ai.movesLoop > 0) {
      if (game.currentData.moves.length) {
        game.ai.movesLoop -= 1;
      } else {
        game.ai.movesLoop -= 0.5;
      }
      game.timeout(100, game.ai.moveRandomCard);
    } else {
      game.ai.endTurn();
    }
  },
  skillsDiscard: function (card) {
    // discard counter
    var n = card.data('ai discard');
    if (n === undefined) {
      n = 4;
    } else if (n > 0) {
      n -= 1;
      card.data('ai discard', n);
    } else if (n <= 0) {
      var skillId = card.data('skill');
      var heroId = card.data('hero');
      game.currentData.moves.push('D:'+skillId+':'+heroId);
      card.data('ai discard', undefined);
    }
  },
  endTurn: function () { 
    //debugger
    // discard after N turns
    $('.enemydecks .hand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.skillsDiscard(card);
    });
    //console.log(game.currentData.moves);
    game.timeout(100, function () {
      game.enemy.startMoving(game.single.endEnemyTurn);
    });
  },
  heroes: {
    am: {
      move: {
        default: 'smart'
      },
      action: {
        default: 'attack'
      },
      play: function (card) {
        var cardData = card.data('ai');
        var hasBlink = $('.enemydecks .hand .skills.am-blink');
        //save blinks for escape
        hasBlink.each(function (i, el) {
          var skill = $(el);
          var d = skill.data('ai discard') + 1;
          card.data('ai discard', d);
        });
        if (hasBlink.length) {
          cardData['can-cast'] = true;
          cardData.strats.cast += 7;
          cardData['can-make-action'] = true;
        }
        var canBlinkTower = false;
        var towerInBlinkRange = false;
        var blinkSpots = [];
        card.inRange(6, function (spot) {
          var cardInRange = $('.card', spot);
          if (cardInRange.length && cardInRange.hasClasses('player towers')) {
            towerInBlinkRange = true;
          } else {
            blinkSpots.push(spot);
          }
        });
        var towerFreeNeighbors = [];
        if (blinkSpots.length && towerInBlinkRange) {
          game.player.tower.around(2, function (spot) {
            if (spot.hasClass('free')) towerFreeNeighbors.push(spot);
          });
        }
        var towerBlinkSpots = [];
        if (blinkSpots.length && towerInBlinkRange && towerFreeNeighbors.length) {
          for (var i = 0; i < blinkSpots; i++) {
            var bspot = blinkSpots[i];
            for (var j = 0; j < towerFreeNeighbors; j++) {
              var tspot = towerFreeNeighbors[j];
              if (bspot[0] == tspot[0]) towerBlinkSpots.push(bspot);
            }
          }
        }
        if ((hasBlink.length > 2) && towerBlinkSpots.length) {
          //use blink to attack the tower
          cardData.strats.cast += 10;
          cardData['cast-strats'].push({
            priority: 15,
            skill: 'blink',
            targets: towerBlinkSpots
          });
        }
        /*
        if (opponent missing cards < N ||
            N ememies in target range ||
            after N turns)
          
          cardData['cast-strats'].push({
            priority: 20,
            skill: 'ult',
            targets: [target]
          });
        */
      },
      defend: function (card) {
        //console.log('defend-from-am');
        var cardData = card.data('ai');
        var canBlinkTower = false;
        card.opponentsInRange(6, function () {
          if (card.hasClasses('enemy towers')) {
            canBlinkTower = true;
          }
        });
        // make ai units near the tower block am path
        if (canBlinkTower) {
          game.enemy.tower.atRange(4, function (spot) {
            var card = spot.find('.card.'+side);
            if (card.hasClass('enemy')) {
              cardData.strats.retreat += 5;
            }
          });
        }
        // todo: defend from ult
        card.data('ai', cardData);
      }
    },
    cm: {
      move: {
        default: 'defensive'
      },
      action: {
        default: 'cast'
      },
      play: function (cm) {
        /*
        only use slow if N opponents or after N turns
        combo freeze
        only use ult if N opponents or after N turns
        */
      },
      defend: function (cm) {
        //console.log('defend-from-cm');
        /*
        prevent clustering
        */
      }
    },
    kotl: {
      move: {
        default: 'defensive'
      },
      action: {
        default: 'cast'
      },
      play: function (kotl) {
        /*
        use ult immediately
        use illuminate to open way to the tower
        use mana if hand ain't full
        use leak and blind defensive
        use recall to save allies (combo am blink)
        */
      },
      defend: function (kotl) {
        //console.log('defend-from-kotl');
        /*
        avoid illuminate
        avoid moving if leak-buff
        avoid attacking if blind-buff
        */
      }
    },
    ld: {
      move: {
        default: 'offensive'
      },
      action: {
        default: 'cast'
      },
      play: function (card, cardData) {
        cardData['has-instant-attack-buff'] = true;
        card.data('ai', cardData);
        // bear strats (siege)
        // use return if bear is low hp
        // use roar if low hp and enemy in range
        // ult if enemy in melee range or low hp
      },
      defend: function (ld) {
        //console.log('defend-from-ld');
        //if bear in player area path block tower
      }
    },
    nyx: {
      move: {
        default: 'defensive'
      },
      action: {
        default: 'cast'
      },
      play: function (nyx) {
        // siege if has 2 spikes
        // stun if 2 enemies are aligned
        // mana priority (kotl, pud)
      },
      defend: function (nyx) {
        //console.log('defend-from-nyx');
        //aviod align
      }
    },
    pud: {
      move: {
        default: 'defensive'
      },
      action: {
        default: 'cast'
      },
      play: function (pud) {
        // try to align with advanced enemies and hook to tower
        // hook priority (disbled/stunned,  kotl, cm, negative if tank, negative if in rangeofskill)
        // rot damage
        // ult rot combo
      },
      defend: function (pud) {
        //console.log('defend-from-pud');
        //avoid hook
      }

    },
    wk: {
      move: {
        default: 'offensive'
      },
      action: {
        default: 'attack'
      },
      play: function (wk) {
        // keep stun to combo
        // dont stun under enemy tower
      },
      defend: function (wk) {
        //console.log('defend-from-wk');
        //dont focus if ult buff
      }
    }
  }
};

