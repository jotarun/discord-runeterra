const { DeckEncoder } = require('runeterra');
const set1 = require('./cards/set1/zh_tw/data/set1-zh_tw.json');
const set2 = require('./cards/set2/zh_tw/data/set2-zh_tw.json');

class DeckDecoder {

  decode(deckcode) {
    let cardSets = {};
    cardSets[1] = set1;
    cardSets[2] = set2;
    let deck = {};
    let heroes = {};
    let minions = {};
    let spells = {};
    try {

    deck = DeckEncoder.decode(deckcode);
  }
  catch(err) {
    return{};
  }
    deck.forEach((o, i, a) => {
      let set = a[i].set;
      let index = cardSets[set].findIndex(obj => obj.cardCode == a[i].code);
      a[i].supertype = cardSets[set][index].supertype;
      a[i].type = cardSets[set][index].type;
      a[i].cost = cardSets[set][index].cost;
      a[i].name = cardSets[set][index].name;
      a[i].assets = cardSets[set][index].assets;

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
module.exports = DeckDecoder;