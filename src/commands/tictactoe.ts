import * as Discord from "discord.js";

// Fun command

/**
 * Re-creating the tic-tac-toe game but it's in Discord
 * @param {Discord.Client} Client the client
 * @param {Discord.Message} Message the message that contains the command name
 * @param {string[]} args the command args
 * @param {any} options some options
 */
export async function run(Client: Discord.Client, message: Discord.Message, args: string[], ops: any) {
    let grid = {};
    let turn = "J1";
    let firstMessageID;
    let secondPlayer;

    waitForSecondPlayer();

    function waitForSecondPlayer() {
        const filter = (reaction, user) => {
            return user.id != message.author.id;
        };

        let msgid;

        message.channel.send("> Waiting for the 2nd player to approve... (click on the reaction to begin the game)").then(async msg => {
            msgid = msg.id;
            await msg.react("👍🏻");

            setTimeout(function () {
                msg.awaitReactions(filter, { max: 1 })
                    .then(collected => {
                        secondPlayer = collected.first().users.last();
                        message.channel.fetchMessage(msgid).then(msg => msg.edit(`2nd player is **${secondPlayer.tag}**. Init...`));
                        generateGrid();
                    }).catch(err => {
                        message.channel.fetchMessage(msgid).then(msg => msg.edit("Nobody has clicked the reaction for 30 seconds. Game cancelled."));
                    });
            }, 200);
        });
    }

    function generateGrid() {
        initGrid();
        let numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

        message.channel.send("> Status: init :eyes:").then(msg => firstMessageID = msg.id);

        message.channel.send("> I am currently generating the grid. Please wait a bit..").then(async msg => {
            for (let number of numbers) {
                await msg.react(number);
            }

            numbers = ["1️⃣", "2️⃣", "3️⃣", "\n4️⃣", "5️⃣", "6️⃣", "\n7️⃣", "8️⃣", "9️⃣"];

            msg.edit(numbers.join(" "));
            setTimeout(function () {
                createReactionCollector(msg);
            }, 300)
        });
    }

    function initGrid() { // init the grid with a JSON object
        for (let i = 0; i < 10; i++) {
            grid[i] = {};
            grid[i]["occupied"] = false;
            grid[i]["player"] = null;
        }

    }

    function createReactionCollector(msg: Discord.Message) {
        const filter: Discord.CollectorFilter = (reaction, user) => {
            return user.id === message.author.id || user.id === secondPlayer.id;
        }

        msg.awaitReactions(filter, { max: 1 })
            .then(collected => {
                if (secondPlayer == collected.first().users.last() && turn != "J2" || message.author == collected.first().users.last() && turn != "J1") {
                    collected.last().remove(collected.first().users.last().id);
                    return createReactionCollector(msg);
                }

                if (isCaseOccupied(emojiToLetter(collected.first().emoji.name))) {
                    const status = new Discord.RichEmbed()
                        .setAuthor(collected.first().users.last().tag, collected.first().users.last().avatarURL)
                        .setColor("#1E90FF")
                        .setDescription(`**${collected.first().users.last().tag}** tried to react with the ${collected.first().emoji.name} emoji, but this case is already occupied by a player...`);

                    msg.channel.fetchMessage(firstMessageID).then(msg => msg.edit(status));

                    collected.last().remove(collected.first().users.last().id);
                    return createReactionCollector(msg);
                }

                const status = new Discord.RichEmbed()
                    .setAuthor(collected.first().users.last().tag, collected.first().users.last().avatarURL)
                    .setColor("#1E90FF")
                    .setDescription(`**${collected.first().users.last().tag}** reacted with the ${collected.first().emoji.name} emoji.`);

                msg.channel.fetchMessage(firstMessageID).then(msg => msg.edit(status));

                editGrid(msg, collected.first().emoji.name);

                if (checkIfWin(turn)) {
                    const status = new Discord.RichEmbed()
                        .setAuthor(collected.first().users.last().tag, collected.first().users.last().avatarURL)
                        .setColor("#ffff00")
                        .setDescription(`**${collected.first().users.last().tag}** won the game. GG!`);

                    msg.channel.fetchMessage(firstMessageID).then(msg => msg.edit(status));
                    return;
                } else if (checkIfEgality()) {
                    const status = new Discord.RichEmbed()
                        .setAuthor(collected.first().users.last().tag, collected.first().users.last().avatarURL)
                        .setColor("#1E90FF")
                        .setDescription(`:crossed_swords: Nobody won... That's a draw!`);

                    msg.channel.fetchMessage(firstMessageID).then(msg => msg.edit(status));
                }

                detectPlayer(); // changes turn
                collected.last().remove(collected.first().users.last().id); // removes user reaction
                createReactionCollector(msg); // wait for reaction once the turn is finished
            }).catch(err => {
                createReactionCollector(msg);
            });
    }

    function isCaseOccupied(coords) {
        if (grid[coords].occupied) {
            return true;
        } else {
            return false;
        }
    }

    async function editGrid(msg: Discord.Message, emoji) {
        let getGrid = msg.content.split(" ");
        let gridToObject = Object.values(getGrid);
        let selectEmoji = turn == "J1" ? ":x:" : ":o:";
        let letterToNumber = parseInt(emojiToLetter(emoji));

        if (gridToObject[letterToNumber - 1].startsWith("\n")) {
            selectEmoji = `\n${selectEmoji}`;
        }

        gridToObject.splice((letterToNumber - 1), 1, selectEmoji);
        grid[parseInt(emojiToLetter(emoji))].occupied = true;
        grid[parseInt(emojiToLetter(emoji))].player = turn;
        await msg.edit(gridToObject.join(" "));
    }

    function detectPlayer() { // changing player, when last turn is finished
        if (turn == "J1") {
            return turn = "J2";
        } else {
            return turn = "J1";
        }
    }

    function checkIfWin(turn) {
        if (checkGridCases(1, 2, 3, turn)) return true;
        if (checkGridCases(3, 6, 9, turn)) return true;
        if (checkGridCases(9, 8, 7, turn)) return true;
        if (checkGridCases(7, 4, 1, turn)) return true;
        if (checkGridCases(2, 5, 8, turn)) return true;
        if (checkGridCases(7, 5, 3, turn)) return true;
        if (checkGridCases(1, 5, 9, turn)) return true;
        if (checkGridCases(4, 5, 6, turn)) return true;
    }

    function checkIfEgality() {
        if (grid[1].occupied == true && grid[2].occupied == true && grid[3].occupied == true && grid[4].occupied == true && grid[5].occupied == true && grid[6].occupied == true && grid[7].occupied == true && grid[8].occupied == true && grid[9].occupied == true) return true;
    }

    function checkGridCases(a, b, c, turn) {
        if (grid[a].player == turn && grid[b].player == turn && grid[c].player == turn) return true;
    }

    function emojiToLetter(emoji) { // transforms emoji (reaction) to text
        var unicodeChars = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
        var chars = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let index = unicodeChars.indexOf(emoji);
        return chars[index];
    }
}
