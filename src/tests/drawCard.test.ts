import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

describe('Draw Cards Tests', function () {
    this.timeout(4000);

    it("Drawing a card places it into the player's hand, unrevealed", function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                let deckCardValue, pileCardValue;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Flip onto draw pile
                        assert.notEqual(returnState.deck, undefined);
                        deckCardValue =
                            returnState.deck.contents[
                                returnState.deck.contents.length - 1
                            ].value;
                        pileCardValue = returnState.faceUp.contents[0].value;
                        count++;
                    } else if (count === 1) {
                        // Draw from top of discard
                        assert.notEqual(returnState.player2, undefined);
                        const card = returnState.player2.hand.contents[0];
                        assert.equal(card.value, deckCardValue);
                        assert.equal(card.revealed, false);
                        count++;
                    } else {
                        // Draw from faceup pile
                        assert.notEqual(returnState.player2, undefined);
                        const card = returnState.player2.hand.contents[1];
                        assert.equal(card.value, pileCardValue);
                        assert.equal(card.revealed, false);
                        done();
                    }
                });

                socket2.emit('action', code, 'D2FP', (err: any) => {
                    assert.equal(err.error, undefined);
                    socket2.emit('action', code, 'D2F ', (err: any) => {
                        assert.equal(err.error, undefined);
                        socket2.emit('action', code, 'D2P ', (err: any) => {
                            assert.equal(err.error, undefined);
                        });
                    });
                });
            });
        });
    });

    it('Drawing from the deck onto the face-up pile or the discard pile works and the card is revealed', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);
                assert.notEqual(response2.currentState, undefined);
                assert.notEqual(response2.currentState.deck, undefined);
                assert.notEqual(response2.currentState.faceUp, undefined);
                assert.notEqual(response2.currentState.discard, undefined);

                let count = 0;
                const deck = response2.currentState.deck;
                let pileCardValue =
                    deck.contents[deck.contents.length - 1].value;
                let discardCardValue =
                    deck.contents[deck.contents.length - 2].value;

                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Drawn from deck to faceUp
                        assert.notEqual(returnState.deck, undefined);
                        assert.notEqual(returnState.faceUp, undefined);
                        assert.equal(returnState.deck.contents.length, 51);
                        const card = returnState.faceUp.contents[0];
                        assert.equal(card.revealed, true);
                        assert.equal(card.value, pileCardValue);
                        count++;
                    } else {
                        // Drawn from deck onto discard
                        assert.notEqual(returnState.deck, undefined);
                        assert.notEqual(returnState.discard, undefined);
                        assert.equal(returnState.deck.contents.length, 50);
                        const card = returnState.discard.contents[0];
                        assert.equal(card.revealed, true);
                        assert.equal(card.value, discardCardValue);
                        done();
                    }
                });

                socket2.emit('action', code, 'D2FP', (err: any) => {
                    assert.equal(err.error, undefined);
                    socket2.emit('action', code, 'D2FD', (err: any) => {
                        assert.equal(err.error, undefined);
                    });
                });
            });
        });
    });

    it('Drawing from the deck onto the face-up pile or the discard pile works and the card is revealed', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);
                assert.notEqual(response2.currentState, undefined);
                assert.notEqual(response2.currentState.deck, undefined);
                assert.notEqual(response2.currentState.faceUp, undefined);
                assert.notEqual(response2.currentState.discard, undefined);

                let count = 0;
                const deck = response2.currentState.deck;
                let pileCardValue =
                    deck.contents[deck.contents.length - 1].value;
                let discardCardValue =
                    deck.contents[deck.contents.length - 2].value;

                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Drawn from deck to faceUp
                        assert.notEqual(returnState.deck, undefined);
                        assert.notEqual(returnState.faceUp, undefined);
                        assert.equal(returnState.deck.contents.length, 51);
                        const card = returnState.faceUp.contents[0];
                        assert.equal(card.revealed, true);
                        assert.equal(card.value, pileCardValue);
                        count++;
                    } else if (count === 1) {
                        // Drawn from deck onto discard
                        assert.notEqual(returnState.deck, undefined);
                        assert.notEqual(returnState.discard, undefined);
                        assert.equal(returnState.deck.contents.length, 50);
                        const card = returnState.discard.contents[0];
                        assert.equal(card.revealed, true);
                        assert.equal(card.value, discardCardValue);
                        count++;
                    } else if (count === 2) {
                        // Drawn from faceUp onto deck
                        assert.notEqual(returnState.deck, undefined);
                        assert.notEqual(returnState.faceUp, undefined);
                        assert.equal(returnState.deck.contents.length, 51);
                        const card =
                            returnState.deck.contents[
                                returnState.deck.contents.length - 1
                            ];
                        assert.equal(card.revealed, false);
                        assert.equal(card.value, pileCardValue);
                        count++;
                    } else {
                        // Drawn from discard onto deck
                        assert.notEqual(returnState.deck, undefined);
                        assert.notEqual(returnState.discard, undefined);
                        assert.equal(returnState.deck.contents.length, 52);
                        const card =
                            returnState.deck.contents[
                                returnState.deck.contents.length - 1
                            ];
                        assert.equal(card.revealed, false);
                        assert.equal(card.value, discardCardValue);
                        done();
                    }
                });

                socket2.emit('action', code, 'D2FP', (err: any) => {
                    assert.equal(err.error, undefined);
                    socket2.emit('action', code, 'D2FD', (err: any) => {
                        assert.equal(err.error, undefined);
                        socket2.emit('action', code, 'D2PF', (err: any) => {
                            assert.equal(err.error, undefined);
                            socket2.emit('action', code, 'D2DF', (err: any) => {
                                assert.equal(err.error, undefined);
                            });
                        });
                    });
                });
            });
        });
    });

    it('Drawing from an empty pile does nothing and returns no socket updates', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) count++;
                    else
                        throw new Error(
                            'Received too many updates where count = ' + count
                        );
                });

                socket1.emit('action', code, 'G152', (err: any) => {
                    assert.equal(err.error, undefined);
                    socket2.emit('action', code, 'D2F ', (err: any) => {
                        assert.equal(err.error, undefined);
                        socket2.emit('action', code, 'D2P ', (err: any) => {
                            assert.equal(err.error, undefined);
                            socket2.emit('action', code, 'D2D ', (err: any) => {
                                assert.equal(err.error, undefined);
                                setTimeout(() => done(), 200);
                            });
                        });
                    });
                });
            });
        });
    });
});
