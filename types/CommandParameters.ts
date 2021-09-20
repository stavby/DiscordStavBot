import { Client, Message } from 'discord.js';

export type CommandParameters = {
    client: Client;
    command: string;
    args: string[];
    message: Message;
};
