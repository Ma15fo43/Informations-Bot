import * as Discord from "discord.js";

// Music command

/**
 * Asnwers with the actual guild music information.
 * @param {Discord.Client} Client the client
 * @param {Discord.Message} Message the message that contains the command name
 * @param {string[]} args the command args
 * @param {any} options some options
 */
export async function run(client: Discord.Client, message: Discord.Message, args: string[], ops: any) {
    const queue: any = ops.queue.get(message.guild.id);

    if (queue && queue.playing) {
        queue.playing = false;
        queue.connection.dispatcher.pause();
        return message.channel.send(`:pause_button: Paused current song **${queue.songs[0].title}**.`);
    }

    return message.channel.send("No song is currently playing.");
}

const info = {
    name: "leave",
    description: "Tell Mango to pause the song that is currently playing",
    category: "music",
    args: "none"
}

export { info };
