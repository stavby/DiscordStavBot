import { ButtonInteraction, Interaction } from 'discord.js';
import { InteractionDoesntExistError } from '../errors/InteractionDoesntExistError';

const buttonInterctions: {
    [interactionName: string]: new (
        args: string[],
        interaction: Interaction
    ) => ButtonInteraction;
} = {};

const isInteractionExists = (interactionName: string) =>
    Object.keys(buttonInterctions).includes(interactionName);

export const createInteraction = (args: string[], interaction: Interaction) => {
    const interactionName = args[0];
    if (!isInteractionExists(interactionName)) {
        throw new InteractionDoesntExistError();
    }

    return new buttonInterctions[interactionName](args, interaction);
};
