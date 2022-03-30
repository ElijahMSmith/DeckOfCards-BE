import io from 'socket.io-client';
import dotenv = require('dotenv');
import { Socket } from 'socket.io';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { ReturnState } from '../models/ReturnState';

dotenv.config();

const socketConnections = [];
socketConnections[0] = io('http://localhost:8080', {
    auth: {
        token: process.env.TESTING_TOKEN,
    },
});

describe('Game creation tests', function () {
    beforeEach('Establish new connection', function () {
        for (let indvSocket of socketConnections) {
            indvSocket.disconnect();
            indvSocket.connect();
        }
    });

    it('Create new instance with no rules set', function (done) {
        const socket = socketConnections[0];
        socket.emit('create', {}, (response: ReturnState) => {
            console.log(JSON.stringify(response, null, 4));
            done();
        });
    });
});
