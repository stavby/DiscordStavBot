import {
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextBasedChannels,
} from 'discord.js';
import {
    constructPlayCutomId,
    PlayInteractionName,
} from '../buttonInteractions/PlayInteraction';
import { sendMessage } from '../ClientHandler';
import { decodeHtmlEntity, searchMultipleVideos } from '../YoutubeHandler';
import { Command } from './Command';

const MESSAGE_DELETE_TIMOUT = 60000;

const filterPlayButtonMessages = (messages: Message[]) =>
    messages.filter(currMessage =>
        currMessage.components.some(currComponent =>
            currComponent.components.some(currSubComponent =>
                currSubComponent.customId?.startsWith(PlayInteractionName)
            )
        )
    );

export const deleteAllSearchMessages = async (channel: TextBasedChannels) => {
    filterPlayButtonMessages([
        ...(await channel.messages.fetch({ limit: 100 })).values(),
    ]).forEach(currMessage => {
        if (!currMessage.deleted) {
            currMessage.delete();
        }
    });
};

const deleteMessagesAfterTimeout = (channel: TextBasedChannels) =>
    setTimeout(async () => {
        await deleteAllSearchMessages(channel);
    }, MESSAGE_DELETE_TIMOUT);

export class SearchCommand extends Command {
    async execute() {
        await deleteAllSearchMessages(this.message.channel);

        if (this.args.length <= 1) {
            this.message.reply('Search what exactly?');
            return;
        }

        const searchQuery = this.args.slice(1).join(' ');
        const searchResults = await searchMultipleVideos(searchQuery);

        searchResults.forEach(async currSearchResult => {
            const videoEmbed = new MessageEmbed()
                .setTitle(decodeHtmlEntity(currSearchResult.title))
                .setURL(
                    `https://www.youtube.com/watch?v=${currSearchResult.id}`
                )
                .setThumbnail(currSearchResult.thumbnailURL);

            const playVideoButton = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(constructPlayCutomId(currSearchResult.id))
                    .setLabel('Play')
                    .setStyle('SUCCESS')
            );

            await sendMessage(this.message.channelId, {
                embeds: [videoEmbed],
                components: [playVideoButton],
            });
        });

        deleteMessagesAfterTimeout(this.message.channel);
    }
}
