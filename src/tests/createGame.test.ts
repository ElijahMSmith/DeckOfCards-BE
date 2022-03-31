import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

/*
const socket = io('http://localhost:8080', {
    auth: {
        token: process.env.TESTING_TOKEN,
    },
});
*/

describe('Game creation tests', function () {
    it('Create new instance with no rules set', function (done) {
        const socket = newSocket(1);
        socket.emit('create', {}, (response: any) => {
            assert.notEqual(response, null);
            assert.equal(response.error, null);
            assert.equal(response.playerNumber, 1);
            assert.notEqual(response.code, null);

            const state = response.currentState;

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
                if (!foundOne)
                    assert.fail('Card ' + val + ' was not found in deck!');
            }

            assert.equal(state.faceUp.contents.length, 0);
            assert.equal(state.discard.contents.length, 0);

            socket.disconnect();
            done();
        });
    });

    it('Create new instance with all rules set', function (done) {
        const socket = newSocket(1);
        socket.emit(
            'create',
            {
                excludeDealer: true,
                withoutHearts: true,
                withoutDiamonds: true,
                withoutClubs: true,
                withoutSpades: true,
                jokersEnabled: true,
                autoAbsorbCards: true,
                playFacedDown: true,
            },
            (response: any) => {
                assert.notEqual(response, null);
                assert.equal(response.error, null);
                assert.equal(response.playerNumber, 1);
                assert.notEqual(response.code, null);

                const state = response.currentState;

                assert.equal(state.currentDealer, 1);
                assert.equal(state.terminated, false);

                const antiSet =
                    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const set = '+-';
                for (let i = 0; i < 52; i++) {
                    const val = antiSet.charAt(i);
                    const deck = state.deck.contents;
                    let found = false;
                    for (let card of deck) {
                        if (card.value === val) {
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        assert.fail(
                            'Card ' +
                                val +
                                ' was found in deck, but it shouldn\tt be!'
                        );
                }

                for (let i = 0; i < 2; i++) {
                    const val = set.charAt(i);
                    const deck = state.deck.contents;
                    let found = false;
                    for (let card of deck) {
                        if (card.value === val) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) assert.fail('Card value ' + i + ' not in deck');
                }

                assert.equal(state.faceUp.contents.length, 0);
                assert.equal(state.discard.contents.length, 0);

                socket.disconnect();
                done();
            }
        );
    });
});
