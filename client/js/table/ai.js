game.ai = {
  turnStart: function () {
    // remember ai is playing the enemy cards
    console.clear();
    game.currentData.moves = [];
    // activate all passives, other sidehand skills strats per hero
    $('.enemydecks .sidehand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.passives(card);
    });
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
    game.ai.play();
    // add combo data and strats
    game.ai.combo();
    // choose strat and decide moves
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      var card = $(el);
      var cardData = card.data('ai');
      game.ai.chooseStrat(card, cardData);
      game.ai.decideAction(card, cardData);
    });
    // move and end turn
    game.timeout(750, function () {
      game.enemy.move(game.ai.endTurn);
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
  buildData: function (card, side) {
    /*
    can-attack
    can-attack-tower
    attack-can-kill
    in-attack-range
    can-be-killed
    at-tower-limit
    at-tower-attack-range
    at-fountain
    can-advance
    can-retreat
    */
    var cardData = {
      'strats': [], 
      'attack-targets': []
    };
    var range = card.data('range');
    if (range) {
      card.opponentsInRange(range, function (opponentCard) {
        cardData['can-attack'] = true;
        cardData['can-make-action'] = true;
        cardData['attack-targets'].push(opponentCard);
        opponentData = opponentCard.data('ai');
        opponentData['in-attack-range'] = true;
        if ( opponentCard.hasClass('towers') ) cardData['can-attack-tower'] = true;
        var hp = opponentCard.data('current hp');
        var damage = card.data('current damage');
        var armor = opponentCard.data('current armor');
        if ( hp <= (damage - armor) ) {
          cardData['attack-can-kill'] = true;
          opponentData['can-be-killed'] = true;
        }
        opponentCard.data('ai', opponentData);
      });
    }
    var opponent = game.opponent(side);
    card.around(game.data.ui.melee, function (neighbor) {
      if (neighbor.hasClass(opponent+'area')) cardData['at-tower-limit'] = true;
    });
    var spot = card.getSpot();
    if (spot.hasClass(opponent+'area')) cardData['at-tower-attack-range'] = true;
    if (spot.hasClass('fountain'+side)) cardData['at-fountain'] = true;
    if (!card.hasClasses('static dead stunned rooted entangled disabled sleeping cycloned taunted') && side == 'enemy') {
      // advanve
      var x = spot.getX(), y = spot.getY();
      var bot = game.map.getSpot(x, y + 1);
      var bl = game.map.getSpot(x - 1, y + 1);
      var left = game.map.getSpot(x - 1, y);
      if (bl && bl.hasClass('free')) {
        cardData['can-advance'] = bl;
      } else if (bot && bot.hasClass('free')) {
        cardData['can-advance'] = bot;
      } else if (left && left.hasClass('free')) {
        cardData['can-advance'] = left;
      }
      // retreat
      var top = game.map.getSpot(x, y - 1);
      var tr = game.map.getSpot(x + 1, y - 1);
      var right = game.map.getSpot(x + 1, y);
      if (tr && tr.hasClass('free')) {
        cardData['can-retreat'] = tr;
      } else if (top && top.hasClass('free')) {
        cardData['can-retreat'] = top;
      } else if (right && right.hasClass('free')) {
        cardData['can-retreat'] = right;
      }
    }
    card.data('ai', cardData);
  },
  play: function () {
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      var card = $(el);
      var cardData = card.data('ai');
      card.data('ai', cardData);
      //per hero play
      if (card.hasClass('heroes')) {
        var hero = card.data('hero');
        cardData.strats.push(game.ai.heroes[hero].move.default);
        game.ai.heroes[hero].play(card, cardData);
      }
    });
  },
  combo: function () {
    var combos = [];
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      /*
      todo: add combo strats {
        attack combos
        single unit skill combos
        aoe combos
        stuners/disablers combos
        displacement combos
      }
      */
    });
  },
  chooseStrat: function (card, cardData) {
    /*
    todo: strats priority system
    */
    if (card.data('current hp') < card.data('hp')/2) {
      cardData.strat = 'selfheal';
    } else {
      cardData.strat = game.ai.randomStrat(cardData.strats, card, cardData);
    }
  },
  randomStrat: function (strats, card, cardData) {
    var strat = strats.random();
    if (strat == 'move') {
      var moveSpots = [];
      card.inMovementRange(card.data('current speed'), moveSpots.push.bind(moveSpots));
      if (moveSpots.length) {
        cardData.destiny = moveSpots.random();
      } else strat = '';
    }
    return strat;
  },
  strats: [
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
    'selfheal',
  ],
  decideAction: function (card, cardData) {
    var strat = cardData.strat,
        action = '', 
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
    if (strat == 'offensive') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'smart') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance'] && !cardData['at-tower-limit']) {
        action = 'advance';
      }
    }
    if (strat == 'move') {
      if (cardData.destiny && cardData.destiny.hasClass('free')) {
        action =  'move';
        target = cardData.destiny;
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
      } else if (cardData['in-attack-range'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'defensive') {
      if (cardData['in-attack-range'] && cardData['can-retreat']) {
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
    if (!action && Math.random() > 0.8) {
      cardData.strat = game.ai.randomStrat(game.ai.strats, card, cardData);
      game.ai.decideAction(card, cardData);
    } else {
      if (action == 'attack'){
        if (!target) {
          target = game.ai.chooseTarget(cardData['attack-targets']);
        }
        if (cardData['has-instant-attack-buff']) {
          // todo: activate instant skills
        }
      }
      if (action) game.ai.parseMove(card, cardData, action, target);
    }
  },
  chooseTarget: function (targets) {
    if (Math.random() < 0.95) {
      // lowest hp
      targets.sort(function (a, b) {
        return a.data('current hp') - b.data('current hp');
      });
      return targets[0];
    } else {
      return targets.random();
    }
  },
  parseMove: function (card, cardData, action, target) {
    console.log(action, card, target);
    var move = [];
    if (action == 'move') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id'));
    }
    if (action == 'advance') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(cardData['can-advance'].attr('id'));
    }
    if (action == 'retreat') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(cardData['can-retreat'].attr('id'));
    }
    if (action == 'attack') {
      move[0] = 'A';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.getSpot().attr('id'));
    }
    if (action == 'cast') {
      move[0] = 'C';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(cardData['cast-target']);
      move[3] = cardData['can-cast']; //skillId
      move[4] = card.data('hero');
    }
    game.currentData.moves.push(move.join(':'));
  },
  nextMove: function () {
    /*
    todo:
    recalculate data and check for posible better move
    game.timeout(game.enemy.moveAnimation, game.enemy.autoMove);
    */
  },
  endTurn: function () {
    /*
    discard if duplicate or if not possible combo after N rounds at hand
    */
    console.log(game.currentData.moves);
    game.timeout(750, game.single.endEnemyTurn);
  },
  heroes: {
    am: {
      move: {
        default: 'smart'
      },
      action: {
        default: 'attack'
      },
      play: function (am) {
        /*
        save 1 blink for escape
        if (2 blinks) use blink to attack the tower (combo kotl recall)
        if (opponent missing cards < N || after N turns) use ult
        */
      },
      defend: function (am) {
        //console.log('defend-from-am');
        /*
        if (am is in blink range of tower) path block tower
        */
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

