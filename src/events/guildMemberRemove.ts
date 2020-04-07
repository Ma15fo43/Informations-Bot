import * as Discord from "discord.js";
import * as fs from "fs";
import * as canvaslib from "canvas";

export default async (Client: Discord.Client, member: Discord.GuildMember) => {
	let savedWelcChan = fs.readFileSync("database/welcome/channels.json", "utf-8");
	savedWelcChan = JSON.parse(savedWelcChan);
	const channel: Discord.GuildChannel = savedWelcChan[member.guild.id] == undefined ? member.guild.channels.find((ch) => ch.name === "welcome") : member.guild.channels.get(savedWelcChan[member.guild.id]);

	if (!channel) {
		return;
	}

	const welcomeRichEmbed = new Discord.RichEmbed()
		.setTitle("A member just left the guild :outbox_tray:")
		.setDescription(`Goodbye ${member.user.username}. We hope you'll come back :confused:`)
		.setAuthor(member.user.username, member.user.avatarURL)
		.setFooter(Client.user.username, Client.user.avatarURL)
		.setColor("4F6A77")
	// @ts-ignore
	channel.send(welcomeRichEmbed);

	const canvas = canvaslib.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");

    const background = await canvaslib.loadImage("./leave_background.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = "35px Caviar Dreams"; // displays on the picture the member tag
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.fillText(`Goodbye \n${member.user.tag}`, canvas.width - 400, canvas.height / 2.3);

    ctx.font = "25px Caviar Dreams"; // displays on the picture the member tag
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.fillText(`Members: ${member.guild.members.size}`, canvas.width - 200, canvas.height / 1.30);

    ctx.beginPath(); // rounded profile pic
    ctx.arc(85, 85, 60, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await canvaslib.loadImage(member.user.displayAvatarURL);
    ctx.drawImage(avatar, 25, 25, 120, 120);

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');
	
	// @ts-ignore
	channel.send(attachment);
};

