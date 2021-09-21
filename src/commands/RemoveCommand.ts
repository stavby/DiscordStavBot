import { getGuildId } from '../GuildHandler';
import { getQueue, removeQueueItem } from '../QueueManager';
import { Command } from './Command';

export class RemoveCommand extends Command {
    execute() {
        if (this.args.length <= 1) {
            this.message.reply(
                'Remove requies a second argument - queue item index to remove'
            );
            return;
        }

        const indexToRemove = parseInt(this.args[1]);
        if (isNaN(indexToRemove) || indexToRemove < 2) {
            this.message.reply('Invalid index, expected 2 or above');
            return;
        }

        const guildId = getGuildId(this.message);
        if (!guildId) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue || queue.tracks.length === 0) {
            this.message.reply('Queue is empty');
            return;
        } else if (queue.tracks.length < indexToRemove) {
            this.message.reply(`There's no item at index ${indexToRemove}`);
            return;
        }

        removeQueueItem(guildId, indexToRemove - 1);
        this.message.reply('Removed');
    }
}
