import { getVoiceConnections, joinVoiceChannel } from '@discordjs/voice';
import { Message } from 'discord.js';
import { getPlayerConfig, isPlayerExists } from './AudioHandler';

export const establishVoiceChannel = (message: Message): boolean => {
    const voice = message.member?.voice;
    const guildId = message.guild?.id;
    const adapterCreator = message.guild?.voiceAdapterCreator;

    if (!voice?.channelId || !guildId || !adapterCreator) {
        message.reply("You're not in a voice channel.");
        return false;
    }

    let connection = getGuildVoiceConnection(guildId);
    if (connection && connection.joinConfig.channelId !== voice.channelId) {
        connection.destroy();
        connection = undefined;
    }

    if (!connection) {
        const connection = joinVoiceChannel({
            channelId: voice.channelId,
            guildId,
            adapterCreator,
        });

        if (isPlayerExists(guildId)) {
            connection.subscribe(getPlayerConfig(guildId).player);
        }
    }

    return true;
};

export const getGuildVoiceConnection = (guildId: string) => {
    const connection = getVoiceConnections().get(guildId);

    if (!connection) {
        return;
    }

    return connection;
};
