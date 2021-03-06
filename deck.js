const { DeckEncoder } = require('runeterra');
const fetch = require("node-fetch"); 

const core = require('./core/zh_tw/data/globals-zh_tw.json');


class DeckUtil {

  constructor() {
   
    this.loadCards();
  }

  async loadCards(){

    try{
    this.cardSets = [];
    this.cardSets[1] = await this.updateDB('http://dd.b.pvp.net/latest/set1/zh_tw/data/set1-zh_tw.json');
    this.cardSets[2] = await this.updateDB('http://dd.b.pvp.net/latest/set2/zh_tw/data/set2-zh_tw.json');
    this.cardSets[3] = await this.updateDB('http://dd.b.pvp.net/latest/set3/zh_tw/data/set3-zh_tw.json');
    this.cardSets[4] = await this.updateDB('http://dd.b.pvp.net/latest/set4/zh_tw/data/set4-zh_tw.json');
  }
  catch(error){
    console.log(error);
  }
  }
  async updateDB(url){
    
    const response = await fetch(url);
    let data = await response.json();
    console.log(data.length +' cards are loaded from' + url );
    return data;

  }
  searchTerms(termname) {
    let terms = [];
    terms = terms.concat(core.vocabTerms.filter(term => term.name.includes(termname)));
    terms = terms.concat(core.keywords.filter(term => term.name.includes(termname)));

    return terms;
  }

  searchbynumber(cost,attack,health)
  {
    let cards = [];
    for (let set = 1; set <= Object.keys(this.cardSets).length; set++) {
     
      let result = this.cardSets[set].filter(card => 
        card.cost==cost && card.attack==attack && card.health==health
        );
      
      cards = cards.concat(result);
    }
    this.sortcard(cards);
    return cards;
  }
  searchcard(key,value) {
    let cards = [];
    for (let set = 1; set <= Object.keys(this.cardSets).length; set++) {
     
      let result = this.cardSets[set].filter(card => card[key].includes(value));
      
      cards = cards.concat(result);
    }
    this.sortcard(cards);
    return cards;
  }

  searchv2(cardname) {
    let cards = [];
    for (let set = 1; set <= Object.keys(this.cardSets).length; set++) {
      let result = this.cardSets[set].filter(card => card.name.includes(cardname));
      cards = cards.concat(result);
    }
    this.sortcard(cards);
    return cards;
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
    for (let set = 1; set <= Object.keys(this.cardSets).length; set++) {
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
    let landmarks ={};
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
    landmarks = deck.filter(card => card.type == "地標");
    minions = deck.filter(card => card.type == "單位" && card.supertype == "");
    spells = deck.filter(card => card.type == "法術");
    this.sortdeck(heroes);
    this.sortdeck(landmarks);
    this.sortdeck(minions);
    this.sortdeck(spells);
    return { heroes, landmarks, minions, spells };
  }

  sortdeck(array) {
    return array.sort(function (a, b) {
      var x = a.cost;
      var y = b.cost;
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  sortcard(array) {
    return array.sort(function (a, b) {
      var x = a.cardCode;
      var y = b.cardCode;
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }
};
module.exports = DeckUtil;