import fs from 'fs';
import { isResourceUsed } from './AudioHandler';
import { currentlyDownloading } from './CommandsManager';

export const startGarbageCollection = () => {
    setInterval(deleteGarbage, 1000 * 60 * 5);
};

const deleteGarbage = () => {
    const directoryName = 'audioFiles';
    fs.readdirSync(directoryName).forEach(file => {
        const path = `${directoryName}/${file}`;

        if (!isResourceUsed(path) && !currentlyDownloading.includes(path)) {
            console.log(`Unused file: ${path}. Deleting!`);
            try {
                fs.rmSync(path);
            } catch (error) {
                console.log(`Error deleting file ${path} - ${error}`);
            }
        }
    });
};
