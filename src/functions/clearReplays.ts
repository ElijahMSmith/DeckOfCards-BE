import mongoose from 'mongoose';
import Replay from '../models/Replay';
import User from '../models/User';

import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DB_CONNECT, async () => {
    console.log('Connected to db');
    Replay.deleteMany({}, (err) => {
        if (err) {
            console.log('Failed to delete all replay documents');
            return;
        }
        User.updateMany({}, { replays: [] }, (err) => {
            if (err) {
                console.log('Failed to delete all replays from each user');
                return;
            }
            console.log('Successfully deleted all replays!');
            mongoose.connection.close();
        });
    });
});
