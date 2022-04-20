import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

describe('Play Cards Tests', function () {
    this.timeout(4000);

    it('Playing a card onto each of the three piles works', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                let cardVal0, cardVal1, cardVal2;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Given two cards to hand
                        assert.notEqual(returnState.player2, undefined);
                        cardVal0 = returnState.player2.hand.contents[0].value;
                        cardVal1 = returnState.player2.hand.contents[1].value;
                        cardVal2 = returnState.player2.hand.contents[2].value;
                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `F2${cardVal0} `,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 1) {
                        // Revealed card bound for deck
                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `P2${cardVal0}F`,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 2) {
                        // Card played to deck
                        assert.notEqual(returnState.deck, undefined);
                        const card =
                            returnState.deck.contents[
                                returnState.deck.contents.length - 1
                            ];
                        assert.notEqual(card, undefined);
                        assert.equal(card.revealed, false);
                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `P2${cardVal1}P`,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 3) {
                        // Card played to faceUp
                        assert.notEqual(returnState.faceUp, undefined);
                        const card = returnState.faceUp.contents[0];
                        assert.notEqual(card, undefined);
                        assert.equal(card.revealed, true);
                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `P2${cardVal2}D`,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else {
                        // Final card played to discard
                        assert.notEqual(returnState.discard, undefined);
                        const card = returnState.discard.contents[0];
                        assert.notEqual(card, undefined);
                        assert.equal(card.revealed, true);
                        done();
                    }
                });

                socket2.emit('action', code, 'G203', (err: any) => {
                    assert.equal(err.error, undefined);
                });
            });
        });
    });

    it('Playing a card to another player gives them the card in their hand, hidden', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                let cardVal;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Given one card to hand
                        assert.notEqual(returnState.player2, undefined);
                        const card = returnState.player2.hand.contents[0];
                        assert.notEqual(card, undefined);
                        cardVal = card.value;
                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `F2${cardVal} `,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 1) {
                        // Revealed the card
                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `P2${cardVal}1`,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else {
                        // Given to another player
                        assert.notEqual(returnState.player1, undefined);
                        assert.notEqual(returnState.player2, undefined);

                        const card = returnState.player1.hand.contents[0];
                        assert.notEqual(card, undefined);
                        assert.equal(card.revealed, false);
                        assert.equal(card.value, cardVal);

                        assert.equal(
                            returnState.player2.hand.contents.length,
                            0
                        );

                        done();
                    }
                });

                socket2.emit('action', code, 'G201', (err: any) => {
                    assert.equal(err.error, undefined);
                });
            });
        });
    });

    it("A card can be played from a user's hand to their table cards and vice versa", function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                let cardVal;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Given one card to hand
                        assert.notEqual(returnState.player2, undefined);
                        const card = returnState.player2.hand.contents[0];
                        assert.notEqual(card, undefined);
                        cardVal = card.value;

                        socket2.emit(
                            'action',
                            code,
                            `P2${cardVal}T`,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                        count++;
                    } else if (count === 1) {
                        // Played to table
                        assert.notEqual(returnState.player2, undefined);
                        const card = returnState.player2.table.contents[0];
                        assert.notEqual(card, undefined);
                        assert.equal(card.revealed, false);
                        assert.equal(card.value, cardVal);

                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `P2${cardVal}H`,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else {
                        // Played to hand
                        assert.notEqual(returnState.player2, undefined);
                        const card = returnState.player2.hand.contents[0];
                        assert.notEqual(card, undefined);
                        assert.equal(card.revealed, false);
                        assert.equal(card.value, cardVal);

                        done();
                    }
                });

                socket2.emit('action', code, 'G201', (err: any) => {
                    assert.equal(err.error, undefined);
                });
            });
        });
    });
});
