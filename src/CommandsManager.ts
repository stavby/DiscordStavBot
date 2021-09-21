import { Message } from 'discord.js';
import { CommandParameters } from './../types/CommandParameters';
import {
    joinVoiceChannel,
    getVoiceConnections,
    VoiceConnectionState,
} from '@discordjs/voice';
import {
    createPlayerConfig,
    getPlayerConfig,
    isPlayerExists,
    pause,
    resume,
} from './AudioHandler';
import ytdl from 'ytdl-core';
import axios from 'axios';
import fs from 'fs';
import { Track } from '../types/Track';
import {
    addToQueue,
    getQueue,
    playNext,
    queueToString,
    removeQueueItem,
} from './QueueManager';

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

        const voiceConnection = getGuildVoiceConnection(guildId);
        if (!voiceConnection) {
            return;
        }
        voiceConnection.disconnect();
        pause(guildId);

        const queue = getQueue(guildId);
        if (queue) {
            queue.isPlaying = false;
            queue.tracks = [];
        }
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

        const track: Track = {
            title: decodeHtmlEntity(videoResult.title),
            path: audioURL,
            requestChannelId: message.channelId,
        };

        addToQueue(guildId, track);
    },
    pause: ({ message }: CommandParameters): void => {
        if (!joinChannel(message)) {
            return;
        }

        const guildId = getGuildId(message);
        if (!guildId || !establishPlayer(message, guildId)) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue || queue.tracks.length === 0) {
            message.reply('Queue is empty');
            return;
        }

        if (queue.isPlaying) {
            message.reply('Paused');
            pause(guildId);
            queue.isPlaying = false;
        } else {
            message.reply('Nothing is playing');
        }
    },
    resume: ({ message }: CommandParameters): void => {
        if (!joinChannel(message)) {
            return;
        }

        const guildId = getGuildId(message);
        if (!guildId || !establishPlayer(message, guildId)) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue || queue.tracks.length === 0) {
            message.reply('Queue is empty');
            return;
        }

        if (!queue.isPlaying) {
            message.reply('Resumed');
            resume(guildId);
            queue.isPlaying = true;
        } else {
            message.reply('Already playing');
        }
    },
    skip: ({ message }: CommandParameters): void => {
        const guildId = getGuildId(message);
        if (!guildId) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue || queue.tracks.length === 0) {
            message.reply('Queue is empty');
            return;
        }

        playNext(guildId);
    },
    remove: ({ message, args }: CommandParameters): void => {
        if (args.length <= 1) {
            message.reply(
                'Remove requies a second argument - queue item index to remove'
            );
            return;
        }

        const indexToRemove = parseInt(args[1]);
        if (isNaN(indexToRemove) || indexToRemove < 2) {
            message.reply('Invalid index, expected 2 or above');
            return;
        }

        const guildId = getGuildId(message);
        if (!guildId) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue || queue.tracks.length === 0) {
            message.reply('Queue is empty');
            return;
        } else if (queue.tracks.length < indexToRemove) {
            message.reply(`There's no item at index ${indexToRemove}`);
            return;
        }

        removeQueueItem(guildId, indexToRemove - 1);
        message.reply('Removed');
    },
    queue: ({ message }: CommandParameters): void => {
        const guildId = getGuildId(message);
        if (!guildId) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue) {
            message.reply('Queue is empty');
            return;
        }

        message.reply(queueToString(queue));
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

const getGuildId = (message: Message) => {
    const guildId = message.guild?.id || '';

    if (!guildId) {
        message.reply('Something went wrong. (Undefined guildId)');
        return;
    }

    return guildId;
};

const getGuildVoiceConnection = (guildId: string) => {
    const connection = getVoiceConnections().get(guildId);

    if (!connection) {
        return;
    }

    return connection;
};

const establishPlayer = (message: Message, guildId: string) => {
    const voiceConnection = getGuildVoiceConnection(guildId);
    if (!voiceConnection) {
        return false;
    }

    if (!isPlayerExists(guildId)) {
        createPlayerConfig(guildId, voiceConnection);
    }

    return true;
};

const searchVideo = async (searchQuery: string) => {
    const res = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${
            process.env.YT_API_KEY
        }&q=${encodeURIComponent(searchQuery)}&part=snippet&type=video`
    );

    if (res.status !== 200) {
        console.error(`Search request failed: ${res.statusText}
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
        console.error('Error retriving audio URL');
        return;
    }

    currentlyDownloading.push(fileName);
    const downloadStream = downloadRequest.data.pipe(file);
    downloadStream.on('finish', () =>
        currentlyDownloading.splice(currentlyDownloading.indexOf(fileName), 1)
    );

    return fileName;
};

const decodeHtmlEntity = (str: string) =>
    str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
