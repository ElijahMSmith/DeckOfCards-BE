const submitToDB = require('./submitReplay.js').submitToDB;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
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

    const error = await submitToDB(replayObj);
    if (error) console.log(error);
}

mongoose.connect(
    process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log('Connected to db');
        run();
    }
);
