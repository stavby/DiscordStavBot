import {
    AudioPlayer,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    VoiceConnection,
} from '@discordjs/voice';
import fs from 'fs';

let playerConfigs: {
    [guildID: string]: {
        player: AudioPlayer;
        resource?: AudioResource;
        path?: string;
    };
} = {};

export const createPlayerConfig = (
    guildID: string,
    connection: VoiceConnection
) => {
    playerConfigs[guildID] = { player: createAudioPlayer() };
    connection.subscribe(playerConfigs[guildID].player);
};

export const isPlayerExists = (guildID: string) => !!playerConfigs[guildID];

const getPlayer = (guildID: string) => playerConfigs[guildID];

export const play = (guildID: string, resourcePath: string) => {
    const playerConfig = getPlayer(guildID);
    if (!playerConfig) {
        throw new Error('Player not created');
    }

    playerConfig.resource = createAudioResource(resourcePath);
    playerConfig.path = resourcePath;
    playerConfig.player.play(playerConfig.resource);
};

export const pause = (guildID: string) => {
    const { player, path } = getPlayer(guildID);
    if (!player || !path) {
        throw new Error('Player not created');
    }

    player.pause();
};

export const resume = (guildID: string) => {
    const { player } = getPlayer(guildID);
    if (!player) {
        throw new Error('Player not created');
    }

    player.unpause();
};

export const isResourceUsed = (resourcePath: string) =>
    Object.values(playerConfigs).some(
        playerConfigs => playerConfigs.path === resourcePath
    );
