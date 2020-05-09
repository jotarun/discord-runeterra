const { DeckEncoder } = require('runeterra');
const set1 = require('./cards/set1/zh_tw/data/set1-zh_tw.json');
const set2 = require('./cards/set2/zh_tw/data/set2-zh_tw.json');

class DeckUtil {

  constructor() {
    this.cardSets = {};
    this.cardSets[1] = set1;
    this.cardSets[2] = set2;
  }

  getlevelupcard(card) {
    let set = parseInt(card.cardCode.substring(0, 2));
    let name = card.name;
    let lvlupcard = {};
    let index = 0;
    card.associatedCardRefs.forEach(cardCode => {
      index = this.cardSets[set].findIndex(obj =>
        obj.cardCode == cardCode);
      if (this.cardSets[set][index].name == name) {
        console.log(name);
        lvlupcard = this.cardSets[set][index];
      }
    });
    return lvlupcard;
  }

  search(cardname) {
    let card = {};
    for (let set = 1; set <=2; set++) {
      let index = this.cardSets[set].findIndex(obj => obj.name == cardname);
      if (index >= 0) {
        card = this.cardSets[set][index];
      }
    }
    return card;
  }

  decode(deckcode) {

    let deck = {};
    let heroes = {};
    let minions = {};
    let spells = {};
    try {

      deck = DeckEncoder.decode(deckcode);
    }
    catch (err) {
      return {};
    }
    deck.forEach((o, i, a) => {
      let set = a[i].set;
      let index = this.cardSets[set].findIndex(obj => obj.cardCode == a[i].code);
      a[i].supertype = this.cardSets[set][index].supertype;
      a[i].type = this.cardSets[set][index].type;
      a[i].cost = this.cardSets[set][index].cost;
      a[i].name = this.cardSets[set][index].name;
      // a[i].assets = this.cardSets[set][index].assets;

    });
    heroes = deck.filter(card => card.supertype == "英雄");
    minions = deck.filter(card => card.type == "單位" && card.supertype == "");
    spells = deck.filter(card => card.type == "法術");
    this.sortdeck(heroes);
    this.sortdeck(minions);
    this.sortdeck(spells);
    return { heroes, minions, spells };
  }

  sortdeck(array) {
    return array.sort(function (a, b) {
      var x = a.cost;
      var y = b.cost;
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }
};
module.exports = DeckUtil;