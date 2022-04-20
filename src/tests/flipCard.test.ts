import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

describe('Reveal Cards Tests', function () {
    this.timeout(4000);

    /*
    Cards showing in hand that are played to the table are still showing
    Cards played to the table with the faceDown rule set are hidden, even if they were originally showing
    */

    it('Cards in hand and table start unrevealed, can be shown, then can be hidden again', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                let cardVal0, cardVal1;
                socket2.on('update', (returnState) => {
                    console.log(count);
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Given two cards to hand
                        assert.notEqual(returnState.player2, undefined);
                        let cardVal0 =
                            returnState.player2.hand.contents[0].value;
                        let cardVal1 =
                            returnState.player2.hand.contents[1].value;
                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `P2${cardVal0}T`,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 1) {
                        // Placed one card onto the table
                        assert.notEqual(returnState.player2, undefined);
                        const handCard = returnState.player2.hand.contents[0];
                        const tableCard = returnState.player2.table.contents[0];
                        assert.notEqual(handCard, undefined);
                        assert.notEqual(tableCard, undefined);
                        assert.equal(handCard.value, cardVal1);
                        assert.equal(tableCard.value, cardVal0);
                        assert.equal(handCard.revealed, false);
                        assert.equal(tableCard.revealed, false);

                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `F2${cardVal1} `,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 2) {
                        // Revealed hand card
                        assert.notEqual(returnState.player2, undefined);
                        const handCard = returnState.player2.hand.contents[0];
                        const tableCard = returnState.player2.table.contents[0];
                        assert.notEqual(handCard, undefined);
                        assert.notEqual(tableCard, undefined);
                        assert.equal(handCard.value, cardVal1);
                        assert.equal(tableCard.value, cardVal0);
                        assert.equal(handCard.revealed, true);
                        assert.equal(tableCard.revealed, false);

                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `F2${cardVal0} `,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 3) {
                        // Revealed table card
                        assert.notEqual(returnState.player2, undefined);
                        const handCard = returnState.player2.hand.contents[0];
                        const tableCard = returnState.player2.table.contents[0];
                        assert.notEqual(handCard, undefined);
                        assert.notEqual(tableCard, undefined);
                        assert.equal(handCard.value, cardVal1);
                        assert.equal(tableCard.value, cardVal0);
                        assert.equal(handCard.revealed, true);
                        assert.equal(tableCard.revealed, true);

                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `F2${cardVal1} `,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else if (count === 4) {
                        // Hidden hand card
                        assert.notEqual(returnState.player2, undefined);
                        const handCard = returnState.player2.hand.contents[0];
                        const tableCard = returnState.player2.table.contents[0];
                        assert.notEqual(handCard, undefined);
                        assert.notEqual(tableCard, undefined);
                        assert.equal(handCard.value, cardVal1);
                        assert.equal(tableCard.value, cardVal0);
                        assert.equal(handCard.revealed, false);
                        assert.equal(tableCard.revealed, true);

                        count++;
                        socket2.emit(
                            'action',
                            code,
                            `F2${cardVal0} `,
                            (err: any) => {
                                assert.equal(err.error, undefined);
                            }
                        );
                    } else {
                        // Hidden table card
                        assert.notEqual(returnState.player2, undefined);
                        const handCard = returnState.player2.hand.contents[0];
                        const tableCard = returnState.player2.table.contents[0];
                        assert.notEqual(handCard, undefined);
                        assert.notEqual(tableCard, undefined);
                        assert.equal(handCard.value, cardVal1);
                        assert.equal(tableCard.value, cardVal0);
                        assert.equal(handCard.revealed, false);
                        assert.equal(tableCard.revealed, false);

                        done();
                    }
                });

                socket2.emit('action', code, 'G202', (err: any) => {
                    assert.equal(err.error, undefined);
                });
            });
        });
    });
});
