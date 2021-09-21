import fs from 'fs';
import { currentlyDownloading } from './YoutubeHandler';
import { isFileInQueue } from './QueueManager';

export const startGarbageCollection = () => {
    setInterval(deleteGarbage, 1000 * 60 * 5);
};

const deleteGarbage = () => {
    const directoryName = 'audioFiles';
    fs.readdirSync(directoryName).forEach(file => {
        const path = `${directoryName}/${file}`;

        if (!isFileInQueue(path) && !currentlyDownloading.includes(path)) {
            console.log(`Unused file: ${path}. Deleting!`);
            try {
                fs.rmSync(path);
            } catch (error) {
                console.error(`Error deleting file ${path} - ${error}`);
            }
        }
    });
};
