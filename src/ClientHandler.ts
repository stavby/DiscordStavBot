import {
    Channel,
    ChannelResolvable,
    Client,
    Intents,
    MessageOptions,
    MessagePayload,
    TextBasedChannels,
} from 'discord.js';
import { createInteraction } from './buttonInteractions/ButtonInteractionFactory';
import { createCommand, isCommandExists } from './commands/CommandFactory';
import { CommandDoesntExistError } from './errors/CommandDoesntExistError';
import { InteractionDoesntExistError } from './errors/InteractionDoesntExistError';

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

        try {
            createCommand(
                message.content.substring(1).split(' '),
                message
            ).execute();
        } catch (error) {
            if (!(error instanceof CommandDoesntExistError)) {
                throw error;
            }
        }
    });

    client.on('interactionCreate', interaction => {
        if (interaction.isButton()) {
            try {
                createInteraction(interaction).execute();
            } catch (error) {
                if (!(error instanceof InteractionDoesntExistError)) {
                    throw error;
                }

                console.warn(error.message);
            }
        }
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

export const sendMessage = (
    channelId: string,
    message: string | MessagePayload | MessageOptions
) => {
    const channel = getChannel(channelId);
    if (!channel || !channel.isText()) {
        console.warn(
            `Tried to send message to non existing or voice channel! \nMessage: ${message} \nChannelId: ${channelId}`
        );
    }

    (channel as TextBasedChannels).send(message);
};
