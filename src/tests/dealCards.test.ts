import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

describe('Deal Cards Tests', function () {
    this.timeout(4000);

    it('Dealing to all players will give an equal number of cards to each if enough cards exist', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);
        const socket3 = newSocket(3);
        const socket4 = newSocket(4);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count < 2) count++;
                    else {
                        printClean(returnState);
                        assert.equal(returnState.error, undefined);
                        assert.notEqual(returnState.player1, undefined);
                        assert.equal(
                            returnState.player1.hand.contents.length,
                            13
                        );
                        assert.notEqual(returnState.player2, undefined);
                        assert.equal(
                            returnState.player2.hand.contents.length,
                            13
                        );
                        assert.notEqual(returnState.player3, undefined);
                        assert.equal(
                            returnState.player3.hand.contents.length,
                            13
                        );
                        assert.notEqual(returnState.player4, undefined);
                        assert.equal(
                            returnState.player4.hand.contents.length,
                            13
                        );
                        done();
                    }
                });

                socket3.emit('join', code, (response3: any) => {
                    assert.equal(response3.error, null);
                    socket4.emit('join', code, (response4: any) => {
                        assert.equal(response4.error, null);
                        socket1.emit('action', code, 'G013', (err: any) =>
                            assert.equal(err.error, undefined)
                        );
                    });
                });
            });
        });
    });

    it('Dealing to all players more total cards than the deck has correctly splits the remaining cards', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);
        const socket3 = newSocket(3);
        const socket4 = newSocket(4);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count < 2) count++;
                    else if (count == 2) {
                        assert.equal(returnState.error, undefined);
                        assert.notEqual(returnState.player1, undefined);
                        assert.equal(
                            returnState.player1.hand.contents.length,
                            46
                        );
                        count++;
                    } else {
                        assert.equal(returnState.error, undefined);
                        assert.notEqual(returnState.player1, undefined);
                        assert.equal(
                            returnState.player1.hand.contents.length,
                            47
                        );
                        assert.notEqual(returnState.player2, undefined);
                        assert.equal(
                            returnState.player2.hand.contents.length,
                            2
                        );
                        assert.notEqual(returnState.player3, undefined);
                        assert.equal(
                            returnState.player3.hand.contents.length,
                            2
                        );
                        assert.notEqual(returnState.player4, undefined);
                        assert.equal(
                            returnState.player4.hand.contents.length,
                            1
                        );
                        done();
                    }
                });

                socket3.emit('join', code, (response3: any) => {
                    assert.equal(response3.error, null);
                    socket4.emit('join', code, (response4: any) => {
                        assert.equal(response4.error, null);
                        socket1.emit('action', code, 'G146', (err: any) => {
                            assert.equal(err.error, undefined);
                            socket1.emit('action', code, 'G05', (err2: any) => {
                                assert.equal(err2.error, undefined);
                            });
                        });
                    });
                });
            });
        });
    });

    it('Dealing more cards than are in the deck to one player gives them all remaining cards', function (done) {
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
                    if (count === 0) {
                        assert.equal(returnState.error, undefined);
                        assert.notEqual(returnState.player1, undefined);
                        assert.equal(
                            returnState.player1.hand.contents.length,
                            30
                        );
                        count++;
                    } else {
                        assert.equal(returnState.error, undefined);
                        assert.notEqual(returnState.player2, undefined);
                        assert.equal(
                            returnState.player2.hand.contents.length,
                            22
                        );
                        done();
                    }
                });

                socket1.emit('action', code, 'G130', (err: any) => {
                    assert.equal(err.error, undefined);
                    socket1.emit('action', code, 'G230', (err2: any) => {
                        assert.equal(err2.error, undefined);
                    });
                });
            });
        });
    });

    it('Dealing to all with excludeDealer will not give them any additional cards', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);
        const socket3 = newSocket(3);
        const socket4 = newSocket(4);

        socket1.emit('create', { excludeDealer: true }, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count < 2) count++;
                    else {
                        printClean(returnState);
                        assert.equal(returnState.error, undefined);
                        assert.notEqual(returnState.player1, undefined);
                        assert.equal(
                            returnState.player1.hand.contents.length,
                            0
                        );
                        assert.notEqual(returnState.player2, undefined);
                        assert.equal(
                            returnState.player2.hand.contents.length,
                            13
                        );
                        assert.notEqual(returnState.player3, undefined);
                        assert.equal(
                            returnState.player3.hand.contents.length,
                            13
                        );
                        assert.notEqual(returnState.player4, undefined);
                        assert.equal(
                            returnState.player4.hand.contents.length,
                            13
                        );
                        assert.notEqual(returnState.deck, undefined);
                        assert.equal(returnState.deck.contents.length, 13);
                        done();
                    }
                });

                socket3.emit('join', code, (response3: any) => {
                    assert.equal(response3.error, null);
                    socket4.emit('join', code, (response4: any) => {
                        assert.equal(response4.error, null);
                        socket1.emit('action', code, 'G013', (err: any) =>
                            assert.equal(err.error, undefined)
                        );
                    });
                });
            });
        });
    });
});
