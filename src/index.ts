// Socket server
import startSocketServer from './socketServer';
import express from 'express';
import cors from 'cors';
import schedule from 'node-schedule';

const app = express();
app.use(cors());

// Import routes
import authRoutes from './routes/auth';
import replayRoutes from './routes/replays';

// Middlewares
app.use(express.json());
app.use('/user', authRoutes);
app.use('/replay', replayRoutes);

// Connect to DB
import mongoose = require('mongoose');
import dotenv = require('dotenv');
import Replay from './models/Replay';
dotenv.config();

mongoose.connect(process.env.DB_CONNECT, () => {
    console.log('Connected to db');

    const rule = new schedule.RecurrenceRule();
    rule.second = 0;
    rule.minute = 0;
    rule.hour = 0;

    const job = schedule.scheduleJob(rule, function () {
        Replay.find().exec(function (err, res) {
            if (err) {
                console.error('Error running replay deletion job', err);
                return;
            }

            const comp = new Date();
            comp.setDate(comp.getDate() - 14);

            for (let rep of res) {
                if (rep.dateCreated < comp) {
                    const _id = rep._id;
                    Replay.deleteOne({
                        _id,
                    }).exec(function (err) {
                        if (err)
                            console.error(
                                'Error while deleted replay with id ' + _id,
                                err
                            );
                    });
                }
            }
        });
    });
});

// Start on port
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

startSocketServer(server);
