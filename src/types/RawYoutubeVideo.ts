export type RawYoutubeVideo = {
    id: { videoId: string };
    snippet: {
        title: string;
        thumbnails: { default: { url: string } };
    };
};
