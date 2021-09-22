import { Message } from 'discord.js';
import { establishPlayer } from '../AudioHandler';
import { sendMessage } from '../ClientHandler';
import { getGuildId } from '../GuildHandler';
import { addToQueue } from '../QueueManager';
import { Track } from '../types/Track';
import { establishVoiceChannel } from '../VoiceChannelHandler';
import {
    decodeHtmlEntity,
    getAudioFromVideoId,
    searchVideo,
} from '../YoutubeHandler';
import { ButtonInteraction } from './ButtonInteraction';

export const PlayInteractionName = 'PLAY';

export const constructPlayCutomId = (videoId: string) =>
    `${PlayInteractionName} ${videoId}`;

export const deconstructPlayCustomId = (customId: string) => {
    const args = customId.split(' ');

    return {
        name: args[0],
        videoId: args[1],
    };
};

export class PlayInteraction extends ButtonInteraction {
    async execute() {
        const args = deconstructPlayCustomId(this.interaction.customId);

        if (!establishVoiceChannel(this.interaction as unknown as Message)) {
            return;
        }

        const guildId = this.interaction.guild?.id;
        if (!guildId || !establishPlayer(guildId)) {
            return;
        }

        const audioURL = await getAudioFromVideoId(args.videoId);

        if (!audioURL) {
            sendMessage(
                this.interaction.channelId as string,
                'Something went wrong with audio decoding, sorry'
            );
            return;
        }

        const videoResult = await searchVideo(args.videoId);

        if (!videoResult || videoResult === 'no results') {
            return;
        }

        const track: Track = {
            title: decodeHtmlEntity(videoResult.title),
            path: audioURL,
            requestChannelId: this.interaction.channelId as string,
        };

        addToQueue(guildId, track);
    }
}
