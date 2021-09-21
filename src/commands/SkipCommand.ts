import { getGuildId } from '../GuildHandler';
import { getQueue, playNext } from '../QueueManager';
import { Command } from './Command';

export class SkipCommand extends Command {
    execute() {
        const guildId = getGuildId(this.message);
        if (!guildId) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue || queue.tracks.length === 0) {
            this.message.reply('Queue is empty');
            return;
        }

        playNext(guildId);
    }
}
