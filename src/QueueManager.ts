import { TextBasedChannel, TextBasedChannels } from 'discord.js';
import { Queue } from '../types/Queue';
import { Track } from '../types/Track';
import { pause, play, stop } from './AudioHandler';
import { getChannel } from './ClientHandler';

let queues: { [guildId: string]: Queue } = {};

export const getQueue = (guildId: string) => queues[guildId];

export const addToQueue = (guildId: string, track: Track) => {
    let guildQueue = getQueue(guildId);

    if (!guildQueue) {
        queues[guildId] = {
            isPlaying: false,
            tracks: [],
        };

        guildQueue = getQueue(guildId);
    }

    guildQueue.tracks.push(track);

    if (guildQueue.tracks.length === 1) {
        setTimeout(() => playCurrent(guildId), 500);
    } else {
        sendMessage(
            track.requestChannelId,
            `Added **${track.title}** to queue!`
        );
    }
};

export const playNext = (guildId: string) => {
    const guildQueue = getQueue(guildId);

    if (!guildQueue) {
        throw new Error('Tried to play next without a queue!');
    } else if (guildQueue.tracks.length === 0) {
        throw new Error('Tried to play next with an empty queue!');
    }

    const lastTrack = guildQueue.tracks.splice(0, 1)[0];
    if (guildQueue.tracks.length === 0) {
        guildQueue.isPlaying = false;
        stop(guildId);
        sendMessage(lastTrack.requestChannelId, 'Finished queue');
    } else {
        playCurrent(guildId);
    }
};

export const playCurrent = (guildId: string) => {
    const guildQueue = getQueue(guildId);

    if (!guildQueue) {
        throw new Error('Tried to play current without a queue!');
    } else if (guildQueue.tracks.length === 0) {
        throw new Error('Tried to play current with an empty queue!');
    }

    guildQueue.isPlaying = true;
    playTrack(guildId, guildQueue.tracks[0]);
};

const playTrack = (guildID: string, track: Track) => {
    sendMessage(track.requestChannelId, `Now Playing **${track.title}**`);
    play(guildID, track.path);
};

const sendMessage = (channelId: string, message: string) => {
    const channel = getChannel(channelId);
    if (!channel || !channel.isText()) {
        console.warn(
            `Tried to send message to non existing or voice channel! \nMessage: ${message} \nChannelId: ${channelId}`
        );
    }

    (channel as TextBasedChannels).send(message);
};

export const queueToString = (queue: Queue) => {
    if (queue.tracks.length === 0) {
        return 'Queue is empty';
    }

    return queue.tracks
        .map((track, index) => `${index + 1}. **${track.title}**`)
        .join('\n');
};

export const isFileInQueue = (path: string) =>
    Object.values(queues)
        .map(queue => queue.tracks)
        .some(tracks => tracks.some(track => track.path === path));

export const removeQueueItem = (guildId: string, itemIndex: number) => {
    const guildQueue = getQueue(guildId);

    if (!guildQueue) {
        throw new Error('Tried to play current without a queue!');
    } else if (guildQueue.tracks.length <= itemIndex) {
        throw new Error('Tried to play current with an empty queue!');
    }

    guildQueue.tracks.splice(itemIndex, 1);
};
