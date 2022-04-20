import assert from 'assert';
import dotenv = require('dotenv');
dotenv.config();

// Connect to DB
import mongoose = require('mongoose');
import Replay from '../models/Replay';

describe('Replays Tests', function () {
    this.timeout(4000);

    it('No replays on the server are older than 2 weeks', function (done) {
        mongoose.connect(process.env.DB_CONNECT, () => {
            console.log('Connected to db');

            Replay.find().exec(function (err, res) {
                assert.equal(err, undefined);
                const comp = new Date();
                comp.setDate(comp.getDate() - 14);

                for (let rep of res)
                    assert.equal(rep.dateCreated < comp, false);
                done();
            });
        });
    });
});
