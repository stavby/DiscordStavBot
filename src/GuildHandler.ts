import { Message } from 'discord.js';

export const getGuildId = (message: Message) => {
    return message.guild?.id;
};
