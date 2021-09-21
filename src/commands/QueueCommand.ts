import { getGuildId } from '../GuildHandler';
import { getQueue, queueToString } from '../QueueManager';
import { Command } from './Command';

export class QueueCommand extends Command {
    execute() {
        const guildId = getGuildId(this.message);
        if (!guildId) {
            return;
        }

        const queue = getQueue(guildId);
        if (!queue) {
            this.message.reply('Queue is empty');
            return;
        }

        this.message.reply(queueToString(queue));
    }
}
