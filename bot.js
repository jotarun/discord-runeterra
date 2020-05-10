const Discord = require('discord.js');
const parser = require("discord-command-parser");
const DeckUtil = require('./deck.js')
const prefix = "!";

const client = new Discord.Client();
const regionEmoji = [];


client.on('ready', () => {
    regionEmoji[0] = client.emojis.cache.find(emoji => emoji.name === 'demacia');
    regionEmoji[1] = client.emojis.cache.find(emoji => emoji.name === 'freljord');
    regionEmoji[2] = client.emojis.cache.find(emoji => emoji.name === 'ionia');
    regionEmoji[3] = client.emojis.cache.find(emoji => emoji.name === 'noxus');
    regionEmoji[4] = client.emojis.cache.find(emoji => emoji.name === 'piltoverzaun');
    regionEmoji[5] = client.emojis.cache.find(emoji => emoji.name === 'shadowisles');
    regionEmoji[6] = client.emojis.cache.find(emoji => emoji.name === 'bilgewater');
    const deckUtil = new DeckUtil();

});


client.on('message', message => {
    const deckUtil = new DeckUtil();
    const parsed = parser.parse(message, prefix);
    if (!parsed.success) return;

    if (parsed.command == "用法") {
        const cardEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('機器人指令一覽')
        .addField('!問 關鍵字 可只輸入部分名稱','例如: !問 隱密')
        .addField('!查詢 卡片名稱 可只輸入部分名稱','例如: !查詢 逆命')
        .addField('!牌組 牌組代碼','例如: !牌組 CEBQEAQDAMCAIAIECETTINQGAEBQEDAUDYSSQAIBAEBQ6AQBAECACAIBAMXQ')
        message.channel.send(cardEmbed);
    }

    else if (parsed.command === "問") {
        termname = parsed.arguments[0];
        terms = deckUtil.searchTerms(termname);
        if (terms.length == 0) {
            return message.reply("尚無此關鍵字");
        }
        terms.forEach(term => {
            message.channel.send(`**${term.name}(${term.nameRef}): **${term.description}`);
        });
    }
    else if (parsed.command === "查詢") {


        cards = deckUtil.searchv2(cardname);
        if (cards.length == 0) {
            return message.reply("找不到這張卡喔");
        }
        else if (cards.length > 5){
            let resultstring = ""
            resultstring += `符合結果的卡片太多，共有${cards.length}張:\n`;
            cards.forEach(card => {
                resultstring += `[${card.name}]`;
            });
            resultstring += `\n請更精確的輸入查詢卡片名稱\n`;

            message.channel.send(resultstring);
        }
        else {
            cards.forEach(card => {
                const cardEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(card.name)
                .setDescription(card.flavorText)
                .setThumbnail(card.assets[0].gameAbsolutePath);
            message.channel.send(cardEmbed);
            });
        
        }

    }
    else if (parsed.command === "牌組") {
        code = parsed.arguments[0]
        let result = deckUtil.decode(code);
        if (Object.keys(result).length === 0) {
            return message.reply("代碼有錯喔");

        }

        let total = result.heroes.length + result.minions.length + result.spells.length;
        const deckEmbed = new Discord.MessageEmbed()
            .setTitle('在瀏覽器檢視牌組')
            .setColor('#987');
        deckEmbed.setURL('https://jotarun.github.io/runeterradeckviewer/?code=' + code);
        if (total >= 25) {
            regionscount = Array(regionEmoji.length).fill(0);
            summary = ""

            herostring = ""
            result.heroes.forEach(card => {
                herostring += `${card.name} x ${card.count}\n`;
                regionscount[card.faction.id] += 1;
            });
            minionsstring = ""
            result.minions.forEach(card => {
                minionsstring += `${card.name} x ${card.count}\n`;
                regionscount[card.faction.id] += 1;
            });
            spellsstring = ""
            result.spells.forEach(card => {
                spellsstring += `${card.name} x ${card.count}\n`;
                regionscount[card.faction.id] += 1;
            });
            if (result.heroes.length > 0)
                deckEmbed.addField(`英雄`, herostring, true);
            if (result.minions.length > 0)
                deckEmbed.addField(`單位`, minionsstring, true);
            if (result.spells.length > 0)
                deckEmbed.addField(`法術`, spellsstring, true);
            regionscount.forEach(function (v, i) {
                if (v > 0)
                    summary += `${regionEmoji[i]}:${v}`;
            });
            deckEmbed.setDescription(summary);
        }

        else {
            result.heroes.forEach(card => {
                deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 英雄`, `${card.name} x ${card.count}`, true);
            });
            result.minions.forEach(card => {
                deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 單位`, `${card.name} x ${card.count}`, true);
            });
            result.spells.forEach(card => {
                deckEmbed.addField(`${regionEmoji[card.faction.id]} ${card.cost} 費 法術`, `${card.name} x ${card.count}`, true);
            });

            if (total % 3 == 2) {
                deckEmbed.addField('\u200B', '\u200B', true);
            }
        }

        message.channel.send(deckEmbed);

    }
});



// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
