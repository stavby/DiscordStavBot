import dotenv from 'dotenv';
import { getClient } from './src/ClientHandler';
import { startGarbageCollection } from './src/GarbageCollection';
dotenv.config();

const client = getClient();
startGarbageCollection();

client.login(process.env.CLIENT_TOKEN);
