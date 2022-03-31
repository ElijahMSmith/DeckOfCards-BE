import submitReplay from './submitReplay';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const replayObj = {
        dateCreated: new Date(),
        playerIDs: [
            {
                allIDs: ['622a76a69dfd2f3241213f96'],
            },
            {
                allIDs: ['622a76a69dfd2f3241213f96'],
            },
            {
                allIDs: ['622a76a69dfd2f3241213f96'],
            },
            {
                allIDs: ['622a76a69dfd2f3241213f96'],
            },
            {
                allIDs: [],
            },
            {
                allIDs: [],
            },
            {
                allIDs: [],
            },
            {
                allIDs: [],
            },
        ],
        deckArrangements: [
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ],
        actionLog: 'TODOCHANGETHISONCEWESTARTACTUALLYVALIDATINGMOVES',
        excludeDealer: true,
        autoAbsorbCards: true,
        jokersEnabled: true,
    };

    const error = await submitReplay(replayObj);
    if (error) console.log(error);
}

mongoose.connect(process.env.DB_CONNECT, async () => {
    console.log('Connected to db');
    await run();
    mongoose.connection.close();
});
