import * as Discord from "discord.js";
import * as Sequelize from "sequelize";

// Fun command

/**
 * Sells something to the black market (lmfao)
 * @param {Discord.Client} Client the client
 * @param {Discord.Message} Message the message that contains the command name
 * @param {string[]} args the command args
 * @param {any} options some options
 */
export async function run(Client: Discord.Client, message: Discord.Message, args: string[], ops: any) {
    const item: string = args.slice(1, args.length).join(" ");
    const price: string = args[0];

    const marketmodel: Sequelize.ModelCtor<Sequelize.Model<any, any>> = ops.sequelize.model("marketItems");

    const moneymodel: Sequelize.ModelCtor<Sequelize.Model<any, any>> = ops.sequelize.model("moneyAcc");
    const money = await moneymodel.findOne({ where: { idOfUser: message.author.id } });
    
    if (item == "" || price == undefined) {
        return message.reply("You can't sell an empty item! `sell [price] [item]`");
    } else if (isNaN(price as unknown as number) || price.startsWith("-")) {
        return message.reply(`**${price}** isn't a number. Please retry and remove every symbol of the price, eg: \`240$\` → \`240\``);
    } else if (item.includes("@")) {
        return message.reply("I can't add this item to the market because it contains a mention. Be sure to remove it.");
    } else if (!money) {
        return message.reply("It looks like you haven't created your account! Do `ma!money` first :wink:");
    } else if (item.length > 70) {
        return message.reply("Your item name is too long!");
    }
    
    const getMoney = money.get("money");

    if (getMoney < price) {
        return message.reply(`You can't sell this item at **${price}** because you only have **${money}**$.`);
    }

    const createdItem = await marketmodel.create({
        name: item,
        price: price,
        seller: message.author.tag,
        sellerID: message.author.id
    }).catch(e => {
        if (e.name == "SequelizeUniqueConstraintError") {
            return message.channel.send("This object already exists! Please choose another name.");
        }
    }); 

    // @ts-ignore
    message.reply(`The item \`${item}\` with price \`${price}\`$ was succesfully added to the market. ID of your item: **${createdItem.get("id")}** <:yes:835565213498736650>`);
}

const info = {
    name: "sell",
    description: "Sell something to the black market",
    category: "fun",
    args: "[price] [item]"
}

export { info };
