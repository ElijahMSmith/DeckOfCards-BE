import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

describe('Reset Cards Tests', function () {
    this.timeout(4000);

    it('Resetting puts all cards in the deck and hides them', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);
        const socket3 = newSocket(3);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                socket3.emit('join', code, (response3: any) => {
                    assert.equal(response3.error, null);

                    let count = 0;
                    socket2.on('update', (returnState) => {
                        assert.equal(returnState.error, undefined);
                        if (count === 0) {
                            // Give three to all players hands
                            count++;
                            socket2.emit('action', code, `D2FP`, (err: any) => {
                                assert.equal(err.error, undefined);
                            });
                        } else if (count === 1) {
                            // Draw card from deck to faceup
                            count++;
                            socket2.emit('action', code, `D2FD`, (err: any) => {
                                assert.equal(err.error, undefined);
                            });
                        } else if (count === 2) {
                            // Draw card from deck to discard
                            count++;
                            socket2.emit('action', code, `R   `, (err: any) => {
                                assert.equal(err.error, undefined);
                            });
                        } else {
                            /*
                            Reset game - check all of the following:
                                - No cards in any player's hands
                                - No cards in any pile other than the deck
                                - All cards in deck are hidden
                            */
                            for (let i = 1; i <= 8; i++) {
                                const playerObj = returnState[`player${i}`];
                                assert.notEqual(playerObj, undefined);
                                assert.notEqual(playerObj.hand, undefined);
                                assert.equal(playerObj.hand.contents.length, 0);
                                assert.notEqual(playerObj.table, undefined);
                                assert.equal(
                                    playerObj.table.contents.length,
                                    0
                                );
                            }

                            assert.notEqual(returnState.faceUp, undefined);
                            assert.equal(returnState.faceUp.contents.length, 0);
                            assert.notEqual(returnState.discard, undefined);
                            assert.equal(
                                returnState.discard.contents.length,
                                0
                            );

                            assert.notEqual(returnState.deck, undefined);
                            assert.equal(returnState.deck.contents.length, 52);
                            for (let card of returnState.deck.contents)
                                assert.equal(card.revealed, false);

                            done();
                        }
                    });
                });

                socket1.emit('action', code, 'G003', (err: any) => {
                    assert.equal(err.error, undefined);
                });
            });
        });
    });
});
