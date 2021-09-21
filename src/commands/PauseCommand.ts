import { establishPlayer, pause } from '../AudioHandler';
import { getGuildId } from '../GuildHandler';
import { getQueue } from '../QueueManager';
import { establishVoiceChannel } from '../VoiceChannelHandler';
import { Command } from './Command';

export class PauseCommand extends Command {
    execute() {
        if (!establishVoiceChannel(this.message)) {
            return;
        }

        const guildId = getGuildId(this.message);
        if (!guildId || !establishPlayer(guildId)) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue || queue.tracks.length === 0) {
            this.message.reply('Queue is empty');
            return;
        }

        if (queue.isPlaying) {
            this.message.reply('Paused');
            pause(guildId);
            queue.isPlaying = false;
        } else {
            this.message.reply('Nothing is playing');
        }
    }
}
