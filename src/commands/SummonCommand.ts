import { establishVoiceChannel } from '../VoiceChannelHandler';
import { Command } from './Command';

export class SummonCommand extends Command {
    execute() {
        establishVoiceChannel(this.message);
    }
}
