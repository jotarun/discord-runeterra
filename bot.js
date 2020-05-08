const Discord = require('discord.js');
const parser = require("discord-command-parser");
const DeckDecoder = require('./deck.js')
const prefix = "!";

const client = new Discord.Client();



const deckEmbed = new Discord.MessageEmbed()
    .setTitle('在瀏覽器檢視牌組')
    .setColor('#321');
const regionEmoji = {};


client.on('ready', () => {
    regionEmoji[0] = client.emojis.cache.find(emoji => emoji.name === 'demacia');
    regionEmoji[1] = client.emojis.cache.find(emoji => emoji.name === 'freljord');
    regionEmoji[2] = client.emojis.cache.find(emoji => emoji.name === 'ionia');
    regionEmoji[3] = client.emojis.cache.find(emoji => emoji.name === 'noxus');
    regionEmoji[4] = client.emojis.cache.find(emoji => emoji.name === 'shadowisles');
    regionEmoji[5] = client.emojis.cache.find(emoji => emoji.name === 'bilgewater');

});


client.on('message', message => {
    const parsed = parser.parse(message, prefix);
    if (!parsed.success) return;

    if (parsed.command === "牌組") {
        deckDecoder = new DeckDecoder();
        result = deckDecoder.decode(parsed.arguments[0]);

        deckEmbed.setURL('https://jotarun.github.io/runeterradeckviewer/?code=' + parsed.arguments[0]);

        result.heroes.forEach(card => {
            deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 英雄`, `${card.name} x ${card.count}`, false);
        });
        result.minions.forEach(card => {
            deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 單位`, `${card.name} x ${card.count}`, false);
        });
        result.spells.forEach(card => {
            deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 法術`, `${card.name} x ${card.count}`, false);
        });
        message.channel.send(deckEmbed);

    }
});



// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
