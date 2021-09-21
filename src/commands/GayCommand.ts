import { Command } from './Command';

export class GayCommand extends Command {
    execute() {
        this.message.reply(`Fuck you, ${this.message.author.username}!`);
    }
}
