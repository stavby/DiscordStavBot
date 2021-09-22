import ytdl from 'ytdl-core';
import fs from 'fs';
import axios from 'axios';

export const currentlyDownloading: string[] = [];

export const getAudioFromVideoId = async (videoId: string) => {
    const res = await ytdl.getInfo(videoId);

    const audios = res.formats.filter(format =>
        format.mimeType?.includes('audio/webm')
    );

    if (audios.length === 0) {
        return;
    }

    const url = audios[0].url;

    const directoryName = 'audioFiles';
    if (!fs.existsSync(directoryName)) {
        fs.mkdirSync(directoryName);
    }

    const fileName = `${directoryName}/${videoId}.mp3`;
    const file = fs.createWriteStream(fileName);

    const downloadRequest = await axios.get(url, {
        method: 'GET',
        responseType: 'stream',
    });
    if (downloadRequest.status !== 200) {
        console.error('Error retriving audio URL');
        return;
    }

    currentlyDownloading.push(fileName);
    const downloadStream = downloadRequest.data.pipe(file);
    downloadStream.on('finish', () =>
        currentlyDownloading.splice(currentlyDownloading.indexOf(fileName), 1)
    );

    return fileName;
};

const getYoutubeSearchResults = async (searchQuery: string) =>
    await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${
            process.env.YT_API_KEY
        }&q=${encodeURIComponent(searchQuery)}&part=snippet&type=video`
    );

export const searchVideo = async (searchQuery: string) => {
    const res = await getYoutubeSearchResults(searchQuery);

    if (res.status !== 200) {
        console.error(`Search request failed: ${res.statusText}
${res.data}`);
        return;
    }

    const resultItems = res.data.items;
    if (resultItems.length === 0) {
        return 'no results';
    }

    return {
        id: resultItems[0].id.videoId,
        title: resultItems[0].snippet.title,
    };
};

export const searchMultipleVideos = async (
    searchQuery: string
): Promise<
    {
        id: string;
        title: string;
        thumbnail: string;
    }[]
> => {
    const res = await getYoutubeSearchResults(searchQuery);

    return res.data.items.map(
        (currentVideo: {
            id: { videoId: string };
            snippet: {
                title: string;
                thumbnails: { default: { url: string } };
            };
        }) => ({
            id: currentVideo.id.videoId,
            title: currentVideo.snippet.title,
            thumbnail: currentVideo.snippet.thumbnails.default.url,
        })
    );
};

export const decodeHtmlEntity = (str: string) =>
    str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
