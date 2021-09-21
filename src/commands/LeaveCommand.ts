import { pause } from '../AudioHandler';
import { getGuildId } from '../GuildHandler';
import { getQueue } from '../QueueManager';
import { getGuildVoiceConnection } from '../VoiceChannelHandler';
import { Command } from './Command';

export class LeaveCommand extends Command {
    execute() {
        const guildId = getGuildId(this.message);
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
    }
}
