import { Message } from 'discord.js';
import { CommandParameters } from './types/CommandParameters';
import { joinVoiceChannel, getVoiceConnections } from '@discordjs/voice';
import {
    createPlayerConfig,
    isPlayerExists,
    pause,
    play,
    resume,
} from './AudioHandler';
import ytdl from 'ytdl-core';
import axios from 'axios';
import fs from 'fs';

const commands: {
    [commandName: string]: (parameters: CommandParameters) => void;
} = {
    gay: ({ message }: CommandParameters): void => {
        message.reply(`Fuck you, ${message.author.username}!`);
    },
    summon: ({ message }: CommandParameters): void => {
        if (!joinChannel(message)) {
            return;
        }
    },
    leave: ({ message }: CommandParameters): void => {
        const guildId = getGuildId(message);
        if (!guildId) {
            return;
        }

        const voiceConnection = getGuildVoiceConnection(message, guildId);
        if (!voiceConnection) {
            return;
        }

        voiceConnection.destroy();
    },
    play: async ({ message, args }: CommandParameters): Promise<void> => {
        if (!joinChannel(message)) {
            return;
        }

        const guildId = getGuildId(message);
        if (!guildId || !establishPlayer(message, guildId)) {
            return;
        }

        if (args.length <= 1) {
            message.reply('Play what exactly?');
            return;
        }

        const searchQuery = args.slice(1).join(' ');
        const videoResult = await searchVideo(searchQuery);
        if (!videoResult) {
            message.reply('Something went wrong with video search, sorry');
            return;
        } else if (videoResult === 'no results') {
            message.reply(`Found no results for ${searchQuery}`);
            return;
        }

        const audioURL = await getAudioFromVideoId(videoResult.id);
        if (!audioURL) {
            message.reply('Something went wrong with audio decoding, sorry');
            return;
        }

        message.reply(`Playing **${videoResult.title}**`);
        play(guildId, audioURL);
    },
    pause: ({ message }: CommandParameters): void => {
        if (!joinChannel(message)) {
            return;
        }

        const guildId = getGuildId(message);
        if (!guildId || !establishPlayer(message, guildId)) {
            return;
        }

        message.reply('Paused');
        pause(guildId);
    },
    resume: ({ message }: CommandParameters): void => {
        if (!joinChannel(message)) {
            return;
        }

        const guildId = getGuildId(message);
        if (!guildId || !establishPlayer(message, guildId)) {
            return;
        }

        message.reply('Resumed');
        resume(guildId);
    },
};

export const currentlyDownloading: string[] = [];

export const executeCommand = (parameters: CommandParameters) => {
    if (!isCommandExists(parameters.command)) {
        return;
    }

    commands[parameters.command](parameters);
};

export const isCommandExists = (command: string) =>
    Object.keys(commands).includes(command.toLowerCase());

const joinChannel = (message: Message): boolean => {
    const voice = message.member?.voice;
    const guildId = message.guild?.id;
    const adapterCreator = message.guild?.voiceAdapterCreator;

    if (!voice?.channelId || !guildId || !adapterCreator) {
        message.reply("You're not in a voice channel.");
        return false;
    }

    joinVoiceChannel({
        channelId: voice.channelId,
        guildId,
        adapterCreator,
    });
    return true;
};

const getGuildId = (message: Message) => {
    const guildId = message.guild?.id || '';

    if (!guildId) {
        message.reply('Something went wrong. (Undefined guildID)');
        return;
    }

    return guildId;
};

const getGuildVoiceConnection = (message: Message, guildId: string) => {
    const connection = getVoiceConnections().get(guildId);

    if (!connection) {
        message.reply("I'm not in a voice channel.");
        return;
    }

    return connection;
};

const establishPlayer = (message: Message, guildID: string) => {
    const voiceConnection = getGuildVoiceConnection(message, guildID);
    if (!voiceConnection) {
        return false;
    }

    if (!isPlayerExists(guildID)) {
        createPlayerConfig(guildID, voiceConnection);
    }

    return true;
};

const searchVideo = async (searchQuery: string) => {
    const res = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${
            process.env.YT_API_KEY
        }&q=${encodeURIComponent(searchQuery)}&part=snippet`
    );

    if (res.status !== 200) {
        console.log(`Search request failed: ${res.statusText}
${res.data}`);
        return;
    }

    const resultItems = res.data.items;
    if (resultItems.length === 0) {
        return 'no results';
    }

    return {
        id: resultItems[0].id.videoId,
        title: resultItems[0].snippet.title,
    };
};

const getAudioFromVideoId = async (videoId: string) => {
    const res = await ytdl.getInfo(videoId);

    const audios = res.formats.filter(format =>
        format.mimeType?.includes('audio/webm')
    );

    if (audios.length === 0) {
        return;
    }

    const url = audios[0].url;
    // return url;

    const directoryName = 'audioFiles';
    if (!fs.existsSync(directoryName)) {
        fs.mkdirSync(directoryName);
    }

    const fileName = `${directoryName}/${videoId}.mp3`;
    const file = fs.createWriteStream(fileName);

    const downloadRequest = await axios.get(url, {
        method: 'GET',
        responseType: 'stream',
    });
    if (downloadRequest.status !== 200) {
        console.log('Error retriving audio URL');
        return;
    }

    currentlyDownloading.push(fileName);
    const downloadStream = downloadRequest.data.pipe(file);
    downloadStream.on('finish', () =>
        currentlyDownloading.splice(currentlyDownloading.indexOf(fileName), 1)
    );

    return fileName;
};
