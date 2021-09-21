import { Channel, ChannelResolvable, Client, Intents } from 'discord.js';
import { createCommand, isCommandExists } from './commands/CommandFactory';

let client: Client;

const createClient = () => {
    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_VOICE_STATES,
        ],
    });

    client.on('ready', () => {
        console.log(`Let's fucking goooo!`);
    });

    client.on('messageCreate', message => {
        if (message.content[0] !== '!') {
            return;
        }
        const args = message.content.substring(1).split(' ');
        const command = args[0];

        if (!isCommandExists(command)) {
            return;
        }

        createCommand(args, message).execute();
    });
};

export const getClient = () => {
    if (!client) {
        createClient();
    }

    return client;
};

export const getChannel = (channelId: string): Channel | null =>
    client.channels.resolve(channelId);
