import { Client, Message } from 'discord.js';

export type CommandParameters = {
    command: string;
    args: string[];
    message: Message;
};
