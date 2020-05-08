const Discord = require('discord.js');
const parser = require("discord-command-parser");
const DeckDecoder = require('./deck.js')
const prefix = "!";

const client = new Discord.Client();
const regionEmoji = {};


client.on('ready', () => {
    regionEmoji[0] = client.emojis.cache.find(emoji => emoji.name === 'demacia');
    regionEmoji[1] = client.emojis.cache.find(emoji => emoji.name === 'freljord');
    regionEmoji[2] = client.emojis.cache.find(emoji => emoji.name === 'ionia');
    regionEmoji[3] = client.emojis.cache.find(emoji => emoji.name === 'noxus');
    regionEmoji[4] = client.emojis.cache.find(emoji => emoji.name === 'piltoverzaun');
    regionEmoji[5] = client.emojis.cache.find(emoji => emoji.name === 'shadowisles');
    regionEmoji[6] = client.emojis.cache.find(emoji => emoji.name === 'bilgewater');

});


client.on('message', message => {
    const parsed = parser.parse(message, prefix);
    if (!parsed.success) return;

    if (parsed.command === "牌組") {
        const deckDecoder = new DeckDecoder();
        code = parsed.arguments[0]
        let result = deckDecoder.decode(code);
        if (Object.keys(result).length === 0)
        {
           return message.reply("代碼有錯喔");

        }
        const deckEmbed = new Discord.MessageEmbed()
        .setTitle('在瀏覽器檢視牌組')
        .setColor('#987');

        deckEmbed.setURL('https://jotarun.github.io/runeterradeckviewer/?code=' + code);
        
        result.heroes.forEach(card => {
            deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 英雄`, `${card.name} x ${card.count}`, true);
        });
        result.minions.forEach(card => {
            deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 單位`, `${card.name} x ${card.count}`, true);
        });
        result.spells.forEach(card => {
            deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 法術`, `${card.name} x ${card.count}`, true);
        });
        let total = result.heroes.length + result.minions.length + result.spells.length;
        if (total%3 ==2 )
        {
        deckEmbed.addField('\u200B','\u200B',true);
        }
        message.channel.send(deckEmbed);
       
    }
});



// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
