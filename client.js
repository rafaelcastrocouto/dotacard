/* by rafælcastrocouto */
/*jslint browser: true, regexp: true */
/*global AudioContext, Skills, btoa, atob, $, Modernizr, alert, confirm, prompt, console*/
var game = (function () {
  'use strict';
  return {
    id: null,
    currentData: {},
    scrollspeed: 0.4,
    container: $('.container').first(),
    loader: $('<span>').addClass('loader'),
    message: $('<p>').addClass('message'),
    tries: 0,
    triesCounter: $('<small>').addClass('triescounter'),
    timeToPick: 30,
    timeToPlay: 15,
    waitLimit: 90,
    connectionLimit: 30,
    dayLength: 12,
    deadLength: 10,
    width: 12,
    height: 8,
    skills: null,
    heroes: null,
    buffs: null,
    units: null,
    seed: null,
    nomenu: function () {
      return false;
    },
    fn: function () {
      game.card.fn();
      if (!Number.prototype.map) { Number.prototype.map = function (a, b, c, d) { return c + (d - c) * ((this - a) / (b - a)); }; }
      if (!Number.prototype.limit) { Number.prototype.limit = function (a, b) { return Math.min(b, Math.max(a, this)); }; }
      if (!Number.prototype.round) { Number.prototype.round = function (a) { return Math.round(this); }; }
      if (!Number.prototype.floor) { Number.prototype.floor = function () { return Math.floor(this); }; }
      if (!Number.prototype.ceil) { Number.prototype.ceil = function () { return Math.ceil(this); }; }
      if (!Number.prototype.toInt) { Number.prototype.toInt = function () { return Number.parseInt(this); }; }
      if (!Number.prototype.toRad) { Number.prototype.toRad = function () { return this / 180 * Math.PI; }; }
      if (!Number.prototype.toDeg) { Number.prototype.toDeg = function () { return 180 * this / Math.PI; }; }
      if (!Array.prototype.random) { Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; }; }
      if (!Array.prototype.erase) {
        Array.prototype.erase = function (a) {
          var b;
          for (b = this.length - 1; b > -1; b -= 1) {
            if (this[b] === a) {
              this.splice(b, 1);
            }
          }
          return this;
        };
      }
      if (!Function.prototype.bind) {
        Function.prototype.bind = Function.prototype.bind || function (a) {
          var b = this;
          return function () {
            var c = Array.prototype.slice.call(arguments);
            return b.apply(a || null, c);
          };
        };
      }
      $.fn.hasClasses = function (list) {
        var classes = list.split(' '), i;
        for (i = 0; i < classes.length; i += 1) {
          if (this.hasClass(classes[i])) {
            return true;
          }
        }
        return false;
      };
      $.fn.hasAllClasses = function (list) {
        var classes = list.split(' '), i;
        for (i = 0; i < classes.length; i += 1) {
          if (!this.hasClass(classes[i])) {
            return false;
          }
        }
        return true;
      };
    },
    start: function () {
      if (Skills &&
          window.$ &&
          window.JSON &&
          window.btoa && window.atob &&
          //window.AudioContext &&
          window.XMLHttpRequest &&
          Modernizr.backgroundsize &&
          //Modernizr.cssanimations &&
          Modernizr.csstransforms &&
          Modernizr.generatedcontent &&
          Modernizr.rgba &&
          Modernizr.opacity) {
        game.fn();
        game.load.start();
      } else { game.load.unsupported(); }
    },
    load: {
      start: function () {
        game.status = 'loading';
        $('.loadtext .message').text('Updating: ');
        $('.progress').text('0%');
        game.load.pack();
        if (window.AudioContext) {
          game.audio.build();
          game.load.track();
        }
        game.load.language(function () {
          game.load.data();
        });
        game.load.ping(function () {
          if (!game.offline && location.host !== 'localhost') { game.load.analytics(); }
        });
        setTimeout(game.load.progress);
      },
      unsupported: function () {
        var welcome = document.getElementsByClassName('welcome')[0],
          unsupported = document.getElementsByClassName('unsupported')[0];
        welcome.style.display = 'none';
        unsupported.style.display = 'block';
        unsupported.innerHTML = [
          '<div class="box">',
          '  <img class="banner" src="img/banner.png" />',
          '  <h2>DotaCard requires a <i>modern browser</i></h2>',
          '  <p><a href="http://whatbrowser.org/" target="_blank">How can I get a <i>modern browser?</i></a></p>',
          '</div>'
        ].join('\n');
      },
      updating: 0,
      totalUpdate: 7,
      loading: 0,
      totalLoad: 0,
      images: {
        array: [
          'tutorial/axe.jpg',
          'bkg/polygon-dark.jpg',
          'heroes/crystal_maiden_full.jpg',
          'heroes/keeper_of_the_light_full.jpg',
          'heroes/skeleton_king_full.jpg',
          'heroes/lone_druid_full.jpg',
          'heroes/antimage_full.jpg',
          'heroes/nyx_assassin_full.jpg',
          'heroes/pudge_full.jpg',
          'bkg/map_vectorized.jpg',
          'cardback.jpg'
        ],
        preload: function () {
          $(game.load.images.array).each(function () {
            $('<img/>').attr('src', 'img/' + this);
          });
        }
      },
      progress: function () {
        clearTimeout(game.timeout);
        var loading;
        if (game.load.updating < game.load.totalUpdate) {
          // loading
          game.status = 'loading';
          loading = Number.parseInt(game.load.updating / game.load.totalUpdate * 100);
          $('.progress').text(loading + '%');
          game.timeout = setTimeout(game.load.progress, 10);
        } else if (game.load.updating === game.load.totalUpdate &&
            game.version &&
            game.ui &&
            game.skills) {
          if (game.status !== 'building') {
            // all loaded start build
            game.status = 'building';
            game.states.build();
            game.load.totalLoad = game.states.preBuild.length;
            $('.loadtext .message').text('Loading');
          }
          if (game.load.loading < game.load.totalLoad) {
            game.timeout = setTimeout(game.load.progress, 10);
          } else {
            // all build go to log screen
            game.states.builded = true;
            game.states.changeTo('log', true);
            game.load.images.preload();
            if (window.AudioContext) { game.load.sounds(); }
          }
        }
      },
      json: function (name, cb) {
        $.ajax({
          async: true,
          type: 'GET',
          url: 'json/' + game.language.dir + name + '.json',
          complete: function (response) {
            game.load.updating += 1;
            var data = JSON.parse(response.responseText);
            game[name] = data;
            if (cb) {
              cb(data);
            }
          }
        });
      },
      language: function (cb) {
        game.db({ 'get': 'lang' }, function (data) {
          game.load.updating += 1;
          if (data.lang) {
            game.language.detected = data.lang.split(';')[0].split(',')[0];
            if (game.language.available.indexOf(game.language.detected) > 0) {
              game.language.current = game.language.detected;
              game.language.dir = game.language.current + '/';
            }
          }
          if (cb) { cb(); }
        });
      },
      pack: function () {
        $.ajax({
          async: true,
          type: 'GET',
          url: 'package.json',
          complete: function (response) {
            game.load.updating += 1;
            var data = JSON.parse(response.responseText);
            $.each(data, function (name) {
              game[name] = this;
            });
          }
        });
      },
      data: function () {
        game.load.json('ui');
        game.load.json('heroes');
        game.load.json('units');
        game.load.json('skills', function () {
          var hero, skill;
          for (hero in game.skills) {
            if (game.skills.hasOwnProperty(hero)) {
              for (skill in game.skills[hero]) {
                if (game.skills[hero].hasOwnProperty(skill)) {
                  game.skills[hero][skill].buff = hero + '-' + skill;
                  game.skills[hero][skill].hero = hero;
                  game.skills[hero][skill].skill = skill;
                }
              }
            }
          }
        });
        game.load.json('buffs', function () {
          var hero, buff;
          for (hero in game.buffs) {
            if (game.buffs.hasOwnProperty(hero)) {
              for (buff in game.buffs[hero]) {
                if (game.buffs[hero].hasOwnProperty(buff)) {
                  game.buffs[hero][buff].buff = hero + '-' + buff;
                  game.buffs[hero][buff].hero = hero;
                  game.buffs[hero][buff].skill = buff;
                }
              }
            }
          }
        });
      },
      audio: function (name, cb) {
        var ajax = new XMLHttpRequest();
        ajax.open('GET', '/audio/' + name + '.mp3', true);
        ajax.responseType = 'arraybuffer';
        ajax.onload = function () {
          game.audio.context.decodeAudioData(ajax.response, function (buffer) {
            game.audio.buffers[name] = buffer;
            //game.load.updating += 1;
            if (cb) { cb(); }
          });
        };
        ajax.send();
      },
      sounds: function () {
        //game.load.totalUpdate += game.sounds.length;
        $(game.sounds).each(function () {
          game.load.audio(this);
        });
      },
      track: function () {
        game.song = 'doomhammer';
        //game.load.totalUpdate += 1;
        game.load.audio(game.song, function () {
          game.audio.play(game.song);
          setInterval(function () {
            game.audio.play(game.song);
          }, game.audio.buffers[game.song].duration * 1000);
        });
      },
      ping: function (cb) {
        var start = new Date();
        $.ajax({
          async: true,
          type: 'GET',
          url: game.homepage,
          complete: function (response) {
            game.ping = new Date() - start;
            if (response.readyState === 4) {
              game.offline = false;
            } else { game.offline = true; }
            if (cb) { cb(); }
          }
        });
      },
      analytics: function () {
        $('<script src="browser_modules/google.analytics.min.js">').appendTo('body');
      },
      end: function () {
        window.oncontextmenu = game.nomenu;
        window.onbeforeunload = function () {
          return game.ui.leave;
        };
      },
      reset: function () {
        console.log('Internal error: ', game);
        var r = confirm(game.ui.error);
        if (r) { location.reload(true); }
      }
    },
    db: function (send, cb) {
      if (typeof send.data !== 'string') {
        send.data = JSON.stringify(send.data);
      }
      $.ajax({
        async: true,
        type: 'GET',
        url: '/db',
        data: send,
        complete: function (receive) {
          var data;
          if (receive.responseText) {
            data = JSON.parse(receive.responseText);
          }
          if (cb) {
            cb(data || {});
          }
        }
      });
    },
    random: function () {
      game.seed += 1;
      return parseFloat('0.' + Math.sin(game.seed).toString().substr(6));
    },
    language: {
      current: 'en-US',
      available: ['en-US', 'pt-BR'],
      dir: ''
    },
    card: {
      fn: function () {
        $.fn.place = game.card.place;
        $.fn.select = game.card.select;
        $.fn.unselect = game.card.unselect;
        $.fn.highlightSource = game.card.highlightSource;
        $.fn.highlightTargets = game.card.highlightTargets;
        $.fn.strokeSkill = game.card.strokeSkill;
        $.fn.highlightMove = game.card.highlightMove;
        $.fn.move = game.card.move;
        $.fn.animateMove = game.card.animateMove;
        $.fn.cast = game.card.cast;
        $.fn.stopChanneling = game.card.stopChanneling;
        $.fn.passive = game.card.passive;
        $.fn.toggle = game.card.toggle;
        $.fn.addBuff = game.card.addBuff;
        $.fn.hasBuff = game.card.hasBuff;
        $.fn.removeBuff = game.card.removeBuff;
        $.fn.addStun = game.card.addStun;
        $.fn.reduceStun = game.card.reduceStun;
        $.fn.discard = game.card.discard;
        $.fn.strokeAttack = game.card.strokeAttack;
        $.fn.highlightAttack = game.card.highlightAttack;
        $.fn.attack = game.card.attack;
        $.fn.damage = game.card.damage;
        $.fn.heal = game.card.heal;
        $.fn.changedamage = game.card.changedamage;
        $.fn.changehp = game.card.changehp;
        $.fn.die = game.card.die;
        $.fn.reborn = game.card.reborn;
      },
      build: function (data) {
        var card, fieldset, portrait, current, desc, range;
        card = $('<div>').addClass('card ' + data.className);
        $('<legend>').appendTo(card).text(data.name);
        fieldset = $('<fieldset>').appendTo(card);
        portrait = $('<div>').addClass('portrait').appendTo(fieldset);
        $('<div>').appendTo(portrait).addClass('img');
        $('<div>').appendTo(portrait).addClass('overlay');
        if (data.attribute) {
          $('<h1>').appendTo(fieldset).text(data.attribute);
        } else if (game.heroes[data.hero]) {
          $('<h1>').appendTo(fieldset).text(game.heroes[data.hero].name);
        } else {
          $('<h1>').appendTo(fieldset).text(data.hero);
        }
        current = $('<div>').addClass('current').appendTo(fieldset);
        desc = $('<div>').addClass('desc').appendTo(fieldset);
        if (data.hp) {
          $('<p>').addClass('hp').appendTo(desc).text(game.ui.hp + ': ' + data.hp);
          data['current hp'] = data.hp;
          $('<p>').addClass('hp').appendTo(current).html('HP <span>' + data.hp + '</span>');
        }
        if (data.mana) {
          $('<p>').appendTo(desc).text(game.ui.mana + ': ' + data.mana);
        }
        range = '';
        if (data.damage) {
          if (data.range) {
            range = ' (' + data.range + ')';
          }
          $('<p>').addClass('damage').appendTo(desc).text(game.ui.damage + ': ' + data.damage + range);
          data['current damage'] = data.damage;
          $('<p>').addClass('damage').appendTo(current).html('DMG <span>' + data.damage + '</span>');
        }
        if (data.range && !range) {
          $('<p>').appendTo(desc).text(game.ui.range + ': ' + data.range);
        }
        if (data.armor) {
          $('<p>').appendTo(desc).text(game.ui.armor + ': ' + data.armor + '%');
        }
        if (data.resistance) {
          $('<p>').appendTo(desc).text(game.ui.resistance + ': ' + data.resistance + '%');
        }
        if (data.type) {
          $('<p>').appendTo(desc).text(game.ui.type + ': ' + data.type);
        }
        if (data.chance) {
          $('<p>').appendTo(desc).text(game.ui.chance + ': ' + data.chance + '%');
        }
        if (data.percentage) {
          $('<p>').appendTo(desc).text(game.ui.percentage + ': ' + data.percentage + '%');
        }
        if (data.delay) {
          $('<p>').appendTo(desc).text(game.ui.delay + ': ' + data.delay);
        }
        if (data.damageType) {
          $('<p>').appendTo(desc).text(game.ui.damageType + ': ' + data.damageType);
        }
        if (data.duration) {
          $('<p>').appendTo(desc).text(game.ui.duration + ': ' + data.duration + ' ' + game.ui.turns);
        }
        if (data.dot) {
          $('<p>').appendTo(desc).text(game.ui.dot + ': ' + data.dot);
        }
        if (data.multiplier) {
          $('<p>').appendTo(desc).text(game.ui.multiplier + ': ' + data.multiplier + 'X');
        }
        if (data.description) {
          card.attr({ title: data.name + ': ' + data.description });
          $('<p>').appendTo(desc).addClass('description').text(data.description);
        }
        if (data.kd) {
          data.kills = 0;
          data.deaths = 0;
          $('<p>').addClass('kd').appendTo(desc).html(game.ui.kd + ': <span class="kills">0</span>/<span class="deaths">0</span>');
        }
        if (data.buffs) {
          $('<div>').addClass('buffs').appendTo(fieldset);
        }
        $.each(data, function (item, value) {
          card.data(item, value);
        });
        return card;
      },
      place: function (target) {
        if (!target.removeClass) {
          target = $('#' + target);
        }
        this.closest('spot.block').removeClass('block').addClass('free');
        this.appendTo(target.removeClass('free').addClass('block'));
        if (this.data('fx') && this.data('fx').canvas) { this.data('fx').canvas.appendTo(target); }
        return this;
      },
      select: function (event) {
        var card = $(this);
        if (!game.selectedCard || card[0] !== game.selectedCard[0]) {
          $('.card.selected').removeClass('selected');
          $('.card.source').removeClass('source');
          game.card.unselect();
          game.selectedCard = card;
          game.map.highlight();
          card.clone().appendTo(game.states.table.selectedArea).addClass('zoom');
          card.addClass('selected');
          setTimeout(function () {
            game.states.table.selectedArea.addClass('flip');
          });
          if (event && event.stopPropagation) {
            event.stopPropagation();
          }
        }
        return card;
      },
      unselect: function () {
        game.map.unhighlight();
        if (game.selectedCard) { game.selectedCard.removeClass('selected'); }
        game.selectedCard = null;
        game.states.table.selectedArea.removeClass('flip');
        game.states.table.selectedArea.trigger('unselect');
        var del = $('.selectedarea .card')[0];
        setTimeout(function () {
          $(this).remove();
        }.bind(del), 400);
      },
      highlightSource: function () {
        var skill = this, hero = skill.data('hero');
        if (hero) {
          $('.map .card.player.hero.' + hero).addClass('source');
        }
        return skill;
      },
      highlightTargets: function () {
        var skill = this, hero = skill.data('hero'),
          source, pos, range, targets, aoe;
        if (hero) {
          source = $('.map .source');
          if (source.hasClasses('hero unit')) {
            pos = game.map.getPosition(source);
            range = game.map.getRange(skill.data('range'));
            aoe = skill.data('aoe');
            targets = skill.data('targets');
            if (skill.data('type') === game.ui.passive) {
              if (!source.hasClass('dead')) {
                source.addClass('casttarget').on('contextmenu.passive', game.player.passive);
              }
            } else if (skill.data('type') === game.ui.toggle) {
              if (!source.hasClass('dead')) {
                source.addClass('casttarget').on('contextmenu.toggle', game.player.toggle);
              }
            } else if (!source.hasClasses('dead done stunned frozen silenced hexed disabled sleeping cycloned taunted')) {
              if (targets.indexOf(game.ui.self) >= 0) {
                source.addClass('casttarget').on('contextmenu.cast', game.player.cast);
              }
              if (targets.indexOf(game.ui.ally) >= 0) {
                if (range === game.ui.global) {
                  $('.map .player').addClass('casttarget').on('contextmenu.cast', game.player.cast);
                } else {
                  game.map.inRange(pos, range, function (neighbor) {
                    var card = $('.card', neighbor);
                    if (card.hasClass('player')) {
                      card.addClass('casttarget').on('contextmenu.cast', game.player.cast);
                    }
                  });
                }
              }
              if (targets.indexOf(game.ui.enemy) >= 0) {
                if (range === game.ui.global) {
                  $('.map .enemy').addClass('casttarget').on('contextmenu.cast', game.player.cast);
                } else {
                  game.map.inRange(pos, range, function (neighbor) {
                    var card = $('.card', neighbor);
                    if (card.hasClass('enemy')) {
                      card.addClass('casttarget').on('contextmenu.cast', game.player.cast);
                    }
                  });
                }
              }
              if (targets.indexOf('Lone') >= 0) {
                pos = game.map.getPosition(source.data('ld'));
                game.map.around(pos, range, function (neighbor) {
                  if (neighbor.hasClass('free')) {
                    neighbor.addClass('targetarea').on('contextmenu.castarea', game.player.cast);
                  }
                });
                return skill;
              }
              if (targets.indexOf(game.ui.spot) >= 0) {
                if (targets.indexOf(game.ui.free) >= 0) {
                  game.map.around(pos, range, function (neighbor) {
                    if (neighbor.hasClass('free')) {
                      neighbor.addClass('targetarea').on('contextmenu.castarea', game.player.cast);
                    }
                  });
                } else {
                  if (aoe === 'Radial') {
                    game.map.around(pos, range, function (neighbor) {
                      neighbor.addClass('targetarea').on('contextmenu.castarea', game.player.cast);
                      if (neighbor.hasClass('block')) {
                        var card = $('.card', neighbor);
                        card.addClass('targetarea').on('contextmenu.cast', game.player.cast);
                      }
                    });
                  } else if (aoe === 'Linear') {
                    game.map.atCross(pos, skill.data('aoe range'), skill.data('aoe width'), function (neighbor) {
                      neighbor.addClass('targetarea').on('contextmenu.castarea', game.player.cast);
                      if (neighbor.hasClass('block')) {
                        var card = $('.card', neighbor);
                        card.addClass('targetarea').on('contextmenu.cast', game.player.cast);
                      }
                    });
                  }
                }
              }
            }
          }
        }
        return skill;
      },
      strokeSkill: function () {
        var skill = this,
          hero = skill.data('hero'),
          source = $('.map .source'),
          range,
          pos = game.map.getPosition(source);
        if (hero && pos && !source.hasClasses('dead done stunned')) {
          if (skill.data('aoe')) {
            game.castpos = pos;
            game.aoe = skill.data('aoe');
            if (game.aoe === 'Linear') {
              game.aoewidth = skill.data('aoe width');
              game.aoerange = skill.data('aoe range');
              game.map.crossStroke(pos, game.aoerange, game.aoewidth, 'skillarea');
            } else if (game.aoe === 'Radial') {
              game.aoerange = game.map.getRange(skill.data('range'));
              game.aoecastrange = game.map.getRange(skill.data('aoe range'));
              game.map.radialStroke(pos, game.aoerange, 'skillarea');
            }
            $('.map .spot, .map .card').hover(function () {
              var spot = $(this);
              $('.map .spot').removeClass('skillarea skillcast top right left bottom');
              if (spot.hasClass('targetarea')) {
                if (game.aoe === 'Linear') {
                  game.map.linearStroke(game.map.getPosition($(this)), game.aoerange, game.aoewidth, 'skillcast');
                } else if (game.aoe === 'Radial') {
                  game.map.radialStroke(game.map.getPosition($(this)), game.aoecastrange, 'skillcast');
                }
              } else {
                if (game.aoe === 'Linear') {
                  game.map.crossStroke(game.castpos, game.aoerange, game.aoewidth, 'skillarea');
                } else if (game.aoe === 'Radial') {
                  game.map.radialStroke(game.castpos, game.aoerange, 'skillarea');
                }
              }
            });
          }
        }
        return skill;
      },
      highlightMove: function () {
        var card = this, speed;
        if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done static dead stunned frozen entangled disabled sleeping cycloned taunted')) {
          speed = card.data('current speed');
          if (speed < 1) { return card; }
          if (speed > 3) { speed = 3; }
          game.map.atMovementRange(card, Math.round(speed), function (neighbor) {
            if (!neighbor.hasClass('block')) { neighbor.addClass('movearea').on('contextmenu.movearea', game.player.move); }
          });
        }
        return card;
      },
      move: function (destiny) {
        if (typeof destiny === 'string') { destiny = $('#' + destiny); }
        var card = this, t, d,
          from = game.map.getPosition(card),
          to = game.map.getPosition(destiny);
        if (destiny.hasClass('free') && from !== to) {
          game.map.unhighlight();
          card.stopChanneling();
          card.closest('.spot').removeClass('block').addClass('free');
          destiny.removeClass('free').addClass('block');
          t = card.offset();
          d = destiny.offset();
          if (!destiny.data('detour')) {
            card.animateMove(destiny);
          } else {
            card.animateMove(destiny.data('detour'));
            setTimeout(function () {
              this.card.animateMove(this.destiny);
            }.bind({
              card: card,
              destiny: destiny
            }), 200);
          }
          if (card.data('movement bonus')) {
            card.data('movement bonus', false);
          } else { card.addClass('done'); }
          card.trigger('move', {
            card: card,
            target: to
          });
          setTimeout(function () {
            $(this.card).css({ transform: '' }).appendTo(this.destiny);
            if (this.card.data('fx') && this.card.data('fx').canvas) {
              this.card.data('fx').canvas.appendTo(this.destiny);
            }
            $('.map .spot').data('detour', false);
            game.map.highlight();
          }.bind({
            card: card,
            destiny: destiny
          }), 400);
        }
        return card;
      },
      animateMove: function (destiny) {
        var from = game.map.getPosition(this), to = game.map.getPosition(destiny),
          fx = game.map.getX(from), fy = game.map.getY(from),
          tx = game.map.getX(to), ty = game.map.getY(to),
          dx = (tx - fx) * 100, dy = (ty - fy) * 100;
        this.css({ transform: 'translate3d(' + (dx - 50) + '%, ' + (dy - 50) + '%, 100px) rotateX(-30deg)' });
      },
      cast: function (skill, target) {
        var source = this, targets, duration, channeler, channelDuration,
          hero = skill.data('hero'),
          skillid = skill.data('skill');
        if (skillid && hero && source.data('hero') === hero) {
          if (typeof target === 'string') {
            targets = game.skills[hero][skillid].targets;
            if (targets.indexOf(game.ui.spot) >= 0) {
              target = $('#' + target);
            } else {target = $('#' + target + ' .card'); }
          }
          if (target.length) {
            source.stopChanneling();
            source.trigger('cast', {
              skill: skill,
              source: source,
              target: target
            });
            Skills[hero][skillid].cast(skill, source, target);
            if (game.sounds.indexOf(hero + '/' + skillid) >= 0) {
              game.audio.play(hero + '/' + skillid);
            }
            channelDuration = skill.data('channel');
            if (channelDuration) {
              source.data('channeling', channelDuration).addClass('channeling');
              source.on('channel', function (event, eventdata) {
                channeler = eventdata.source;
                duration = channeler.data('channeling');
                if (duration) {
                  duration -= 1;
                  channeler.data('channeling', duration);
                } else {
                  channeler.stopChanneling();
                }
              });
            }
            if (source.hasClass('enemy')) {
              game.enemy.hand -= 1;
            } else {
              setTimeout(function () {
                this.select();
              }.bind(source));
            }
            source.addClass('done');
            setTimeout(function () {
              this.discard();
            }.bind(skill), 400);
          }
        }
        return this;
      },
      stopChanneling: function () {
        this.data('channeling', false).removeClass('channeling').off('channel');
      },
      passive: function (target) {
        var skill = this,
          hero = skill.data('hero'),
          skillid = skill.data('skill');
        if (typeof target === 'string') { target = $('#' + target + ' .card'); }
        if (skillid && hero && target.data('hero') === hero) {
          target.trigger('passive', {
            skill: skill,
            target: target
          });
          Skills[hero][skillid].passive(skill, target);
          if (skill.hasClass('enemy')) {
            game.enemy.hand -= 1;
          } else { target.select(); }
          setTimeout(function () {
            skill.remove();
          }, 400);
        }
        return this;
      },
      toggle: function (target) {
        var skill = this,
          hero = skill.data('hero'),
          skillid = skill.data('skill');
        if (typeof target === 'string') { target = $('#' + target + ' .card'); }
        if (skillid && hero && target.data('hero') === hero) {
          target.trigger('toggle', {
            skill: skill,
            target: target
          });
          Skills[hero][skillid].toggle(skill, target);
          if (skill.hasClass('enemy')) {
            game.enemy.hand -= 1;
          } else { target.select(); }
        }
        return this;
      },
      addBuff: function (target, data) {
        var buff = $('<div>').addClass('buff ' + data.buff).attr({ title: data.name + ': ' + data.description });
        $('<div>').appendTo(buff).addClass('img');
        $('<div>').appendTo(buff).addClass('overlay');
        buff.data('source', this);
        target.find('.buffs').append(buff);
        return buff;
      },
      hasBuff: function (buff) {
        var target = this;
        return target.find('.buffs .' + buff).length;
      },
      removeBuff: function (buffs) {
        var target = this;
        $.each(buffs.split(' '), function () {
          var buff = this;
          target.find('.buffs .' + buff).remove();
          if (target.hasClass('selected')) { target.select(); }
        });
        return this;
      },
      addStun: function (target, stun) {
        if (target.hasClass('stunned')) {
          var currentstun = target.data('stun');
          if (!currentstun || stun > currentstun) { target.data('stun', stun); }
        } else {
          target.stopChanneling();
          this.addBuff(target, {
            name: 'Stun',
            buff: 'stun',
            description: 'Unit is stunned and cannot move, attack or cast'
          });
          target.addClass('stunned').data('stun', stun);
        }
        return this;
      },
      reduceStun: function () {
        var hero = this, currentstun;
        if (hero.hasClass('stunned')) {
          currentstun = parseInt(hero.data('stun'), 10);
          if (currentstun > 0) {
            hero.data('stun', currentstun - 1);
          } else { hero.trigger('stunend', { target: hero }).data('stun', null).removeClass('stunned').removeBuff('stun'); }
        }
        if (hero.hasClass('selected')) { hero.select(); }
        return this;
      },
      discard: function () {
        if (this.hasClass('skill')) {
          this.trigger('discard', {target: this});
          if (this.hasClass('player')) {
            if (this.data('deck') === game.ui.temp) {
              this.appendTo(game.player.skills.temp);
            } else {
              this.appendTo(game.player.skills.cemitery);
            }
          } else {
            this.appendTo(game.enemy.skills.deck);
            game.enemy.hand -= 1;
          }
        }
      },
      strokeAttack: function () {
        var card = this, pos, range;
        if (!card.hasClasses('done dead stunned disabled disarmed hexed')) {
          pos = game.map.getPosition(card);
          range = game.map.getRange(card.data('range'));
          game.map.radialStroke(pos, range, card.data('side') + 'attack');
        }
        return card;
      },
      highlightAttack: function () {
        var card = this, pos, range;
        if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done dead stunned frozen')) {
          pos = game.map.getPosition(card);
          range = game.map.getRange(card.data('range'));
          game.map.inRange(pos, range, function (neighbor) {
            var card = $('.card', neighbor);
            if (card.hasClass('enemy')) { card.addClass('attacktarget').on('contextmenu.attack', game.player.attack); }
          });
        }
        return card;
      },
      attack: function (target) {
        if (typeof target === 'string') { target = $('#' + target + ' .card'); }
        var source = this, name,
          from = game.map.getPosition(source),
          to = game.map.getPosition(target);
        if (source.data('current damage') && from !== to && target.data('current hp')) {
          source.stopChanneling();
          source.trigger('attack', {
            source: source,
            target: target
          });
          source.damage(source.data('current damage'), target, game.ui.physical);
          source.trigger('afterattack', {
            source: source,
            target: target
          });
          if (source.hasClass('tower')) {
            name = 'tower';
          } else if (source.hasClass('bear')) {
            name = 'bear';
          } else { name = source.data('hero'); }
          game.audio.play(name + '/attack');
          source.addClass('done');
        }
        return this;
      },
      damage: function (damage, target, type) {
        if (damage < 1) {
          return this;
        } else { damage = Math.round(damage); }
        var source = this, evt, x, y, position, spot, resistance, armor, hp, currentDamage, kills, deaths, damageFx;
        if (!type) { type = game.ui.physical; }
        resistance = 1 - target.data('resistance') / 100;
        if (type === game.ui.magical && resistance) { damage = Math.round(damage * resistance); }
        armor = 1 - target.data('armor') / 100;
        if (type === game.ui.physical && armor) { damage = Math.round(damage * armor); }
        if (typeof target === 'string') { target = $('#' + target + ' .card'); }
        hp = target.data('current hp') - damage;
        target.changehp(hp);
        position = game.map.getPosition(target);
        x = game.map.getX(position);
        y = game.map.getY(position);
        spot = game.map.getSpot(x, y);
        evt = {
          source: this,
          target: target,
          spot: spot,
          x: x,
          y: y,
          position: position,
          damage: damage,
          type: type
        };
        target.trigger('damage', evt);
        if (hp < 1) {
          target.addClass('dead').removeClass('target done').changehp(0);
          setTimeout(function () {
            this.trigger('kill', evt);
            target.trigger('die', evt);
            target.die();
          }, 2000);
          if (source.hasClass('hero') && target.hasClass('hero')) {
            game[source.data('side')].kills += 1;
            kills = source.data('kills') + 1;
            source.data('kills', kills);
            source.find('.kills').text(kills);
            game[target.data('side')].deaths += 1;
            deaths = target.data('deaths') + 1;
            target.data('deaths', deaths);
            target.find('.deaths').text(deaths);
          }
        }
        damageFx = target.find('.damaged');
        if (damageFx.length) {
          currentDamage = parseInt(damageFx.text(), 10);
          damageFx.text(currentDamage + damage).appendTo(target);
        } else {
          damageFx = $('<span>').addClass('damaged').text(damage).appendTo(target);
        }
        if (source.data('crit')) {
          source.data('crit', false);
          damageFx.addClass('critical');
        }
        return this;
      },
      changedamage: function (damage) {
        damage = parseInt(damage, 10);
        this.find('.current .damage span').text(damage);
        this.data('current damage', damage);
        if (this.hasClass('selected')) { this.select(); }
        return this;
      },
      heal: function (healhp) {
        healhp = Math.ceil(healhp);
        var target = this, healFx, currentHeal,
          currenthp = target.data('current hp'),
          maxhp = this.data('hp'),
          hp = currenthp + healhp;
        if (hp > maxhp) {
          healhp = maxhp - currenthp;
          target.changehp(maxhp);
        } else {
          target.changehp(hp);
        }
        if (healhp > 0) {
          healFx = target.find('.heal');
          if (healFx.length) {
            currentHeal = parseInt(healFx.text(), 10);
            healFx.text(currentHeal + healhp);
          } else {
            healFx = $('<span>').addClass('heal').text(healhp).appendTo(target);
          }
        }
        return this;
      },
      changehp: function (hp) {
        if (hp < 1) { hp = 0; }
        this.find('.current .hp span').text(hp);
        this.data('current hp', hp);
        if (this.hasClass('selected')) { this.select(); }
        return this;
      },
      die: function () {
        this.addClass('dead').removeClass('target done').changehp(0);
        var pos = game.map.getPosition(this), deaths,
          spot = $('#' + pos);
        if (!spot.hasClass('cript')) { spot.removeClass('block').addClass('free'); }
        if (this.hasClass('selected')) { this.select(); }
        if (this.hasClass('hero')) {
          deaths = this.data('deaths') + 1;
          this.data('deaths', deaths);
          this.find('.deaths').text(deaths);
          this.data('reborn', game.time + game.deadLength);
          if (this.hasClass('player')) {
            this.appendTo(game.player.heroesDeck);
          } else if (this.hasClass('enemy')) { this.appendTo(game.enemy.heroesDeck); }
        } else if (this.hasClass('tower')) {
          if (this.hasClass('player')) {
            game.match.lose();
          } else if (this.hasClass('enemy')) { game.match.win(); }
        } else { this.remove(); }
        return this;
      },
      reborn: function (spot) {
        this.removeClass('dead');
        var hp = this.data('hp'), x, y, freeSpot;
        this.find('.hp').text(hp);
        this.data('current hp', hp);
        this.data('reborn', null);
        if (!spot) {
          if (this.hasClass('player')) {
            x = 0;
            y = 3;
            spot = game.map.toId(x, y);
            while ($('#' + spot).hasClass('block')) {
              x += 1;
              spot = game.map.toId(x, y);
            }
          } else if (this.hasClass('enemy')) {
            x = 11;
            y = 1;
            spot = game.map.toId(x, y);
            while ($('#' + spot).hasClass('block')) {
              x -= 1;
              spot = game.map.toId(x, y);
            }
          }
        }
        this.place(spot);
        this.trigger('reborn');
        return this;
      }
    },
    deck: {
      build: function (op) {
        var name = op.name,
          filter = op.filter,
          cb = op.cb,
          multi = op.multi,
          deck = $('<div>').addClass('deck ' + name);
        if (!game[name]) {
          game.load.json(name, function () {
            game.deck.createCards(deck, name, cb, filter, multi);
          });
        } else { game.deck.createCards(deck, name, cb, filter, multi); }
        return deck;
      },
      createCards: function (deck, name, cb, filter, multi) {
        if (name === 'heroes') { game.deck.createHeroesCards(deck, name, cb, filter); }
        if (name === 'skills') { game.deck.createSkillsCards(deck, name, cb, filter, multi); }
        if (name === 'units') { game.deck.createUnitsCards(deck, name, cb, filter); }
      },
      createHeroesCards: function (deck, name, cb, filter) {
        var deckData = game[name],
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
            game.fx.build(card);
            cards.push(card);
          }
        });
        deck.data('cards', cards);
        if (cb) { cb(deck); }
      },
      createSkillsCards: function (deck, name, cb, filter, multi) {
        var deckData = game[name],
          cards = [];
        $.each(deckData, function (hero, heroSkillsData) {
          var found = false;
          if (filter) {
            $.each(filter, function (i, pick) {
              if (pick === hero) { found = true; }
            });
          }
          if (found || !filter) {
            $.each(heroSkillsData, function (skill, skillData) {
              var k;
              skillData.hero = hero;
              skillData.skill = skill;
              skillData.className = [
                hero + '-' + skill,
                name,
                hero
              ].join(' ');
              if (game.buffs[hero] && game.buffs[hero][skill]) {
                skillData.buff = game.buffs[hero][skill];
              }
              if (multi) {
                for (k = 0; k < skillData[multi]; k += 1) {
                  cards.push(game.card.build(skillData).appendTo(deck));
                }
              } else { cards.push(game.card.build(skillData).appendTo(deck)); }
            });
          }
        });
        deck.data('cards', cards);
        if (cb) { cb(deck); }
      },
      createUnitsCards: function (deck, name, cb, filter) {
        var deckData = game[name],
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
    },
    player: {
      manaBuild: function () {
        game.player.mana = 0;
        $(game.player.picks).each(function () {
          var card = $('.card.' + this);
          game.player.mana += card.data('mana');
        });
        game.player.cardsPerTurn = 1 + Math.round(game.player.mana / 10);
        game.player.maxCards = Math.round(game.player.mana / 2);
      },
      buyCard: function () {
        if (game.player.turn === 6) {
          $('.player.deck.skills.ult .card').appendTo(game.player.skills.deck);
        }
        var availableSkills = $('.skills.available.player.deck .card'),
          card = game.deck.randomCard(availableSkills),
          heroid,
          hero,
          to;
        if (availableSkills.length === 0) {
          $('.player.deck.skills.cemitery .card').appendTo(game.player.skills.deck);
        }
        if (card.data('type') === game.ui.toggle) {
          card.appendTo(game.player.skills.sidehand);
        } else if (card.data('type') === game.ui.automatic) {
          heroid = card.data('hero');
          hero = $('.map .player.heroes.' + heroid);
          to = game.map.getPosition(hero);
          card.passive(to);
          game.currentData.moves.push('P:' + to + ':' + card.data('skill') + ':' + heroid);
          card.appendTo(game.player.skills.sidehand);
        } else {
          card.appendTo(game.player.skills.hand);
        }
      },
      buyHand: function () {
        var i;
        for (i = 0; i < game.player.cardsPerTurn; i += 1) {
          if (game.player.skills.hand.children().length < game.player.maxCards) {
            game.player.buyCard();
          }
        }
      },
      move: function () {
        var spot = $(this),
          card = game.selectedCard,
          from = game.map.getPosition(card),
          to = game.map.getPosition(spot);
        if (game.status === 'turn' && spot.hasClass('free') && from !== to && !card.hasClass('done')) {
          card.move(to);
          if (game.mode !== 'tutorial') { game.currentData.moves.push('M:' + from + ':' + to); }
          game.map.unhighlight();
        }
        return false;
      },
      attack: function () {
        var target = $(this),
          source = game.selectedCard,
          from = game.map.getPosition(source),
          to = game.map.getPosition(target);
        if (game.status === 'turn' && source.data('damage') && from !== to && !source.hasClass('done') && target.data('current hp')) {
          source.attack(target);
          if (game.mode !== 'tutorial') { game.currentData.moves.push('A:' + from + ':' + to); }
          game.map.unhighlight();
        }
        return false;
      },
      passive: function () {
        var target = $(this),
          skill = game.selectedCard,
          hero = skill.data('hero'),
          skillid = skill.data('skill'),
          to = game.map.getPosition(target);
        if (hero && skillid && game.status === 'turn') {
          game.audio.play('activate');
          if (game.mode !== 'tutorial') { game.currentData.moves.push('P:' + to + ':' + skillid + ':' + hero); }
          skill.passive(target);
          game.states.table.animateCast(skill, target);
        }
      },
      toggle: function () {
        var target = $(this),
          skill = game.selectedCard,
          hero = skill.data('hero'),
          skillid = skill.data('skill'),
          to = game.map.getPosition(target);
        if (hero && skillid && game.status === 'turn') {
          game.audio.play('activate');
          if (game.mode !== 'tutorial') { game.currentData.moves.push('T:' + to + ':' + skillid + ':' + hero); }
          skill.toggle(target);
          game.states.table.animateCast(skill, target);
        }
      },
      cast: function () {
        var target = $(this),
          skill = game.selectedCard,
          source = $('.map .source'),
          from = game.map.getPosition(source),
          to = game.map.getPosition(target),
          hero = skill.data('hero'),
          skillid = skill.data('skill');
        if (hero && skillid && from && to && game.status === 'turn' && !source.hasClass('done')) {
          if (game.mode !== 'tutorial') { game.currentData.moves.push('C:' + from + ':' + to + ':' + skillid + ':' + hero); }
          source.cast(skill, to);
          game.states.table.animateCast(skill, to);
        }
      }
    },
    enemy: {
      playtime: 3,
      buyCard: function () {
        game.enemy.hand += 1;
        game.random();
      },
      buyHand: function () {
        var i;
        for (i = 0; i < game.enemy.cardsPerTurn; i += 1) {
          if (game.enemy.hand < game.enemy.maxCards) {
            game.enemy.buyCard();
          }
        }
      },
      move: function () {
        game.message.text(game.ui.enemymove);
        game.enemy.skills.deck.addClass('slide');
        var from, to, m, move, source, target, targets, hero, skillid, skill,
          moves = game.currentData.moves.split('|');
        for (m = 0; m < moves.length; m += 1) {
          move = moves[m].split(':');
          if (move[1] && move[2]) {
            from = game.map.mirrorPosition(move[1]);
            to = game.map.mirrorPosition(move[2]);
            if (move[0] === 'M') {
              target = $('#' + from + ' .card');
              if (to && !target.hasClass('done') && target.hasClass('enemy') && target.move) {
                target.move(to);
              }
            }
            if (move[0] === 'A') {
              source = $('#' + from + ' .card');
              if (to && !source.hasClass('done') && source.hasClass('enemy') && source.attack) {
                source.attack(to);
              }
            }
            if (move[0] === 'C') {
              skillid = move[3];
              hero = move[4];
              source = $('#' + from + ' .card');
              target = $('#' + to);
              skill = $('.enemy.skills .' + hero + '-' + skillid).show();
              targets = skill.data('targets');
              if (targets.indexOf(game.ui.enemy) >= 0 ||
                  targets.indexOf(game.ui.ally)  >= 0 ||
                  targets.indexOf(game.ui.self)  >= 0) { target = $('#' + to + ' .card'); }
              if (Skills[hero][skillid].cast && skill && !source.hasClass('done') && source.hasClass('enemy') && source.cast) {
                source.cast(skill, target);
                game.enemy.hand -= 1;
              }
            }
            if (move[0] === 'P') {
              to = game.map.mirrorPosition(move[1]);
              skillid = move[2];
              hero = move[3];
              target = $('#' + to + ' .card');
              skill = $('.enemy.skills .' + hero + '-' + skillid).show();
              if (Skills[hero][skillid].passive && skill && target.hasClass('enemy') && skill.passive) {
                skill.passive(skill, target);
                game.enemy.hand -= 1;
              }
            }
            if (move[0] === 'T') {
              to = game.map.mirrorPosition(move[1]);
              skillid = move[2];
              hero = move[3];
              target = $('#' + to + ' .card');
              skill = $('.enemy.skills .' + hero + '-' + skillid).show();
              if (Skills[hero][skillid].toggle && skill && target.hasClass('enemy') && skill.toggle) {
                skill.toggle(skill, target);
                game.enemy.hand -= 1;
              }
            }
          }
        }
        if (game.mode !== 'tutorial') { setTimeout(game.enemy.end, game.enemy.playtime * 1000); }
      },
      end: function () {
        if (game.status !== 'over') {
          game.enemy.skills.deck.removeClass('slide');
          $('.card.enemy.heroes').removeClass('done');
          $('.enemy.skills .card').hide();
          game.status = 'turn';
          game.turn.begin();
          if (game.selectedCard) { game.selectedCard.select(); }
        }
      }
    },
    tower: {
      build: function (side, pos) {
        var tower = game.card.build({
          className: 'tower towers static ' + side,
          side: side,
          name: game.ui.tower,
          attribute: game.ui.building,
          range: game.ui.ranged,
          damage: 15,
          hp: 80
        });
        if (game.mode === 'tutorial') {
          tower.on('click.select', game.tutorial.select).place(pos);
        } else { tower.on('click.select', game.card.select); }
        tower.place(pos);
        game.map.around(pos, game.map.getRange(game.ui.ranged), function (spot) {
          spot.addClass(side + 'area');
        });
        return tower;
      },
      place: function () {
        var p = 'C6';
        game.player.tower = game.tower.build('player', p);
        game.enemy.tower = game.tower.build('enemy', game.map.mirrorPosition(p));
        p = 'A8';
        $('#' + p).addClass('fountain player').attr({title: 'Fountain'});
        $('#' + game.map.mirrorPosition(p)).addClass('fountain enemy').attr({title: 'Fountain'});
      },
      attack: function () {
        var from, to,
          lowestHp = {
            notfound: true,
            data: function (c) { return Infinity; }
          };
        $('.map .playerarea .card.enemy').each(function () {
          var target = $(this);
          if (target.data('current hp') < lowestHp.data('current hp')) {
            lowestHp = target;
          }
        });
        if (!lowestHp.notfound) {
          game.player.tower.attack(lowestHp);
          from = game.map.getPosition(game.player.tower);
          to = game.map.getPosition(lowestHp);
          game.currentData.moves.push('A:' + from + ':' + to);
        }
      }
    },
    tree: {
      build: function (spot) {
        var tree = game.card.build({
          className: 'tree static neutral',
          name: game.ui.tree,
          attribute: game.ui.forest
        });
        tree.on('click.select', game.card.select).place(spot);
        return tree;
      },
      place: function () {
        var treeSpots = 'A2 A3 A4 B3';
        $.each(treeSpots.split(' '), function () {
          game.tree.build(this);
          game.tree.build(game.map.mirrorPosition(this));
        });
      }
    },
    tutorial: {
      build: function () {
        game.mode = 'tutorial';
        game.seed = new Date().valueOf();
        game.id = btoa(game.seed);
        game.message.text(game.ui.waiting);
        game.states.choose.counter.show().text(game.ui.rightpick);
        game.enemy.name = 'axe';
        game.enemy.type = 'challenged';
        game.player.type = 'challenger';
        game.states.choose.enablePick();
        if (!game.tutorial.axe) {
          game.tutorial.axe = $('<div>').addClass('axe tutorial');
          game.tutorial.axeimg = $('<div>').addClass('img').appendTo(game.tutorial.axe);
          game.tutorial.axebaloon = $('<div>').addClass('baloon').appendTo(game.tutorial.axe);
          game.tutorial.message = $('<div>').addClass('txt').appendTo(game.tutorial.axebaloon);
        }
        game.tutorial.message.html(game.ui.axepick);
        game.tutorial.axe.appendTo(game.states.choose.el);
        game.tutorial.axeshow();
      },
      axeshow: function () {
        setTimeout(function () {
          game.tutorial.axe.addClass('up');
        }, 2000);
        setTimeout(function () {
          game.audio.play('tutorial/axehere');
          game.tutorial.axebaloon.fadeIn('slow');
          game.message.text(game.ui.tutorialstart);
          game.loader.removeClass('loading');
        }, 2400);
      },
      pick: function () {
        game.tutorial.oldAvailableSlots = 5;
        var availableSlots = $('.slot.available').length;
        if (availableSlots === 4) {
          game.tutorial.message.html(game.ui.axeheroes);
        } else if (availableSlots === 3) {
          game.tutorial.message.html(game.ui.axemaxcards);
        } else if (availableSlots === 2) {
          game.tutorial.message.html(game.ui.axecardsperturn);
        } else if (availableSlots === 1) {
          game.tutorial.message.html(game.ui.axeautodeck);
        }
        if (availableSlots < game.tutorial.oldAvailableSlots) {
          game.tutorial.axebaloon.hide().fadeIn('slow');
        }
        if (availableSlots) {
          game.states.choose.counter.text(availableSlots + ' ' + game.ui.togo + '. ' + game.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
        } else {
          game.message.text(game.ui.getready);
          game.states.choose.counter.text(game.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
          game.tutorial.axe.addClass('left');
          game.audio.play('tutorial/axebattle');
          game.tutorial.message.html(game.ui.axebattle);
          setTimeout(function () {
            game.tutorial.heroesdeck();
          }, 2000);
        }
        game.tutorial.oldAvailableSlots = availableSlots;
      },
      heroesdeck: function () {
        game.player.picks = [];
        $('.slot').each(function () {
          var slot = $(this), card = slot.find('.card');
          game.player.picks[slot.data('slot')] = card.data('hero');
          if (game.player.picks.length === 5) {
            game.states.choose.reset();
            game.states.changeTo('table');
          }
        });
      },
      start: function () {
        game.status = 'learning';
        game.message.text(game.ui.battle);
        game.loader.removeClass('loading');
        game.audio.play('horn');
        game.tower.place();
        game.tree.place();
        game.tutorial.placePlayerHeroes();
        game.tutorial.placeEnemyHeroes();
        game.states.table.buildUnits();
        game.tutorial.started = true;
        game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
        game.tutorial.axebaloon.hide();
        game.tutorial.lessonSelectEnemy = true;
        game.states.table.time.text(game.ui.time + ': 0:00 ' + game.ui.day);
        setTimeout(function () {
          game.tutorial.axe.addClass('up');
        }, 500);
        setTimeout(game.tutorial.selectEnemy, 1000);
        game.player.kills = 0;
        game.enemy.kills = 0;
      },
      placePlayerHeroes: function () {
        game.player.mana = 0;
        game.player.heroesDeck = game.deck.build({
          name: 'heroes',
          filter: game.player.picks,
          cb: function (deck) {
            deck.addClass('player').appendTo(game.states.table.player);
            var x = 0, y = 6;
            $.each(deck.data('cards'), function (i, card) {
              var p = game.player.picks.indexOf(card.data('hero'));
              card.addClass('player hero').data('side', 'player').on('click.select', game.tutorial.select);
              card.place(game.map.toId(x + p, y));
              game.player.mana += card.data('mana');
            });
          }
        });
      },
      placeEnemyHeroes: function () {
        game.enemy.picks = [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
        game.enemy.heroesDeck = game.deck.build({
          name: 'heroes',
          filter: game.enemy.picks,
          cb: function (deck) {
            deck.addClass('enemy').hide().appendTo(game.states.table.enemy);
            var x = 0, y = 6;
            $.each(deck.data('cards'), function (i, card) {
              var p = game.enemy.picks.indexOf(card.data('hero'));
              card.addClass('enemy hero').data('side', 'enemy').on('click.select', game.tutorial.select);
              card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
            });
          }
        });
      },
      selectEnemy: function () {
        game.tutorial.axebaloon.fadeIn('slow');
        game.tutorial.message.html(game.ui.axeselectenemy);
        game.message.text(game.ui.yourturncount + ' 5');
        $('.map .enemy.tower').addClass('tutorialblink').on('click.select', game.tutorial.select);
      },
      select: function () {
        var card = $(this).removeClass('tutorialblink').select();
        if (game.tutorial.lessonSelectEnemy) {
          if (card.hasAllClasses('tower enemy')) {
            $('.map .enemy.tower').removeClass('tutorialblink');
            game.tutorial.lessonSelectEnemy = false;
            game.tutorial.zoom();
          }
        }
        if (game.tutorial.lessonSelectPlayer) {
          if (card.hasAllClasses('hero player')) {
            $('.map .player.hero').removeClass('tutorialblink');
            game.tutorial.lessonSelectPlayer = false;
            game.tutorial.move();
          }
        }
        if (game.tutorial.lessonSkill) {
          if (card.hasAllClasses('skill player')) {
            $('.player.skill').removeClass('tutorialblink');
            game.tutorial.lessonSkill = false;
            game.tutorial.skill();
          }
        }
      },
      zoom: function () {
        game.tutorial.lessonZoom = true;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axezoom);
        game.message.text(game.ui.yourturncount + ' 4');
        game.states.table.selectedArea.addClass('tutorialblink');
        game.states.table.selectedArea.on('mouseover.tutorial', '.card', game.tutorial.over);
      },
      over: function () {
        if (game.tutorial.lessonZoom) {
          var card = $(this);
          game.states.table.selectedArea.removeClass('tutorialblink');
          game.tutorial.unselect();
          game.tutorial.lessonZoom = false;
        }
      },
      unselect: function () {
        game.states.table.el.click(function (event) {
          var target = $(event.target);
          if (!target.closest('.selected').length && !target.closest('.selectedarea').length) { game.card.unselect(); }
        });
        game.tutorial.lessonUnselect = true;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeunselect);
        game.message.text(game.ui.yourturncount + ' 3');
        game.states.table.selectedArea.on('unselect.tutorial', game.tutorial.unselected);
      },
      unselected: function () {
        if (game.tutorial.lessonUnselect) {
          game.tutorial.selectPlayer();
          game.tutorial.lessonUnselect = false;
        }
      },
      selectPlayer: function () {
        game.tutorial.lessonSelectPlayer = true;
        $('.map .player.hero').addClass('tutorialblink');
        game.tutorial.axe.removeClass('left');
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeselectplayer);
        game.message.text(game.ui.yourturncount + ' 2');
        setTimeout(game.card.unselect);
        game.status = 'turn';
      },
      move: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axemove);
        game.audio.play('tutorial/axemove');
        game.message.text(game.ui.yourturncount + ' 1');
        $('.map .hero.player').on('move', game.tutorial.done);
      },
      done: function () {
        game.tutorial.axe.addClass('left');
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axedone);
        game.message.text(game.ui.enemyturn);
        game.message.addClass('tutorialblink');
        game.status = 'unturn';
        setTimeout(game.tutorial.wait, 5000);
      },
      wait: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axewait);
        game.message.text(game.ui.enemyturncount + ' 2');
        game.audio.play('tutorial/axetime');
        game.states.table.time.text(game.ui.time + ': 1:30 ' + game.ui.night);
        game.message.removeClass('tutorialblink');
        game.states.table.time.addClass('tutorialblink');
        setTimeout(game.tutorial.time, 5000);
      },
      time: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.message.text(game.ui.enemyturncount + ' 1');
        game.tutorial.message.html(game.ui.axetime);
        game.states.table.time.removeClass('tutorialblink');
        game.states.table.turns.addClass('tutorialblink');
        game.states.table.turns.text(game.ui.turns + ': 1/1 (2)');
        setTimeout(game.tutorial.enemyMove, 5000);
        game.tutorial.buildSkills();
      },
      enemyMove: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeenemymove);
        game.message.html(game.ui.enemymove);
        game.audio.play('tutorial/axewait');
        game.states.table.turns.removeClass('tutorialblink');
        var to = 'G2';
        if ($('#' + game.map.mirrorPosition(to)).hasClass('block')) { to = 'G1'; }
        game.currentData = { moves: 'C:E6:' + to + ':blink:am' };
        game.enemy.move();
        setTimeout(game.tutorial.attack, 5000);
      },
      attack: function () {
        game.tutorial.axe.removeClass('left');
        game.enemy.skills.deck.removeClass('slide');
        $('.enemy.skills .card').fadeOut(400);
        game.tutorial.lessonAttack = true;
        $('.map .hero').removeClass('done');
        var pos = game.map.getPosition($('.map .enemy.am')),
          range = game.map.getRange(game.ui.ranged);
        game.map.around(pos, range, function (spot) {
          spot.find('.card.player.hero').addClass('tutorialblink');
        });
        game.status = 'turn';
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeattack);
        game.audio.play('tutorial/axeattack');
        game.message.html(game.ui.yourturn);
        if (game.selectedCard) { game.selectedCard.select(); }
        $('.player.hero').on('attack.tutorial', game.tutorial.skillSelect);
      },
      buildSkills: function () {
        game.player.skills = {};
        game.player.skills.hand = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills hand');
        game.player.skills.sidehand = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills sidehand');
        game.player.skills.temp = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills temp');
        game.player.skills.ult = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills ult');
        game.player.skills.cemitery = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills cemitery');
        game.player.skills.deck = game.deck.build({
          name: 'skills',
          filter: [game.player.picks[3], game.player.picks[4]],
          cb: function (deck) {
            deck.addClass('player available').hide().appendTo(game.states.table.player);
            $.each(deck.data('cards'), function (i, skill) {
              skill.addClass('player skill').data('side', 'player').on('click.select', game.tutorial.select);
            });
          }
        });
        game.enemy.skills = {};
        game.enemy.skills.deck = game.deck.build({
          name: 'skills',
          filter: ['am'],
          cb: function (deck) {
            deck.addClass('enemy hand cemitery toggle').appendTo(game.states.table.enemy);
            $.each(deck.data('cards'), function (i, skill) {
              skill.hide().addClass('enemy skill').data('side', 'enemy');
            });
          }
        });
      },
      skillSelect: function () {
        $('.card.enemy.done').removeClass('done');
        game.tutorial.lessonSkill = true;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeskillselect);
        game.player.buyHand();
        game.player.skills.hand.show();
        game.player.skills.sidehand.show();
        $('.player.hero').removeClass('tutorialblink');
        $('.player.skill').addClass('tutorialblink');
        setTimeout(function () {
          $('.player.hero').removeClass('done');
        }, 200);
      },
      skill: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeskill);
        $('.card').on('cast.tutorial', game.tutorial.end);
        $('.card').on('passive.tutorial', game.tutorial.end);
        $('.card').on('toggle.tutorial', game.tutorial.end);
      },
      end: function () {
        game.tutorial.lessonAttack = false;
        game.tutorial.lessonSkill = false;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeend);
        game.audio.play('tutorial/axeah');
        game.message.text(game.ui.lose);
        game.winner = game.player.name;
        game.states.table.showResults();
        game.tutorial.started = false;
        game.status = 'tutorialcompleted';
      },
      clear: function () {
        game.tutorial.axe.removeClass('up');
        game.tutorial.axe.removeClass('left');
        game.tutorial.axebaloon.hide();
        game.db({
          'set': 'chat',
          'data': game.player.name + ' ' + game.ui.completedtutorial + ':+1:'
        }, function (chat) {
          game.chat.update(chat);
        });
      }
    },
    match: {
      online: function () {
        game.mode = 'online';
        game.seed = new Date().valueOf();
        game.id = btoa(game.seed);
        game.db({
          'set': 'waiting',
          'data': { id: game.id }
        }, function (waiting) {
          if (game.id === waiting.id) {
            game.player.type = 'challenged';
            game.match.wait();
          } else {
            game.id = waiting.id;
            game.seed = parseInt(atob(game.id), 10);
            game.player.type = 'challenger';
            game.match.found();
          }
        });
      },
      wait: function () {
        game.loader.addClass('loading');
        game.currentData.challenged = game.player.name;
        game.db({
          'set': game.id,
          'data': game.currentData
        }, function () {
          game.message.text(game.ui.waiting);
          game.tries = 1;
          game.match.search();
        });
      },
      search: function () {
        clearTimeout(game.timeout);
        game.db({ 'get': game.id }, function (found) {
          if (found.challenger) {
            game.triesCounter.text('');
            game.currentData = found;
            game.match.battle.call(game.states.choose, found.challenger, 'challenger');
          } else {
            game.triesCounter.text(game.tries += 1);
            if (game.tries > game.waitLimit) {
              game.message.text(game.ui.noenemy);
              setTimeout(function () {
                game.states.changeTo('menu');
              }, 2000);
            } else { game.timeout = setTimeout(game.match.search, 1000); }
          }
        });
      },
      found: function () {
        game.message.text(game.ui.gamefound);
        game.db({ 'get': game.id }, function (found) {
          if (found.challenged) {
            game.loader.removeClass('loading');
            game.triesCounter.text('');
            game.currentData = found;
            game.currentData.challenger = game.player.name;
            game.db({
              'set': game.id,
              'data': game.currentData
            }, function () {
              game.match.battle(found.challenged, 'challenged');
            });
          } else { game.load.reset(); }
        });
      },
      pick: function () {
        if ($('.slot.available').length === 0) {
          game.states.choose.counter.text(game.ui.startsin + ': ' + game.states.choose.count + ' ' + game.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
        } else { game.states.choose.counter.text(game.ui.pickdeck + ': ' + game.states.choose.count); }
      },
      pickCount: function () {
        game.states.choose.count -= 1;
        if ($('.slot.available').length !== 0) {
          game.states.choose.counter.text(game.ui.pickdeck + ': ' + game.states.choose.count);
        } else { game.states.choose.counter.text(game.ui.startsin + ': ' + game.states.choose.count + ' ' + game.ui.cardsperturn + ': ' + game.player.cardsPerTurn); }
        if (game.states.choose.count < 0) {
          game.states.choose.counter.text(game.ui.getready);
          game.states.choose.disablePick();
          game.match.fillDeck();
        } else { setTimeout(game.match.pickCount, 1000); }
      },
      fillDeck: function () {
        $('.slot').each(function () {
          var slot = $(this), card;
          if (slot.hasClass('available')) {
            card = game.deck.randomCard($('.pickbox .card'), 'noseed');
            slot.append(card).removeClass('available selected');
            game.player.picks[slot.data('slot')] = card.data('hero');
          }
          if ($('.choose .card.selected').length === 0) { game.states.choose.pickDeck.children().first().click(); }
          if (game.player.picks.length === 5) { game.match.sendDeck(); }
        });
      },
      sendDeck: function () {
        game.states.choose.el.removeClass('turn');
        game.states.choose.pickDeck.css('margin-left', 0);
        game.states.choose.tries = 1;
        if (game.player.type === 'challenged') {
          game.currentData.challengedDeck = game.player.picks.join('|');
          game.db({
            'set': game.id,
            'data': game.currentData
          }, function () {
            game.match.getChallengerDeck();
          });
        }
        if (game.player.type === 'challenger') { game.match.getChallengedDeck(); }
      },
      getChallengerDeck: function () {
        clearTimeout(game.timeout);
        game.message.text(game.ui.loadingdeck);
        game.loader.addClass('loading');
        game.db({ 'get': game.id }, function (found) {
          if (found.challengerDeck) {
            game.triesCounter.text('');
            game.currentData = found;
            game.enemy.picks = game.currentData.challengerDeck.split('|');
            game.states.choose.reset();
            game.states.changeTo('table');
          } else {
            game.triesCounter.text(game.tries += 1);
            if (game.tries > game.connectionLimit) {
              game.load.reset();
            } else { game.timeout = setTimeout(game.match.getChallengerDeck, 1000); }
          }
        });
      },
      getChallengedDeck: function () {
        clearTimeout(game.timeout);
        game.message.text(game.ui.loadingdeck);
        game.loader.addClass('loading');
        game.db({ 'get': game.id }, function (found) {
          if (found.challengedDeck) {
            game.triesCounter.text('');
            game.currentData = found;
            game.currentData.challengerDeck = game.player.picks.join('|');
            game.enemy.picks = game.currentData.challengedDeck.split('|');
            game.db({
              'set': game.id,
              'data': game.currentData
            }, function () {
              game.states.choose.reset();
              game.states.changeTo('table');
            });
          } else {
            game.triesCounter.text(game.tries += 1);
            if (game.tries > game.connectionLimit) {
              game.load.reset();
            } else { game.timeout = setTimeout(game.match.getChallengedDeck, 1000); }
          }
        });
      },
      battle: function (enemy, challenge) {
        game.status = 'picking';
        game.loader.removeClass('loading');
        game.states.choose.el.addClass('turn');
        game.enemy.name = enemy;
        game.enemy.type = challenge;
        game.message.html(game.ui.battlefound + ' <b>' + game.player.name + '</b> vs <b class="enemy">' + game.enemy.name + '</b>');
        game.states.choose.counter.show();
        game.audio.play('battle');
        game.states.choose.count = game.timeToPick;
        game.states.choose.enablePick();
        setTimeout(game.match.pickCount, 1000);
      },
      start: function () {
        game.states.table.el.click(function (event) {
          var target = $(event.target);
          if (!target.closest('.selected').length && !target.closest('.selectedarea').length) { game.card.unselect(); }
        });
        game.loader.addClass('loading');
        game.message.text(game.ui.battle);
        game.audio.play('horn');
        game.match.placePlayerHeroes();
        game.match.placeEnemyHeroes();
        game.match.buildSkills();
        game.tower.place();
        game.tree.place();
        game.states.table.buildUnits();
        game.match.started = true;
        game.turn.build();
        setTimeout(game.turn.begin, 3000);
      },
      placePlayerHeroes: function () {
        if (game.player.picks) {
          game.player.mana = 0;
          game.player.heroesDeck = game.deck.build({
            name: 'heroes',
            filter: game.player.picks,
            cb: function (deck) {
              deck.addClass('player').appendTo(game.states.table.player);
              var x = 0, y = 6;
              $.each(deck.data('cards'), function (i, card) {
                var p = game.player.picks.indexOf(card.data('hero'));
                card.addClass('player hero').data('side', 'player').on('click.select', game.card.select);
                card.place(game.map.toId(x + p, y));
                game.player.mana += card.data('mana');
              });
            }
          });
        }
      },
      placeEnemyHeroes: function () {
        if (game.enemy.picks) {
          game.enemy.mana = 0;
          game.enemy.heroesDeck = game.deck.build({
            name: 'heroes',
            filter: game.enemy.picks,
            cb: function (deck) {
              deck.addClass('enemy').hide().appendTo(game.states.table.enemy);
              var x = 0, y = 6;
              $.each(deck.data('cards'), function (i, card) {
                var p = game.enemy.picks.indexOf(card.data('hero'));
                card.addClass('enemy hero').data('side', 'enemy').on('click.select', game.card.select);
                card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
                game.enemy.mana += card.data('mana');
              });
            }
          });
        }
      },
      buildSkills: function (single) {
        game.player.manaBuild();
        game.player.skills = {};
        game.player.skills.hand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills hand');
        game.player.skills.sidehand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills sidehand');
        game.player.skills.temp = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills temp');
        game.player.skills.ult = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills ult');
        game.player.skills.cemitery = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills cemitery');
        game.player.skills.deck = game.deck.build({
          name: 'skills',
          multi: single ? false : 'cards',
          filter: game.player.picks,
          cb: function (deck) {
            deck.addClass('player available').hide().appendTo(game.states.table.player);
            $.each(deck.data('cards'), function (i, skill) {
              skill.addClass('player skill').data('side', 'player').on('click.select', game.card.select);
              if (skill.data('skill') === 'ult') {
                skill.appendTo(game.player.skills.ult);
              } else if (skill.data('deck') === game.ui.temp) {
                skill.appendTo(game.player.skills.temp);
              }
            });
          }
        });
        game.enemy.maxCards = Math.round(game.enemy.mana / 2);
        game.enemy.cardsPerTurn = 1 + Math.round(game.enemy.mana / 10);
        game.enemy.hand = 0;
        game.enemy.skills = {};
        game.enemy.skills.deck = game.deck.build({
          name: 'skills',
          filter: game.enemy.picks,
          cb: function (deck) {
            deck.addClass('enemy hand cemitery toggle').appendTo(game.states.table.enemy);
            $.each(deck.data('cards'), function (i, skill) {
              skill.hide().addClass('enemy skill').data('side', 'enemy');
            });
          }
        });
      },
      sendData: function () {
        game.message.text(game.ui.uploadingturn);
        game.currentData[game.player.type + 'Turn'] = game.player.turn;
        game.currentData.moves = game.currentData.moves.join('|');
        game.db({
          'set': game.id,
          'data': game.currentData
        }, function () {
          setTimeout(game.turn.begin, 1000);
        });
      },
      getData: function () {
        game.message.text(game.ui.loadingturn);
        clearTimeout(game.timeout);
        game.db({ 'get': game.id }, function (data) {
          if (data[game.enemy.type + 'Turn'] === game.enemy.turn) {
            game.triesCounter.text('');
            game.currentData = data;
            game.enemy.move();
          } else {
            game.tries += 1;
            game.triesCounter.text(game.tries);
            if (game.tries > game.connectionLimit) {
              game.load.reset();
            } else { game.timeout = setTimeout(game.match.getData, 1000); }
          }
        });
      },
      win: function () {
        game.winner = game.player.name;
        game.states.table.el.removeClass('unturn');
        game.states.table.el.addClass('turn');
        game.message.text(game.ui.win);
        game.match.sendData();
        game.status = 'over';
        game.states.table.showResults();
      },
      lose: function () {
        game.winner = game.enemy.name;
        game.states.table.el.removeClass('turn');
        game.states.table.el.addClass('unturn');
        game.message.text(game.ui.lose);
        game.loader.removeClass('loading');
        game.status = 'over';
        game.states.table.showResults();
      },
      end: function () {
        game.match.started = false;
      }
    },
    turn: {
      build: function () {
        game.time = 0;
        game.player.turn = 0;
        game.enemy.turn = 0;
        game.player.kills = 0;
        game.enemy.kills = 0;
        game.currentData.moves = [];
        game.currentData = {};
        if (game.player.type === 'challenged') { game.status = 'turn'; }
        if (game.player.type === 'challenger') { game.status = 'unturn'; }
      },
      begin: function () {
        if (game.status !== 'over') {
          game.currentData.moves = [];
          $('.card .damaged').remove();
          $('.card .heal').remove();
          $('.card.dead').each(function () {
            var dead = $(this);
            if (game.time > dead.data('reborn')) { dead.reborn(); }
          });
          if (game.turn === 6) { $('.card', game.states.table.playerUlts).appendTo(game.player.skills.deck); }
          if (game.status === 'turn') {
            game.states.table.el.removeClass('unturn').addClass('turn');
            game.message.text(game.ui.yourturn);
            game.player.turn += 1;
            $('.map .card.player').removeClass('done');
            game.player.buyHand();
            game.tower.attack();
            game.map.highlight();
          } else {
            game.message.text(game.ui.enemyturn);
            game.enemy.turn += 1;
            $('.map .card.enemy').removeClass('done');
            game.enemy.buyHand();
          }
          $('.card').each(function () {
            var card = $(this);
            card.trigger('turnstart', { target: card });
            if (game.status === 'turn') {
              card.trigger('playerturnstart', { target: card });
            } else { card.trigger('enemyturnstart', { target: card }); }
            card.reduceStun();
          });
          game.time = game.player.turn + game.enemy.turn;
          game.turn.counter = game.timeToPlay;
          if (game.status === 'unturn') { game.turn.counter += 1; }
          game.loader.removeClass('loading');
          setTimeout(game.turn.count, 1000);
        }
      },
      count: function () {
        clearTimeout(game.timeout);
        game.states.table.time.text(game.ui.time + ': ' + game.turn.hours() + ' ' + game.turn.dayNight());
        game.states.table.turns.text(game.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + parseInt(game.time, 10) + ')');
        if (game.status === 'turn') {
          game.message.text(game.ui.yourturncount + ' ' + game.turn.counter + ' ' + game.ui.seconds);
        } else if (game.status === 'unturn') {
          game.message.text(game.ui.enemyturncount + ' ' + game.turn.counter + ' ' + game.ui.seconds);
        }
        if (game.turn.counter < 1) { game.turn.end(); } else { game.timeout = setTimeout(game.turn.count, 1000); }
        game.time += 0.9 / game.timeToPlay;
        game.turn.counter -= 1;
      },
      end: function () {
        game.message.text(game.ui.turnend);
        game.map.unhighlight();
        $('.card .damaged').remove();
        $('.card .heal').remove();
        $('.card.heroes').each(function () {
          var hero = $(this);
          if (hero.data('channeling')) { hero.trigger('channel', { source: hero }); }
          hero.trigger('turnend', { target: hero });
        });
        if (game.status === 'turn') {
          game.states.table.el.removeClass('turn');
          game.states.table.el.addClass('unturn');
          game.status = 'unturn';
          setTimeout(game.match.sendData, 1000);
        } else {
          game.tries = 1;
          setTimeout(game.match.getData, 1000);
        }
      },
      hours: function () {
        var convertedMin, intMin, stringMin,
          hours = game.time % game.dayLength,
          perCentHours = hours / game.dayLength,
          convertedHours = perCentHours * 24,
          intHours = parseInt(convertedHours, 10),
          minutes = convertedHours - intHours;
        if (minutes < 0) { minutes = 0; }
        convertedMin = minutes * 60;
        intMin = parseInt(convertedMin, 10);
        stringMin = intMin < 10 ? '0' + intMin : intMin;
        return intHours + ':' + stringMin;
      },
      dayNight: function () {
        var hours = game.time % game.dayLength;
        if (hours < game.dayLength / 2) {
          return game.ui.day;
        } else { return game.ui.night; }
      }
    },
    sounds: [
      'activate',
      'crit',
      'horn',
      'battle',
      'pick',
      'tower/attack',
      'tutorial/axehere',
      'tutorial/axebattle',
      'tutorial/axemove',
      'tutorial/axeattack',
      'tutorial/axetime',
      'tutorial/axewait',
      'tutorial/axeah',
      'am/attack',
      'am/burn',
      'am/blink',
      'am/ult',
      'cm/attack',
      'cm/freeze',
      'cm/slow',
      'cm/ult',
      'ld/attack',
      'ld/bear',
      'ld/cry',
      'ld/entangle',
      'ld/rabid',
      'ld/return',
      'ld/transform',
      'ld/ult',
      'pud/attack',
      'pud/hook',
      'pud/rot',
      'pud/ult',
      'wk/attack',
      'wk/stun',
      'wk/ult',
      'crit'
    ],
    audio: {
      buffers: {},
      build: function () {
        game.audio.context = new AudioContext();
        game.mute = game.audio.context.createGain();
        game.mute.connect(game.audio.context.destination);
        game.audio.sounds = game.audio.context.createGain();
        game.audio.sounds.connect(game.mute);
        game.audio.track = game.audio.context.createGain();
        game.audio.track.connect(game.mute);
        game.mute.gain.value = 0.6;
      },
      play: function (name) {
        if (game.audio.context && game.audio.context.createBufferSource) {
          var audio = game.audio.context.createBufferSource();
          audio.buffer = game.audio.buffers[name];
          if (name === game.song) {
            audio.connect(game.audio.track);
          } else {
            audio.connect(game.audio.sounds);
          }
          audio.start();
        }
      }
    },
    chat: {
      build: function () {
        game.chat.el = $('<div>').addClass('chat').appendTo(game.states.menu.el).html('<h1>Chat</h1>').hover(function () {
          game.chat.input.focus();
        });
        game.chat.messages = $('<div>').addClass('messages').appendTo(game.chat.el);
        game.chat.input = $('<input>').appendTo(game.chat.el).attr({
          type: 'text',
          maxlength: 42
        }).keydown(function (e) {
          if (e.which === 13) { game.chat.button.click(); }
        });
        game.chat.button = $('<div>').addClass('button').appendTo(game.chat.el).click(function () {
          var msg = game.chat.input.val();
          if (!msg) {
            game.chat.input.focus();
          } else {
            game.chat.button.attr('disabled', true);
            game.loader.addClass('loading');
            game.chat.input.val('');
            game.db({
              'set': 'chat',
              'data': game.player.name + ': ' + msg
            }, function (chat) {
              game.chat.update(chat);
              setTimeout(function () {
                game.loader.removeClass('loading');
                game.chat.button.attr('disabled', false);
              }, 2000);
            });
          }
        }).text('Send');
        game.chat.icon = $('<span>').text('Chat').addClass('chat-icon').appendTo(game.chat.el);
        setInterval(function () {
          game.db({ 'get': 'chat' }, function (chat) {
            game.chat.update(chat);
          });
        }, 5000);
        game.db({
          'set': 'chat',
          'data': ':bust_in_silhouette:' + game.player.name + ' ' + game.ui.joined
        }, function (chat) {
          game.chat.update(chat);
        });
        game.chat.el.appendTo(game.states.menu.el);
        $(document.body).on('keypress', function (e) {
          if (e.which === 13) {
            if (game.currentState === 'choose' ||
                game.currentState === 'options' ||
                game.currentState === 'table') {
              game.chat.el.toggleClass('hover');
            }
          }
        });
        game.chat.builded = true;
      },
      update: function (chat) {
        var down = false,
          height = game.chat.messages[0].scrollHeight - game.chat.messages.height();
        if (game.chat.messages.scrollTop() === height) { down = true; }
        game.chat.messages.empty();
        $.each(chat.messages, function () {
          var msg = $('<p>').text(this).prependTo(game.chat.messages).emojify();
        });
        if (down) { game.chat.messages.scrollTop(game.chat.messages[0].scrollHeight); }
      }
    },
    map: {
      lettersStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      width: 2544,
      height: 2500,
      build: function (opt) {
        game.map.letters = game.map.lettersStr.split('');
        game.spot = [];
        var map = $('<div>').addClass('map').css({width: game.map.width, height: game.map.height}), w, h, tr;
        for (h = 0; h < opt.height; h += 1) {
          game.spot[h] = [];
          tr = $('<div>').addClass('row').appendTo(map);
          for (w = 0; w < opt.width; w += 1) {
            game.spot[h][w] = $('<div>').attr({id: game.map.toId(w, h)}).addClass('free spot').appendTo(tr).on('contextmenu', game.nomenu);
          }
        }
        game.map.builded = true;
        return map;
      },
      start: function () {
        game.scrollX = 40;
        game.scrollY = 60;
        game.states.table.camera = $('<div>').appendTo(game.states.table.el).addClass('camera').mousemove(function (event) {
          var offset = game.states.table.camera.offset(),
            x = event.clientX - offset.left,
            y = event.clientY - offset.top;
          if (x < 50) { game.scrollingX = -1; } else if (x > 690) { game.scrollingX = 1; } else { game.scrollingX = 0; }
          if (y < 50) { game.scrollingY = -1; } else if (y > 400) { game.scrollingY = 1; } else { game.scrollingY = 0; }
        }).hover(function () {
          game.scrollingX = 0;
          game.scrollingY = 0;
        });
        game.states.table.map = game.map.build({'width': game.width, 'height': game.height}).appendTo(game.states.table.camera);
        setInterval(game.map.scroll, 16);
      },
      scroll: function () {
        if (game.scrollingX) {
          game.scrollX += game.scrollspeed * game.scrollingX;
          if (game.scrollX < 39) { game.scrollX = 39; }
          if (game.scrollX > 45) { game.scrollX = 45; }
          game.states.table.map.css({
            transform: 'rotateX(40deg) translate(-' + game.scrollX + '%, -' + game.scrollY + '%)  scale3d(0.6,0.6,0.6)'
          });
        }
        if (game.scrollingY) {
          game.scrollY += game.scrollspeed * game.scrollingY;
          if (game.scrollY < 54) { game.scrollY = 54; }
          if (game.scrollY > 65) { game.scrollY = 65; }
          game.states.table.map.css({
            transform: 'rotateX(40deg) translate(-' + game.scrollX + '%, -' + game.scrollY + '%)  scale3d(0.6,0.6,0.6)'
          });
        }
      },
      toId: function (w, h) {
        if (w >= 0 && h >= 0 && w < game.width && h < game.height) {
          return game.map.letters[w] + (h + 1);
        }
      },
      getX: function (id) {
        if (typeof id !== 'string') { id = id.attr('id'); }
        if (id) {
          var w = game.map.letters.indexOf(id[0]);
          if (w >= 0 && w < game.width) { return w; }
        }
      },
      getY: function (id) {
        if (typeof id !== 'string') { id = id.attr('id'); }
        if (id) {
          var h = parseInt(id[1], 10) - 1;
          if (h >= 0 && h < game.height) { return h; }
        }
      },
      getSpot: function (w, h) {
        if (game.spot[h] && game.spot[h][w]) { return game.spot[h][w]; }
      },
      getPosition: function (el) {
        if (el.hasClass('spot')) { return el.attr('id'); }
        return el.closest('.spot').attr('id');
      },
      mirrorPosition: function (pos) {
        var w = game.map.getX(pos), h = game.map.getY(pos),
          x = game.width - w - 1, y = game.height - h - 1;
        return game.map.toId(x, y);
      },
      rangeArray: [ 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4 ],
      atRange: function (spot, range, cb, filter) {
        if (range >= 0 && range <= game.map.rangeArray.length) {
          var radius, x, y, r, r2, l,
            fil = function (x, y) {
              var spot = game.map.getSpot(x, y);
              if (spot) {
                if (filter) {
                  if (!spot.hasClasses(filter)) { cb(spot); }
                } else { cb(spot); }
              }
            },
            w = game.map.getX(spot),
            h = game.map.getY(spot);
          if (range === 0) {
            fil(w, h);
          } else {
            radius = game.map.rangeArray[range];
            r = Math.round(radius);
            r2 = radius * radius;
            l = Math.ceil(radius) * Math.cos(Math.PI / 4);
            fil(w, h + r);
            fil(w, h - r);
            fil(w - r, h);
            fil(w + r, h);
            if (range === 2 || range === 3) {
              for (x = 1; x <= l; x += 1) {
                y = Math.round(Math.sqrt(r2 - x * x));
                fil(w + x, h + y);
                fil(w + x, h - y);
                fil(w - x, h + y);
                fil(w - x, h - y);
              }
            } else if (range > 3) {
              for (x = 1; x <= l; x += 1) {
                y = Math.round(Math.sqrt(r2 - x * x));
                fil(w + x, h + y);
                fil(w + y, h + x);
                fil(w + x, h - y);
                fil(w + y, h - x);
                fil(w - x, h + y);
                fil(w - y, h + x);
                fil(w - x, h - y);
                fil(w - y, h - x);
              }
            }
          }
        }
      },
      atCross: function (spot, range, width, cb, filter) {
        if (range >= 0) {
          var x, y, r,
            fil = function (x, y) {
              var spot = game.map.getSpot(x, y);
              if (spot) {
                if (filter) {
                  if (!spot.hasClasses(filter)) { cb(spot); }
                } else { cb(spot); }
              }
            },
            w = game.map.getX(spot),
            h = game.map.getY(spot);
          if (range === 0) {
            fil(w, h);
          } else {
            for (r = 1; r <= range; r += 1) {
              fil(w, h + r);
              fil(w, h - r);
              fil(w - r, h);
              fil(w + r, h);
            }
          }
        }
      },
      atMovementRange: function (card, range, cb, filter) {
        if (range >= 0 && range <= game.map.rangeArray.length) {
          var radius, x, y, r, r2, l, a, i, o, m, s,
            fil = function (x, y) {
              var spot = game.map.getSpot(x, y);
              if (spot) {
                if (filter) {
                  if (!spot.hasClasses(filter)) { cb(spot); }
                } else { cb(spot); }
              }
            },
            pos = game.map.getPosition(card),
            w = game.map.getX(pos),
            h = game.map.getY(pos);
          radius = game.map.rangeArray[range];
          r = Math.round(radius);
          r2 = radius * radius;
          l = Math.ceil(radius) * Math.cos(Math.PI / 4);
          fil(w, h + 1);
          fil(w, h - 1);
          fil(w - 1, h);
          fil(w + 1, h);
          if (range === 2 || range === 3) {
            for (x = 1; x <= l; x += 1) {
              y = Math.round(Math.sqrt(r2 - x * x));
              fil(w + x, h + y);
              fil(w + x, h - y);
              fil(w - x, h + y);
              fil(w - x, h - y);
            }
          }
          if (range === 3 && !card.hasClass('phased')) {
            a = [{ a: w, b: h + 2, c: w, d: h + 1, e: w + 1, f: h + 1, g: w - 1, h: h + 1 },
                 { a: w, b: h - 2, c: w, d: h - 1, e: w + 1, f: h - 1, g: w - 1, h: h - 1 },
                 { a: w - 2, b: h, c: w - 1, d: h, e: w - 1, f: h + 1, g: w - 1, h: h - 1 },
                 { a: w + 2, b: h, c: w + 1, d: h, e: w + 1, f: h + 1, g: w + 1, h: h - 1 }
              ];
            for (i = 0; i < a.length; i += 1) {
              o = a[i];
              m = game.map.getSpot(o.a, o.b);
              s = game.map.getSpot(o.c, o.d);
              if (s && s.hasClass('free')) {
                if (m) { m.data('detour', false); }
                fil(o.a, o.b);
              } else {
                s = game.map.getSpot(o.e, o.f);
                if (s && s.hasClass('free')) {
                  if (m) { m.data('detour', s); }
                  fil(o.a, o.b);
                } else {
                  s = game.map.getSpot(o.g, o.h);
                  if (s && s.hasClass('free')) {
                    if (m) { m.data('detour', s); }
                    fil(o.a, o.b);
                  }
                }
              }
            }
          }
        }
      },
      inRange: function (spot, r, cb) {
        game.map.atRange(spot, 0, cb);
        game.map.around(spot, r, cb);
      },
      around: function (spot, r, cb) {
        game.map.atRange(spot, r, cb);
        if (r === 3) { game.map.atRange(spot, 1, cb); }
        if (r === 4) { game.map.atRange(spot, 2, cb); }
        if (r === 5) {
          game.map.atRange(spot, 1, cb);
          game.map.atRange(spot, 3, cb);
        }
      },
      radialStroke: function (spot, range, cl) {
        var radius, x, y, r, r2, l,
          fil = function (x, y, border) {
            var spot = game.map.getSpot(x, y);
            if (spot) { spot.addClass(cl + ' stroke ' + border); }
          },
          w = game.map.getX(spot),
          h = game.map.getY(spot);
        if (range === 0) { return fil(w, h, 'left right top bottom'); }
        radius = game.map.rangeArray[range];
        r = Math.round(radius);
        r2 = radius * radius;
        l = Math.ceil(radius) * Math.cos(Math.PI / 4);
        if (range % 2 === 0) {
          fil(w, h + r, 'bottom');
          fil(w, h - r, 'top');
          fil(w - r, h, 'left');
          fil(w + r, h, 'right');
        } else if (range % 2 === 1) {
          fil(w, h + r, 'bottom left right');
          fil(w, h - r, 'top  left right');
          fil(w - r, h, 'left top bottom');
          fil(w + r, h, 'right top bottom');
        }
        if (range === 2 || range === 3) {
          for (x = 1; x <= l; x += 1) {
            y = 1;
            fil(w + x, h + y, 'right bottom');
            fil(w + x, h - y, 'right top');
            fil(w - x, h + y, 'left bottom');
            fil(w - x, h - y, 'left top');
          }
        } else if (range === 4 || range === 6 || range === 8) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y, 'right bottom');
            fil(w + y, h + x, 'right bottom');
            fil(w + x, h - y, 'right top');
            fil(w + y, h - x, 'right top');
            fil(w - x, h + y, 'left bottom');
            fil(w - y, h + x, 'left bottom');
            fil(w - x, h - y, 'left top');
            fil(w - y, h - x, 'left top');
          }
        } else if (range >= 5) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y, 'bottom');
            fil(w - x, h + y, 'bottom');
            fil(w + x, h - y, 'top');
            fil(w - x, h - y, 'top');
            fil(w - y, h + x, 'left');
            fil(w - y, h - x, 'left');
            fil(w + y, h - x, 'right');
            fil(w + y, h + x, 'right');
          }
        }
        if (range === 7) {
          fil(w + 3, h + 2, 'bottom');
          fil(w - 3, h + 2, 'bottom');
          fil(w + 3, h - 2, 'top');
          fil(w - 3, h - 2, 'top');
          fil(w - 2, h + 3, 'left');
          fil(w - 2, h - 3, 'left');
          fil(w + 2, h + 3, 'right');
          fil(w + 2, h - 3, 'right');
        }
      },
      crossStroke: function (spot, range, width, cl) {
        var radius, x, y, r,
          fil = function (x, y, border) {
            var spot = game.map.getSpot(x, y);
            if (spot) { spot.addClass(cl + ' stroke ' + border); }
          },
          w = game.map.getX(spot),
          h = game.map.getY(spot);
        if (range === 0) { return fil(w, h, 'left right top bottom'); }

        fil(w, h + range, 'bottom');
        fil(w, h - range, 'top');
        fil(w - range, h, 'left');
        fil(w + range, h, 'right');

        for (r = 1; r <= range; r += 1) {
          fil(w - width, h + r, 'left');
          fil(w + width, h + r, 'right');
        }
        for (r = 1; r <= range; r += 1) {
          fil(w - width, h - r, 'left');
          fil(w + width, h - r, 'right');
        }
        for (r = 1; r <= range; r += 1) {
          fil(w + r, h - width, 'top');
          fil(w + r, h + width, 'bottom');
        }
        for (r = 1; r <= range; r += 1) {
          fil(w - r, h - width, 'top');
          fil(w - r, h - width, 'bottom');
        }

      },
      linearStroke: function (spot, range, width, cl) {
        var radius, x, y, r,
          fil = function (x, y, border) {
            var spot = game.map.getSpot(x, y);
            if (spot) { spot.addClass(cl + ' stroke ' + border); }
          },
          cw = game.map.getX(spot),
          ch = game.map.getY(spot),
          w = game.map.getX(game.castpos),
          h = game.map.getY(game.castpos);
        if (ch - h > 0) {
          fil(w, h + range, 'bottom');
          for (r = 1; r <= range; r += 1) {
            fil(w - width, h + r, 'left');
            fil(w + width, h + r, 'right');
          }
        }
        if (ch - h < 0) {
          fil(w, h - range, 'top');
          for (r = 1; r <= range; r += 1) {
            fil(w - width, h - r, 'left');
            fil(w + width, h - r, 'right');
          }
        }
        if (cw - w > 0) {
          fil(w + range, h, 'right');
          for (r = 1; r <= range; r += 1) {
            fil(w + r, h - width, 'top');
            fil(w + r, h + width, 'bottom');
          }
        }
        if (cw - w < 0) {
          fil(w - range, h, 'left');
          for (r = 1; r <= range; r += 1) {
            fil(w - r, h - width, 'top');
            fil(w - r, h - width, 'bottom');
          }
        }
      },
      getRange: function (att) {
        var range = att;
        if (att === game.ui.ortho) { range = 1; }
        if (att === game.ui.melee) { range = 2; }
        if (att === game.ui.short) { range = 3; }
        if (att === game.ui.ranged) { range = 4; }
        if (att === game.ui.long) { range = 5; }
        return range;
      },
      highlight: function () {
        if (game.selectedCard) {
          if (game.selectedCard.hasClasses('hero unit')) {
            game.selectedCard.strokeAttack();
            if (game.status === 'turn') {
              if (!game.tutorial.lessonAttack) { game.selectedCard.highlightMove(); }
              if (!game.tutorial.lessonSkill) { game.selectedCard.highlightAttack(); }
            }
          } else if (game.selectedCard.hasClass('skill')) {
            game.selectedCard.highlightSource();
            game.selectedCard.strokeSkill();
            if (game.status === 'turn') {
              game.selectedCard.highlightTargets();
            }
          } else if (game.selectedCard.hasClass('tower')) {
            game.selectedCard.strokeAttack();
          }
        }
      },
      unhighlight: function () {
        $('.map .card').off('contextmenu.attack contextmenu.cast contextmenu.passive contextmenu.toggle mouseenter mouseleave').removeClass('attacktarget casttarget targetarea');
        $('.map .spot').off('contextmenu.movearea contextmenu.castarea mouseenter mouseleave').removeClass('movearea targetarea stroke playerattack enemyattack skillcast skillarea top bottom left right');
      }
    },
    fx: {
      width: 2200,
      height: 2300,
      build: function (card) {
        var canvas = $('<canvas>').addClass('fx'), ctx;
        canvas[0].width = game.fx.width;
        canvas[0].height = game.fx.height;
        ctx = canvas[0].getContext('2d');
        card.data('fx', {canvas: canvas, ctx: ctx, width: game.fx.width, height: game.fx.height});
        //ctx.fillRect(0, 0, game.fx.width, game.fx.height);
      },
      particles: function (fx) {
        return {
          array: [],
          create: function (n, o) {
            var i;
            for (i = 0; i < n; i += 1) {
              this.array.push({
                x: o.x(),
                ox: o.x,
                y: o.y(),
                oy: o.y,
                speed: o.speed(),
                os: o.speed,
                radius: o.radius(),
                or: o.radius,
                dir: o.dir(),
                od: o.dir,
                color: o.color(),
                oc: o.color
              });
            }
          },
          animate: function () {
            var i, p;
            fx.ctx.clearRect(0, 0, fx.width, fx.height);
            for (i = 0; i < this.array.length; i += 1) {
              p = this.array[i];
              p = this.move(p);
              this.circle(p.x, p.y, p.radius, p.color);
            }
            this.timeout = setTimeout(this.animate.bind(this), 20);
          },
          move: function (p) {
            p.x += Math.cos(p.dir) * p.speed;
            p.y += Math.sin(p.dir) * p.speed;
            p.radius -= 0.5;
            if (p.radius < 1) {
              p.x = p.ox();
              p.y = p.oy();
              p.speed = p.os();
              p.radius = p.or();
              p.dir = p.od();
              p.color = p.oc();
            }
            return p;
          },
          circle : function (x, y, r, c) {
            var gradient = fx.ctx.createRadialGradient(x, y, 0, x, y, r * 1.5);
            gradient.addColorStop(0, c || 'white');
            gradient.addColorStop(1, 'transparent');
            fx.ctx.fillStyle = gradient;
            fx.ctx.beginPath();
            fx.ctx.arc(x, y, r, 0, Math.PI * 2);
            fx.ctx.fill();
            fx.ctx.closePath();
          },
          stop: function () {
            fx.ctx.clearRect(0, 0, fx.width, fx.height);
            clearTimeout(this.timeout);
          },
          reset: function () {
            this.array = [];
            this.stop();
          }
        };
      }
    },
    status: '',//updating, loading, loaded, out, logged, search, picking, turn, unturn, over
    mode: '',//online, tutorial
    currentState: 'load', //log, menu, options, choose, table
    states: {
      preBuild: [ 'log', 'menu', 'options', 'choose', 'table' ],
      build: function () {
        this.el = $('<div>').addClass('states frame').appendTo(game.container).hide();
        game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
        $.each(game.states.preBuild, function () {
          game.states[this].el = $('<div>').addClass('state ' + this).appendTo(game.states.el).hide();
          if (game.states[this].build) {
            game.states[this].build();
            game.states[this].builded = true;
            game.load.loading += 1;
          }
        });
      },
      changeTo: function (state, keepElements) {
        if (state !== game.currentState) {
          var newstate,
            pre = game.currentState,
            oldstate = game.states[pre];
          if (oldstate && oldstate.el && !keepElements) { oldstate.el.fadeOut(200); }
          if (oldstate && oldstate.end) { oldstate.end(); }
          newstate = this[state];
          if (newstate.el && !keepElements) {
            newstate.el.append(game.topbar).delay(200).fadeIn(200);
          }
          game.currentState = state;
          game.backState = pre;
          if (newstate.start) { newstate.start(); }
        }
      },
      backState: function () {
        game.states.changeTo(game.backState);
      },
      //states
      log: {
        remembername: true,
        build: function () {
          this.title = $('<h1>').appendTo(this.el).text(game.ui.choosename);
          this.input = $('<input>').appendTo(this.el).attr({
            placeholder: game.ui.logtype,
            type: 'text',
            maxlength: 24
          }).keydown(function (e) {
            if (e.which === 13) { game.states.log.login(); }
          });
          this.button = $('<div>').addClass('button').appendTo(this.el).text(game.ui.log).attr({
            title: game.ui.choosename
          }).click(this.login);
          this.rememberlabel = $('<label>').appendTo(this.el).append($('<span>').text(game.ui.remember));
          this.remembercheck = $('<input>').attr({
            type: 'checkbox',
            name: 'remember',
            checked: true
          }).change(this.remember).appendTo(this.rememberlabel);
          var rememberedname = $.cookie('name');
          if (rememberedname) { this.input.val(rememberedname); }
        },
        start: function () {
          this.el.children().appendTo('.welcome .box');
          $('.loadtext').hide();
          $('.logo').removeClass('slide');
          game.topbar.appendTo('.welcome');
          game.loader.removeClass('loading');
          game.message.html('Version <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard/commits/gh-pages"><small class="version">alpha ' + game.version + '</small></a>');
          this.input.focus();
          game.states.options.opt.hide();
          $('.forklink').show();
        },
        login: function () {
          var name = game.states.log.input.val();
          if (name) {
            game.player.name = name;
            if (game.states.log.remembername) {
              $.cookie('name', name);
            } else {
              $.removeCookie('name');
            }
            game.states.log.button.attr('disabled', true);
            game.loader.addClass('loading');
            game.db({ 'get': 'server' }, function (server) {
              if (server.status === 'online') {
                game.status = 'logged';
                game.states.changeTo('menu');
              } else { game.load.reset(); }
            });
          } else {
            game.states.log.input.focus();
          }
        },
        end: function () {
          this.button.attr('disabled', false);
          $('.welcome.frame').hide();
          $('.states.frame').show();
        },
        remember: function () {
          game.states.log.remembername = !game.states.log.remembername;
          if (!game.states.log.remembername) { $.removeCookie('name'); }
        }
      },
      menu: {
        build: function () {
          this.menu = $('<div>').appendTo(this.el).addClass('box');
          this.title = $('<h1>').appendTo(this.menu).text(game.ui.menu);
          this.tutorial = $('<div>').addClass('button').appendTo(this.menu).attr({
            title: game.ui.tutorial
          }).text(game.ui.tutorial).click(function () {
            game.tutorial.build();
            game.status = 'picking';
            game.states.changeTo('choose');
          });
          this.campain = $('<div>').addClass('button').appendTo(this.menu).attr({
            title: game.ui.choosecampain,
            disabled: true
          }).text(game.ui.campain);
          this.online = $('<div>').addClass('button').appendTo(this.menu).attr({
            title: game.ui.chooseonline
          }).text(game.ui.online).click(function () {
            game.match.online();
            game.status = 'search';
            game.states.changeTo('choose');
          });
          this.friend = $('<div>').addClass('button').appendTo(this.menu).attr({
            title: game.ui.choosefriend,
            disabled: true
          }).text(game.ui.friend);
          this.options = $('<div>').addClass('button').appendTo(this.menu).attr({
            title: game.ui.chooseoptions
          }).text(game.ui.options).click(function () {
            game.states.changeTo('options');
          });
          this.credits = $('<a>').addClass('button').appendTo(this.menu).attr({
            title: game.ui.choosecredits,
            href: 'https://github.com/rafaelcastrocouto/dotacard/graphs/contributors',
            target: '_blank'
          }).text(game.ui.credits);
        },
        start: function () {
          game.states.options.opt.hide();
          $('.forklink').show();
          game.loader.removeClass('loading');
          game.triesCounter.text('');
          game.message.html(game.ui.welcome + ' <b>' + game.player.name + '</b>!');
          $('<small>').addClass('logout').appendTo(game.message).text(game.ui.logout).click(function () {
            game.states.changeTo('log');
          });
          if (!game.chat.builded) { game.chat.build(); }
          game.chat.el.appendTo(this.el);
        }
      },
      options: {
        build: function () {
          this.menu = $('<div>').appendTo(this.el).addClass('box');
          this.title = $('<h1>').appendTo(this.menu).text(game.ui.options);
          this.resolution = $('<div>').appendTo(this.menu).addClass('screenresolution').attr({
            title: game.ui.screenres
          });
          $('<h2>').appendTo(this.resolution).text(game.ui.screenres);
          this.high = $('<label>').appendTo(this.resolution).append($('<input>').attr({
            type: 'radio',
            name: 'resolution',
            value: 'high'
          }).change(this.changeResolution)).append($('<span>').text(game.ui.high + ' 1920x1080'));
          $('<label>').appendTo(this.resolution).append($('<input>').attr({
            type: 'radio',
            name: 'resolution',
            value: 'medium'
          }).change(this.changeResolution)).append($('<span>').text(game.ui.medium + ' 1366x768'));
          $('<label>').appendTo(this.resolution).append($('<input>').attr({
            type: 'radio',
            name: 'resolution',
            checked: true,
            value: 'default'
          }).change(this.changeResolution)).append($('<span>').text(game.ui['default'] + ' 1024x768'));
          this.low = $('<label>').appendTo(this.resolution).append($('<input>').attr({
            type: 'radio',
            name: 'resolution',
            value: 'low'
          }).change(this.changeResolution)).append($('<span>').text(game.ui.low + ' 800x600'));
          var rememberedvol, vol,
            rememberedres = $.cookie('resolution');
          if (rememberedres && this[rememberedres]) { this[rememberedres].click(); }
          this.audio = $('<div>').appendTo(this.menu).addClass('audioconfig').attr({
            title: game.ui.audioconfig
          });
          $('<h2>').appendTo(this.audio).text(game.ui.audioconfig);
          this.muteinput = $('<input>').attr({
            type: 'checkbox',
            name: 'mute'
          }).change(this.mute);
          $('<label>').appendTo(this.audio).append(this.muteinput).append($('<span>').text(game.ui.mute));
          //main volume
          this.volumecontrol = $('<div>').addClass('volumecontrol');
          this.volumeinput = $('<div>').addClass('volume').data('volume', 'volume').on('mousedown.volume', this.volumedown).append(this.volumecontrol);
          $('<label>').appendTo(this.audio).append($('<span>').text(game.ui.volume)).append(this.volumeinput);
          //music volume
          this.musiccontrol = $('<div>').addClass('volumecontrol');
          this.musicinput = $('<div>').addClass('volume').data('volume', 'music').on('mousedown.volume', this.volumedown).append(this.musiccontrol);
          $('<label>').appendTo(this.audio).append($('<span>').text(game.ui.music)).append(this.musicinput);
          //sounds volume
          this.soundscontrol = $('<div>').addClass('volumecontrol');
          this.soundsinput = $('<div>').addClass('volume').data('volume', 'sounds').on('mousedown.volume', this.volumedown).append(this.soundscontrol);
          $('<label>').appendTo(this.audio).append($('<span>').text(game.ui.sounds)).append(this.soundsinput);
          $(document).on('mouseup.volume', game.states.options.volumeup);
          rememberedvol = $.cookie('volume');
          if (rememberedvol) {
            vol = parseFloat(rememberedvol);
            if (vol === 0) { this.muteinput.prop('checked', true); }
            game.mute.gain.value = vol;
            game.states.options.volumecontrol.css('transform', 'scale(' + rememberedvol + ')');
          }
          this.back = $('<div>').addClass('button').text(game.ui.back).appendTo(this.menu).attr({
            title: game.ui.back
          }).click(game.states.backState);
          this.opt = $('<span>').addClass('opt').text('Options').hide().on('click.opt', function () {
            game.states.changeTo('options');
          }).appendTo(game.topbar);
        },
        start: function () {
          $('.forklink').show();
          game.states.options.opt.hide();
          game.chat.el.appendTo(this.el);
        },
        mute: function () {
          var vol = game.unmutedvolume || game.mute.gain.value || 0.6;
          if (this.checked) { vol = 0; }
          $.cookie('volume', vol);
          game.mute.gain.value = vol;
          game.states.options.volumecontrol.css('transform', 'scale(' + vol + ')');
        },
        volumedown: function (event) {
          var target = $(event.target).data('volume');
          if (!target) { target = $(event.target).parent().data('volume'); }
          game.audio.volumetarget = target;
          game.states.options.volumechange(event);
          game.states.options[target + 'input'].on('mousemove.volume', game.states.options.volumechange);
        },
        volumeup: function () {
          if (game.audio.volumetarget) {
            game.states.options[game.audio.volumetarget + 'input'].off('mousemove.volume');
            game.audio.volumetarget = false;
          }
        },
        volumechange: function (event) {
          var volume = parseInt((event.clientX - game.states.options.volumecontrol.offset().left) / 4.8, 10) / 10;
          if (volume > 1) { volume = 1; }
          if (volume <= 0) {
            volume = 0;
            if (game.audio.volumetarget === 'volume') {
              game.states.options.muteinput.prop('checked', true);
            }
          } else if (game.audio.volumetarget === 'volume') {
            game.states.options.muteinput.prop('checked', false);
          }
          console.log(game.audio.volumetarget, game.states.options[game.audio.volumetarget + 'control']);
          game.states.options[game.audio.volumetarget + 'control'].css('transform', 'scale(' + volume + ')');
          if (game.audio.volumetarget === 'volume') {
            game.mute.gain.value = volume;
            $.cookie('volume', volume);
            game.unmutedvolume = volume;
          } else if (game.audio.volumetarget === 'music') {
            game.audio.track.gain.value = volume;
          } else if (game.audio.volumetarget === 'sounds') {
            game.audio.sounds.gain.value = volume;
          }
        },
        changeResolution: function () {
          var resolution = $('input[name=resolution]:checked', '.screenresolution').val();
          game.states.el.removeClass('low high medium default').addClass(resolution);
          $.cookie('resolution', resolution);
        }
      },
      choose: {
        build: function () {
          this.pickbox = $('<div>').appendTo(this.el).addClass('pickbox').attr('title', game.ui.chooseheroes);
          this.pickedbox = $('<div>').appendTo(this.el).addClass('pickedbox').hide().on('contextmenu', game.nomenu);
          var slot;
          for (slot = 0; slot < 5; slot += 1) {
            $('<div>').appendTo(this.pickedbox).attr({ title: game.ui.rightpick }).data('slot', slot).addClass('slot available').on('contextmenu.pick', game.states.choose.pick);
          }
          this.prepickbox = $('<div>').appendTo(this.el).addClass('prepickbox').html(game.ui.customdecks).hide();
          this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').hide();
          this.pickDeck = game.deck.build({
            name: 'heroes',
            cb: function (pickDeck) {
              pickDeck.addClass('pickdeck').appendTo(game.states.choose.pickbox);
              game.states.choose.size = 100;
              $.each(pickDeck.data('cards'), function (id, card) {
                if (card.data('disable')) {
                  card.addClass('dead');
                }
                card.on('click.select', game.states.choose.select);
                $.each(game.skills[card.data('hero')], function () {
                  if (this.display) { card.addBuff(card, this); }
                });
              });
              pickDeck.width(100 + $('.card').width() * pickDeck.children().length);
            }
          });
        },
        start: function () {
          game.loader.addClass('loading');
          game.states.options.opt.show();
          if (game.mode === 'tutorial') { this.pickedbox.show(); }
          game.chat.el.appendTo(this.el);
          $('.forklink').hide();
          if ($('.choose .card.selected').length === 0) { this.pickDeck.children().first().click(); }
        },
        select: function () {
          var card = $(this);
          $('.choose .card.selected').removeClass('selected');
          card.addClass('selected');
          game.states.choose.pickDeck.css('margin-left', card.index() * card.width() / 2 * -1);
        },
        enablePick: function () {
          this.pickedbox.show();
          game.player.picks = [];
          if (game.mode !== 'tutorial') { this.prepickbox.show(); }
        },
        disablePick: function () {
          $('.slot').off('contextmenu.pick', game.states.choose.pick);
        },
        pick: function () {
          var card,
            slot = $(this).closest('.slot'),
            pick = $('.pickbox .card.selected');
          if (!pick.data('disable')) {
            game.audio.play('activate');
            if (slot.hasClass('available')) {
              slot.removeClass('available');
              if (pick.prev().length) {
                card = pick.prev();
              } else { card = pick.next(); }
            } else {
              card = slot.children('.card');
              card.on('click.select', game.states.choose.select).insertBefore(pick);
            }
            card.addClass('selected');
            game.states.choose.pickDeck.css('margin-left', card.index() * card.width() / 2 * -1);
            pick.removeClass('selected').appendTo(slot).off('click.select');
            game.player.picks[slot.data('slot')] = pick.data('hero');
            game.player.manaBuild();
            if (game.mode === 'tutorial') {
              game.tutorial.pick();
            } else { game.match.pick(); }
          }
          return false;
        },
        reset: function () {
          $('.pickedbox .card').appendTo(this.pickDeck).on('click.select', game.states.choose.select);
          $('.slot').addClass('available');
          game.states.choose.counter.hide();
        },
        end: function () {
          this.pickedbox.hide();
          this.prepickbox.hide();
        }
      },
      table: {
        build: function () {
          this.time = $('<p>').appendTo(game.topbar).addClass('time').text(game.ui.time + ': 0:00 Day').hide();
          this.turns = $('<p>').appendTo(game.topbar).addClass('turns').text(game.ui.turns + ': 0/0 (0)').hide();
          game.map.start();
          this.selectedArea = $('<div>').appendTo(this.el).addClass('selectedarea').append($('<div>').addClass('cardback'));
          this.neutrals = $('<div>').appendTo(this.el).addClass('neutraldecks');
          this.player = $('<div>').appendTo(this.el).addClass('playerdecks');
          this.enemy = $('<div>').appendTo(this.el).addClass('enemydecks');
        },
        start: function () {
          if (game.mode === 'tutorial' && !game.tutorial.started) {
            game.tutorial.start();
          } else if (game.mode === 'online' && !game.match.started) {
            game.match.start();
          }
          $('.forklink').hide();
          game.chat.el.appendTo(this.el);
          this.time.show();
          this.turns.show();
          this.camera.show();
          this.selectedArea.show();
          game.states.options.opt.show();
        },
        buildUnits: function () {
          var j = 'A1';
          $('#' + j).addClass('jungle').attr({title: 'Jungle'});
          $('#' + game.map.mirrorPosition(j)).addClass('jungle').attr({title: 'Jungle'});
          game.neutrals = {};
          game.neutrals.unitsDeck = game.deck.build({
            name: 'units',
            filter: ['forest'],
            cb: function (deck) {
              deck.addClass('neutral units cemitery').hide().appendTo(game.states.table.neutrals);
              $.each(deck.data('cards'), function (i, card) {
                card.addClass('neutral unit').data('side', 'neutral').on('click.select', game.card.select);
              });
            }
          });
          game.player.unitsDeck = game.deck.build({
            name: 'units',
            filter: game.player.picks,
            cb: function (deck) {
              deck.addClass('player units cemitery').hide().appendTo(game.states.table.player);
              $.each(deck.data('cards'), function (i, card) {
                card.addClass('player unit').data('side', 'player').on('click.select', game.card.select);
              });
            }
          });
          game.enemy.unitsDeck = game.deck.build({
            name: 'units',
            filter: game.enemy.picks,
            cb: function (deck) {
              deck.addClass('enemy units cemitery').hide().appendTo(game.states.table.enemy);
              $.each(deck.data('cards'), function (i, card) {
                card.addClass('enemy unit').data('side', 'enemy').on('click.select', game.card.select);
              });
            }
          });
        },
        animateCast: function (skill, target) {
          //todo: remove 'top/left', use only 'transform' to improve performance
          if (typeof target === 'string') { target = $('#' + target); }
          var t = skill.offset(), d = target.offset();
          skill.css({
            top: d.top - t.top + 30,
            left: d.left - t.left + 20,
            transform: 'translate(-50%, -50%) scale(0.3)'
          });
          setTimeout(function () {
            $(this.skill).css({
              top: '',
              left: '',
              transform: ''
            });
          }.bind({ skill: skill }), 500);
        },
        showResults: function () {
          game.states.table.selectedArea.hide();
          game.states.table.camera.hide();
          $('.table .deck').hide();
          game.states.table.resultsbox = $('<div>').appendTo(game.states.table.el).addClass('resultsbox box');
          $('<h1>').appendTo(this.resultsbox).addClass('result').text(game.winner + ' ' + game.ui.victory);
          $('<h1>').appendTo(this.resultsbox).text(game.ui.towers + ' HP: ' + game.player.tower.data('current hp') + ' / ' + game.enemy.tower.data('current hp'));
          $('<h1>').appendTo(this.resultsbox).text(game.ui.heroes + ' ' + game.ui.kd + ': ' + game.player.kills + ' / ' + game.enemy.kills);
          game.states.table.playerResults = $('<div>').appendTo(game.states.table.resultsbox).addClass('results');
          game.states.table.enemyResults = $('<div>').appendTo(game.states.table.resultsbox).addClass('results');
          $('.player.heroes.card').not('.zoom').each(function () {
            var hero = $(this), heroid = $(this).data('hero'),
              img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
              text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
            $('<p>').appendTo(game.states.table.playerResults).addClass(heroid).append(img, text);
          });
          $('.enemy.heroes.card').not('.zoom').each(function () {
            var hero = $(this), heroid = $(this).data('hero'),
              img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
              text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
            $('<p>').appendTo(game.states.table.enemyResults).addClass(heroid).append(img, text);
          });
          $('<div>').addClass('button').appendTo(game.states.table.resultsbox).text(game.ui.close).click(function () {
            game.states.table.clear();
            if (game.mode === 'tutorial') { game.tutorial.clear(); }
            game.states.changeTo('menu');
          });
        },
        clear: function () {
          $('.table .card').remove();
          $('.table .deck').remove();
          game.states.table.time.hide();
          game.states.table.turns.hide();
          game.states.table.resultsbox.remove();
          game.match.end();
        },
        end: function () {
          this.time.hide();
          this.turns.hide();
        }
      }
    },
    test: function () {
      game.states.log.input.val('TestBot');
      setTimeout(function () { game.states.log.button.click(); });
      setTimeout(function () { game.states.menu.tutorial.click(); }, 1000);
      setTimeout(function () { $('.pickedbox div:nth-child(1)').contextmenu(); }, 2000);
      setTimeout(function () { $('.pickedbox div:nth-child(2)').contextmenu(); }, 2100);
      setTimeout(function () { $('.pickedbox div:nth-child(3)').contextmenu(); }, 2200);
      setTimeout(function () { $('.pickedbox div:nth-child(4)').contextmenu(); }, 2300);
      setTimeout(function () { $('.pickedbox div:nth-child(5)').contextmenu(); }, 2400);
      setTimeout(function () { game.tutorial.axe.css({opacity: 0}); }, 2500);
      setTimeout(function () { game.match.buildSkills('single'); }, 3000);
      setTimeout(function () { $('.pud-hook.skills').appendTo('.player.hand'); }, 4000);
      setTimeout(function () { $('.map .hero.pud.player').place('H5'); game.status = 'turn';  }, 5000);
    }
  };
}());

$(game.start);
