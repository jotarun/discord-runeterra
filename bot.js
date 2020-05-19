const Discord = require('discord.js');
const parser = require("discord-command-parser");
const DeckUtil = require('./deck.js')
const localcmd = require('./core/zh_tw/data/local.json');

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
    // const deckUtil = new DeckUtil();
    const guildNames = client.guilds.cache.map(g => g.name).join("\n");
    console.log(guildNames);

});


function outputcards(cards, message, title) {
    if (cards.length > 60) {
        return message.reply(`符合的卡片過多(${cards.length}張)`);
    }

    else if  (cards.length > 5) {
        let cols = Math.ceil(cards.length / 5) ;
        let resultstring = Array(cols).fill('');
        cards.forEach(function (card, i) {
            emoji = client.emojis.cache.find(emoji => emoji.name === card.regionRef.toLowerCase());
            resultstring[Math.floor(i / 5)] += (`${emoji}[${card.name}](${card.assets[0].gameAbsolutePath})\n`);
        });
        const cardEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(title)
            .setDescription(`符合結果的卡片共有${cards.length}張:`)
        try {
            resultstring.forEach(substring => {
                if (substring!="")
                    cardEmbed.addField('\u200b', substring, true);
            });
            message.channel.send(cardEmbed);
        }
        catch (e) {
            console.log(e);
        }
    }
    else {
        cards.forEach(card => {
            try {
                const cardEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(card.name)
                    .setDescription(card.flavorText)
                    .setThumbnail(card.assets[0].gameAbsolutePath);
                message.channel.send(cardEmbed);
            }
            catch (e) {
                console.log(e);
            }
        });
    }

}

client.on('message', message => {
    const deckUtil = new DeckUtil();
    const parsed = parser.parse(message, prefix);
    if (!parsed.success) return;

    if (parsed.command == "用法") {
        const cardEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('機器人指令一覽')
            .addField('!問 關鍵字 可只輸入部分名稱', '例如: !問 隱密')
            .addField('!查詢 卡片名稱 可只輸入部分名稱', '例如: !查詢 逆命')
            .addField('!查詢 關鍵字 名稱 可只輸入部分名稱', '例如: !查詢 關鍵字 泯滅')
            .addField('!查詢 種族 名稱 可只輸入部分名稱', '例如: !查詢 種族 海怪')
            .addField('!牌組 牌組代碼', '例如: !牌組 CEBQEAQDAMCAIAIECETTINQGAEBQEDAUDYSSQAIBAEBQ6AQBAECACAIBAMXQ')
        message.channel.send(cardEmbed);
    }

    else if (parsed.command === "問") {
        if (parsed.arguments[0] in localcmd.keyword)
        parsed.arguments[0] = localcmd.keyword[parsed.arguments[0]];

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
        if (parsed.arguments[0] == '種族') {
            let cards = deckUtil.searchcard('subtype', parsed.arguments[1]);
            if (cards.length == 0) {
                return message.reply("沒有這個種族的卡");
            }
            else {
                outputcards(cards, message, parsed.arguments[1]);
            }
            return;
        }

        if (parsed.arguments[0] == '關鍵字') {
          
            let cards = deckUtil.searchcard('keywords', parsed.arguments[1]);
            cards = cards.concat(deckUtil.searchcard('description', parsed.arguments[1]));

            if (cards.length == 0) {
                return message.reply("沒有這個關鍵字的卡");
            }
            else {
                outputcards(cards, message, parsed.arguments[1]);
            }

            return;
        }


        if (parsed.arguments[0] in localcmd.cardname)
            parsed.arguments[0] = localcmd.cardname[parsed.arguments[0]];

        cardname = parsed.arguments[0];
        cards = deckUtil.searchv2(cardname);
        if (cards.length == 0) {
            return message.reply("找不到這張卡喔");

        }
        else {
            outputcards(cards, message, parsed.arguments[0]);
        }

    }
    else if (parsed.command === "牌組") {
        if (parsed.arguments[0] in localcmd.deck)
            parsed.arguments[0] = localcmd.deck[parsed.arguments[0]];
        code = parsed.arguments[0]
        let result = deckUtil.decode(code);
        if (Object.keys(result).length === 0) {
            return message.reply("代碼有錯喔");

        }

        let total = result.heroes.length + result.minions.length + result.spells.length;
        const deckEmbed = new Discord.MessageEmbed()
            .setTitle('>>點此在瀏覽器開啟牌組檢視器<<')
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
