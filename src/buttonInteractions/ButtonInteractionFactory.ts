import { Interaction } from 'discord.js';
import { InteractionDoesntExistError } from '../errors/InteractionDoesntExistError';
import { ButtonInteraction } from './ButtonInteraction';
import { PlayInteraction } from './PlayInteraction';

const buttonInterctions: {
    [interactionName: string]: new (
        args: string[],
        interaction: Interaction
    ) => ButtonInteraction;
} = {
    play: PlayInteraction,
};

const isInteractionExists = (interactionName: string) =>
    Object.keys(buttonInterctions).includes(interactionName);

export const createInteraction = (args: string[], interaction: Interaction) => {
    const interactionName = args[0];
    if (!isInteractionExists(interactionName)) {
        throw new InteractionDoesntExistError();
    }

    return new buttonInterctions[interactionName](args, interaction);
};
