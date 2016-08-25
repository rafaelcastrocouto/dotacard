/*
move behaviors
  siege - gotower else action (bear)
  attack - action else gotower (durable)
  push - gotowerlimit else action (push order)
  smart - action else if not in range gotowerlimit (support)
  attackmove - action else goTo (action order)
  move - goTo else action (move order)
  stand - action (if under N buff)
  alert - action else if-in-range goback (if in tower limit)
  defensive - if-in-range goback else action
  retreat - goback else action (retreat order)
  heal - gofountain else goback (if below N Hp)

action behaviors
  attack - attack else cast (ld or pud)
  cast - cast else attack (cm or nyx)
*/
game.ai = {
  chooseStrat: function () {
    /*
    onturnstart 
    each player hero {
      activate passives
      move data
          can be killed
          can attack tower
          can kill
          each enemy hero {
            detect in attack range
            detect in possible skill range
          }
      action data
          kills-per-attack/cast
          damage-per-attack/cast
          heal-per-cast
          buffs-per-cast
    }
    */
  },
  globalStrat: function () {
    /*
    onturnstart with action data
    detect and order combos
    if no combo target target the lowest hp
    */
  },
  end: function () {
    /*
    activate instants if attack
    detect possible iddles
    discard if duplicate or if not combo after N rounds at hand
    create final array and send it to enemy.move
    */
  },
  heroes: {
    am: {
      move: {
        default: 'smart'
      },
      action: {
        default: 'attack'
      },
      strats: function () {
        /*
        save 1 blink for escape
        if 2 blinks use 1 to attack the tower
        only use ult if opponent is missing at least N cards or after N turns
        // blink > ult only if Hp is low
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
      strats: function () {
        /*
        only use slow if N opponents or after N turns
        combo freeze
        only use ult if N opponents or after N turns
        */
        // combo > ult > slow
      }
    }
  }
};

