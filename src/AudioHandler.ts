import {
    AudioPlayer,
    AudioPlayerState,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    VoiceConnection,
} from '@discordjs/voice';
import { getQueue, playNext } from './QueueManager';

let playerConfigs: {
    [guildId: string]: {
        player: AudioPlayer;
        resource?: AudioResource;
        path?: string;
    };
} = {};

export const createPlayerConfig = (
    guildId: string,
    connection: VoiceConnection
) => {
    const player: AudioPlayer = createAudioPlayer();

    player.on(
        'stateChange',
        (_oldState: AudioPlayerState, newState: AudioPlayerState) => {
            if (
                newState.status === AudioPlayerStatus.Idle &&
                getQueue(guildId)?.isPlaying
            ) {
                playNext(guildId);
            }
        }
    );

    player.on('error', error => {
        console.error(`Error: ${error.message} with player`);
    });

    playerConfigs[guildId] = { player };

    connection.subscribe(player);
};

export const isPlayerExists = (guildId: string) => !!playerConfigs[guildId];

export const getPlayerConfig = (guildId: string) => playerConfigs[guildId];

export const play = (guildId: string, resourcePath: string) => {
    const playerConfig = getPlayerConfig(guildId);
    if (!playerConfig) {
        throw new Error('Player not created');
    }

    playerConfig.resource = createAudioResource(resourcePath);
    playerConfig.path = resourcePath;
    playerConfig.player.play(playerConfig.resource);
};

export const pause = (guildId: string) => {
    const { player, path } = getPlayerConfig(guildId);
    if (!player || !path) {
        throw new Error('Player not created');
    }

    player.pause();
};

export const resume = (guildId: string) => {
    const { player } = getPlayerConfig(guildId);
    if (!player) {
        throw new Error('Player not created');
    }

    player.unpause();
};

export const stop = (guildId: string) => {
    const { player } = getPlayerConfig(guildId);
    if (!player) {
        throw new Error('Player not created');
    }

    player.stop();
};

export const isResourceUsed = (resourcePath: string) =>
    Object.values(playerConfigs).some(
        playerConfigs => playerConfigs.path === resourcePath
    );
