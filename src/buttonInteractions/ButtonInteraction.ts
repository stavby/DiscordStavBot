import {
    Interaction,
    ButtonInteraction as discordJSButtonInteraction,
} from 'discord.js';

export const getNameFromCustomId = (customId: string) => customId.split(' ')[0];

export abstract class ButtonInteraction {
    interaction: discordJSButtonInteraction;

    constructor(interaction: discordJSButtonInteraction) {
        this.interaction = interaction;
    }

    abstract execute(): void;
}
