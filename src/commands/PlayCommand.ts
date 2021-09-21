import { establishPlayer } from '../AudioHandler';
import { getGuildId } from '../GuildHandler';
import { addToQueue } from '../QueueManager';
import { Track } from '../types/Track';
import { establishVoiceChannel } from '../VoiceChannelHandler';
import {
    decodeHtmlEntity,
    getAudioFromVideoId,
    searchVideo,
} from '../YoutubeHandler';
import { Command } from './Command';

export class PlayCommand extends Command {
    async execute() {
        if (!establishVoiceChannel(this.message)) {
            return;
        }

        const guildId = getGuildId(this.message);
        if (!guildId || !establishPlayer(guildId)) {
            return;
        }

        if (this.args.length <= 1) {
            this.message.reply('Play what exactly?');
            return;
        }

        const searchQuery = this.args.slice(1).join(' ');
        const videoResult = await searchVideo(searchQuery);
        if (!videoResult) {
            this.message.reply('Something went wrong with video search, sorry');
            return;
        } else if (videoResult === 'no results') {
            this.message.reply(`Found no results for ${searchQuery}`);
            return;
        }

        const audioURL = await getAudioFromVideoId(videoResult.id);
        if (!audioURL) {
            this.message.reply(
                'Something went wrong with audio decoding, sorry'
            );
            return;
        }

        const track: Track = {
            title: decodeHtmlEntity(videoResult.title),
            path: audioURL,
            requestChannelId: this.message.channelId,
        };

        addToQueue(guildId, track);
    }
}
