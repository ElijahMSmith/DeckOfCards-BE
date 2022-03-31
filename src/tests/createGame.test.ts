import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

const conns = [];
/*
const socket = io('http://localhost:8080', {
    auth: {
        token: process.env.TESTING_TOKEN,
    },
});
*/

describe('Game creation tests', function () {
    afterEach('Clear all connections', function () {
        console.log('Cleaning up test');
        while (conns.length !== 0) {
            conns.pop().disconnect();
        }
    });

    it('Create new instance with no rules set', function (done) {
        const socket = newSocket(1);
        socket.emit('create', {}, (response: any) => {
            assert.notEqual(response, null);
            assert.equal(response.error, null);

            const state = response.currentState;

            printClean(state);

            assert.equal(state.currentDealer, 1);
            assert.equal(state.terminated, false);

            const set = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let i = 0; i < 52; i++) {
                const val = set.charAt(i);
                const deck = state.deck.contents;
                let foundOne = false;
                for (let card of deck) {
                    if (card.value === val) {
                        foundOne = true;
                        break;
                    }
                }
                if (!foundOne) assert.fail('Card value ' + i + ' not in deck');
            }

            assert.equal(state.faceUp.contents.length, 0);
            assert.equal(state.discard.contents.length, 0);

            done();
        });
    });
});
