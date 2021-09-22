import {
    Interaction,
    ButtonInteraction as discordJSButtonInteraction,
} from 'discord.js';
import { InteractionDoesntExistError } from '../errors/InteractionDoesntExistError';
import { ButtonInteraction, getNameFromCustomId } from './ButtonInteraction';
import { PlayInteraction, PlayInteractionName } from './PlayInteraction';

const buttonInterctions: {
    [interactionName: string]: new (
        interaction: discordJSButtonInteraction
    ) => ButtonInteraction;
} = {
    [PlayInteractionName]: PlayInteraction,
};

const isInteractionExists = (interactionName: string) =>
    Object.keys(buttonInterctions).includes(interactionName);

export const createInteraction = (interaction: discordJSButtonInteraction) => {
    const interactionName = getNameFromCustomId(interaction.customId);

    if (!isInteractionExists(interactionName)) {
        throw new InteractionDoesntExistError();
    }

    return new buttonInterctions[interactionName](interaction);
};
