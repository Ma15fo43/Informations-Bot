import * as Discord from "discord.js";
import * as RichEmbed from "../../utils/Embed";
import * as Logger from "../../utils/Logger";

// Fun command

/**
 * Creates a giveaway
 * @param {Discord.Client} Client the client
 * @param {Discord.Message} Message the message that contains the command name
 * @param {string[]} args the command args
 * @param {any} options some options
 */
export function run(Client: Discord.Client, message: Discord.Message, args: string[], ops: any) {
	const filter: Discord.CollectorFilter = (reaction, user) => ["🇦", "🇧", "🇨"].includes(reaction.emoji.name) && user.id === message.author.id;
	const messageAuthor = message.author.avatarURL;

	const giveawayEmbed: Discord.RichEmbed = new Discord.RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setDescription("What would you like to do? \n\n:regional_indicator_a: - Create a giveaway \n:regional_indicator_b: - Close a giveaway \n:regional_indicator_c: - End a giveaway")
		.setColor("#0089FF");
	message.channel.send(giveawayEmbed).then(async (msg: Discord.Message) => {

		await msg.react("🇦");
		await msg.react("🇧");
		await msg.react("🇨");

		msg.awaitReactions(filter, {
			max: 1,
			time: 30000,
		}).then((collected) => {
			const reaction = collected.first();
			switch (reaction.emoji.name) {
				case "🇦":
					createGiveaway();
					break;

				case "🇧":
					closeGiveaway();
					break;

				case "🇨":
					endGiveaway();
					break;
			}
		});

	});

	async function createGiveaway() {
		message.reply("Enter a name for the giveaway, and I'll create it for you.");

		const channel: Discord.TextChannel = message.channel as Discord.TextChannel;
		const filter: Discord.CollectorFilter = (message, user) => message.content && !message.author.bot && user.id === message.author.id;

		Logger.log(giveawayEmbed.author.icon_url);
		Logger.log(messageAuthor);

		let giveawayName: string;

		const nameCollector = await channel.awaitMessages(filter, { max: 1, maxMatches: 1, errors: ["time"] })
			.then((collected) => {
				if (giveawayEmbed.author.icon_url !== messageAuthor) return;
				giveawayName = `${collected.first()}`;
				message.reply(`Ok, I just created the **${giveawayName}** giveaway! Now, please enter the rewards :wink:`);
			});

		const rewardsCollector = await channel.awaitMessages(filter, { max: 1, maxMatches: 1, errors: ["time"] })
			.then((collected) => {
				const giveawayRewards = `${collected.last()}`;
				return message.reply(`Ok, here are the rewards of your giveaway: **${giveawayRewards}**! Finally, please select the duration of the giveaway:\`[number]m\`, \`[number]d\`, or \`1w\``);
			});

		const durationCollector = async () => {
			await channel.awaitMessages(filter, { max: 1, maxMatches: 1, errors: ["time"] })
				.then((collected) => {
					const collectedArray = collected.array()[0].content.split("");
					const array = ["m", "d", "w"];

					for (let n = 0; n < array.length; n++) {
						if (collectedArray[collectedArray.length - 1] !== array[n]) {

							if (n === collectedArray.length) {
								message.reply("Please only provide minutes, days or 1 week.");
								return durationCollector();
							}

						} else {
							const durationArray: string[] = collected.array()[0].content.split("m");
							const durationNumber: number = parseInt(durationArray[0], 10);
							const durationValue: string = collected.array()[0].content.split("").pop();
							let winner: Discord.GuildMember = message.guild.members.random();

							if (winner.user.bot) {
								while (winner.user.bot) {
									winner = message.guild.members.random();
								}
							}

							switch (durationValue) {
								case "m":
									setTimeout(() => {
										message.reply(`It's giveaway time! **${giveawayName}** giveaway has now finished, and here is the winner: ${winner.user.tag}`);
									}, (durationNumber * 60000));
									break;

								case "d":
									setTimeout(() => {
										message.reply(`It's giveaway time! **${giveawayName}** giveaway has now finished, and here is the winner: ${winner.user.tag}`);
									}, (durationNumber * 86400000));
									break;
							}

							message.reply("Thank you! Your giveaway has been created.");
							break;
						}
					}
				});
		};

		await durationCollector();

	}

	function closeGiveaway() {
		// TODO: faire la commande
	}

	function endGiveaway() {
		// TODO: faire la commande
	}

}
