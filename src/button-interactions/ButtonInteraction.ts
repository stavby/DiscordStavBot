import { Interaction } from 'discord.js';

export abstract class ButtonInteraction {
    args: string[];
    interaction: Interaction;

    constructor(args: string[], interaction: Interaction) {
        this.args = args;
        this.interaction = interaction;
    }

    abstract execute(): void;
}
