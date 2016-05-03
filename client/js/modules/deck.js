game.deck = {
  build: function (op) {
    var name = op.name,
      filter = op.filter,
      cb = op.cb,
      multi = op.multi,
      display = op.display,
      deck = $('<div>').addClass('deck ' + name);
    if (!game[name]) {
      game.load.json(name, function () {
        game.deck.createCards(deck, name, cb, filter, multi, display);
      });
    } else { game.deck.createCards(deck, name, cb, filter, multi, display); }
    return deck;
  },
  createCards: function (deck, name, cb, filter, multi, display) {
    if (name === 'heroes') { game.deck.createHeroesCards(deck, name, cb, filter); }
    if (name === 'skills') { game.deck.createSkillsCards(deck, name, cb, filter, multi, display); }
    if (name === 'units') { game.deck.createUnitsCards(deck, name, cb, filter); }
  },
  createHeroesCards: function (deck, name, cb, filter) {
    var deckData = game.data[name],
      cards = [],
      card;
    $.each(deckData, function (heroid, herodata) {
      var found = false;
      if (filter) {
        $.each(filter, function (i, pick) {
          if (pick === heroid) { found = true; }
        });
      }
      if (found || !filter) {
        herodata.hero = heroid;
        herodata.speed = 2;
        herodata['current speed'] = 2;
        herodata.kd = true;
        herodata.buffs = true;
        herodata.className = [
          heroid,
          name
        ].join(' ');
        card = game.card.build(herodata).appendTo(deck);
        cards.push(card);
      }
    });
    deck.data('cards', cards);
    if (cb) { cb(deck); }
  },
  createSkillsCards: function (deck, name, cb, filter, multi, display) {
    var deckData = game.data[name],
      cards = [];
    $.each(deckData, function (hero, skills) {
      var found = false;
      if (filter) {
        $.each(filter, function (i, pick) {
          if (pick === hero) { found = true; }
        });
      }
      if (found || !filter) {
        $.each(skills, function (skill, skillData) {
          if (display && skillData.display) {
            var k;
            skillData.hero = hero;
            skillData.skill = skill;
            skillData.className = [
              hero + '-' + skill,
              name,
              hero
            ].join(' ');
            if (game.data.buffs[hero] && game.data.buffs[hero][skill]) {
              skillData.buff = game.data.buffs[hero][skill];
            }
            if (multi) {
              for (k = 0; k < skillData[multi]; k += 1) {
                cards.push(game.card.build(skillData).appendTo(deck));
              }
            } else { cards.push(game.card.build(skillData).appendTo(deck)); }
          }
        });
      }
    });
    deck.data('cards', cards);
    if (cb) { cb(deck); }
  },
  createUnitsCards: function (deck, name, cb, filter) {
    var deckData = game.data[name],
      cards = [];
    $.each(deckData, function (groupid, groupdata) {
      var found = false;
      if (filter) {
        $.each(filter, function (i, pick) {
          if (pick === groupid) { found = true; }
        });
      }
      if (found || !filter) {
        $.each(groupdata, function (unitid, unitdata) {
          unitdata.className = [
            unitid,
            name,
            groupid
          ].join(' ');
          unitdata.hero = groupid;
          unitdata.speed = 2;
          unitdata['current speed'] = 2;
          unitdata.buffs = true;
          cards.push(game.card.build(unitdata).appendTo(deck));
        });
      }
    });
    deck.data('cards', cards);
    if (cb) { cb(deck); }
  },
  randomCard: function (cards, noseed) {
    if (noseed) { return $(cards[parseInt(Math.random() * cards.length, 10)]); }
    return $(cards[parseInt(game.random() * cards.length, 10)]);
  }
};