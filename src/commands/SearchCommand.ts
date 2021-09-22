import {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextBasedChannels,
} from 'discord.js';
import {
    constructPlayCutomId,
    PlayInteractionName,
} from '../buttonInteractions/PlayInteraction';
import { getChannel, sendMessage } from '../ClientHandler';
import { decodeHtmlEntity, searchMultipleVideos } from '../YoutubeHandler';
import { Command } from './Command';

export class SearchCommand extends Command {
    async execute() {
        const searchQuery = this.args.slice(1).join(' ');

        const searchResults = await searchMultipleVideos(searchQuery);

        searchResults.forEach(currSearchResult => {
            const VideoEmbed = new MessageEmbed()
                .setTitle(decodeHtmlEntity(currSearchResult.title))
                .setURL(
                    `https://www.youtube.com/watch?v=${currSearchResult.id}`
                )
                .setThumbnail(currSearchResult.thumbnail);

            const PlayVideoButton = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(constructPlayCutomId(currSearchResult.id))
                    .setLabel('Play')
                    .setStyle('SUCCESS')
            );

            sendMessage(this.message.channelId, {
                embeds: [VideoEmbed],
                components: [PlayVideoButton],
            });
        });
    }
}
