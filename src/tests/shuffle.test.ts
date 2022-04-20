import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';
import { Card } from '../models/Card';

dotenv.config();

describe('Shuffle Cards Tests', function () {
    this.timeout(4000);

    it('Order changes when the deck is shuffled', function (done) {
        // There's a 1/1289312917293729172837219731 chance that the decks do have the same arrangement,
        // So there's no foolproof way to verify the shuffle without sending back the shuffle log every time
        // But that's unnecessary data that the client doesn't need in a real game
        // As such, we'll do the best we can here

        const socket1 = newSocket(1);

        socket1.emit('create', { jokersEnabled: true }, (response: any) => {
            assert.equal(response.error, null);
            assert.notEqual(response.currentState.deck, undefined);

            const code = response.code;
            const initialDeckLog = toString(
                response.currentState.deck.contents
            );

            socket1.on('update', (returnState) => {
                assert.equal(returnState.error, undefined);
                assert.notEqual(returnState.deck, undefined);
                assert.equal(returnState.deck.contents.length, 54);
                assert.notEqual(
                    toString(returnState.deck.contents),
                    initialDeckLog
                );
                done();
            });

            socket1.emit('action', code, 'SPD ', (err: any) => {
                assert.equal(err.error, undefined);
            });
        });
    });

    it('Shuffling non-empty piles into the deck works', function (done) {
        // There's a 1/1289312917293729172837219731 chance that the decks do have the same arrangement,
        // So there's no foolproof way to verify the shuffle without sending back the shuffle log every time
        // But that's unnecessary data that the client doesn't need in a real game
        // As such, we'll do the best we can here

        const socket1 = newSocket(1);

        socket1.emit('create', { jokersEnabled: true }, (response: any) => {
            assert.equal(response.error, null);
            assert.notEqual(response.currentState.deck, undefined);

            const code = response.code;
            const initialDeckLog = toString(
                response.currentState.deck.contents
            );

            let count = 0;
            socket1.on('update', (returnState) => {
                assert.equal(returnState.error, undefined);

                if (count === 0) {
                    // Draw card to faceUp
                    assert.notEqual(returnState.deck, undefined);
                    assert.equal(returnState.deck.contents.length, 53);
                    assert.notEqual(returnState.faceUp, undefined);
                    assert.equal(returnState.faceUp.contents.length, 1);
                    count++;
                    socket1.emit('action', code, 'D1FD', (err: any) => {
                        assert.equal(err.error, undefined);
                    });
                } else if (count === 1) {
                    // Draw card to discard
                    assert.notEqual(returnState.deck, undefined);
                    assert.equal(returnState.deck.contents.length, 52);
                    assert.notEqual(returnState.discard, undefined);
                    assert.equal(returnState.discard.contents.length, 1);
                    count++;
                    socket1.emit('action', code, 'SPD ', (err: any) => {
                        assert.equal(err.error, undefined);
                    });
                } else {
                    // Shuffled
                    assert.notEqual(returnState.deck, undefined);
                    assert.notEqual(returnState.faceUp, undefined);
                    assert.notEqual(returnState.discard, undefined);
                    assert.equal(returnState.deck.contents.length, 54);
                    assert.equal(returnState.faceUp.contents.length, 0);
                    assert.equal(returnState.discard.contents.length, 0);
                    assert.notEqual(
                        toString(returnState.deck.contents),
                        initialDeckLog
                    );
                    done();
                }
            });

            socket1.emit('action', code, 'D1FP', (err: any) => {
                assert.equal(err.error, undefined);
            });
        });
    });
});

const toString = (arr: any) => {
    return arr.reduce(
        (previousValue, currentCard) => previousValue + currentCard.value,
        ''
    );
};
