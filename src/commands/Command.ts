import { Message } from 'discord.js';

export abstract class Command {
    args: string[];
    message: Message;

    constructor(args: string[], message: Message) {
        this.args = args;
        this.message = message;
    }

    abstract execute(): void;
}
