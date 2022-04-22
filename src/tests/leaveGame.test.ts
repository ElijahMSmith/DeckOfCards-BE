import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

// Force createGame to run before this one
// TODO: uncomment
// require('./createGame.test');

dotenv.config();

describe('Leave game tests', function () {
    this.timeout(4000);
    // TODO: uncomment
    // it('Creator leaving terminates the game', function (done) {
    //     const socket1 = newSocket(1);

    //     socket1.emit('create', {}, (response: any) => {
    //         assert.notEqual(response, null);
    //         assert.equal(response.error, null);
    //         assert.equal(response.playerNumber, 1);
    //         assert.notEqual(response.code, null);

    //         const code = response.code;
    //         console.log(response.code);

    //         const socket2 = newSocket(2);
    //         const socket3 = newSocket(3);
    //         const socket4 = newSocket(4);

    //         let terminated2 = false;
    //         let terminated3 = false;
    //         let terminated4 = false;

    //         socket2.emit('join', code, (response2: any) => {
    //             assert.equal(response2.error, undefined);
    //             socket2.on('update', (returnState) => {
    //                 assert.equal(returnState.error, undefined);
    //                 if (returnState.terminated) terminated2 = true;
    //             });
    //         });

    //         socket3.emit('join', code, (response2: any) => {
    //             assert.equal(response2.error, undefined);
    //             socket3.on('update', (returnState) => {
    //                 assert.equal(returnState.error, undefined);
    //                 if (returnState.terminated) terminated3 = true;
    //             });
    //         });

    //         socket4.emit('join', code, (response2: any) => {
    //             assert.equal(response2.error, undefined);
    //             socket4.on('update', (returnState) => {
    //                 assert.equal(returnState.error, undefined);
    //                 if (returnState.terminated) terminated4 = true;
    //             });
    //         });

    //         setTimeout(() => {
    //             socket1.disconnect();

    //             setTimeout(() => {
    //                 assert.strictEqual(socket1.disconnected, true);
    //                 assert.strictEqual(terminated2, true);
    //                 assert.strictEqual(terminated3, true);
    //                 assert.strictEqual(terminated4, true);
    //                 done();
    //             }, 500);
    //         }, 500);
    //     });
    // });

    // it('A player leaving clears their data from the player', function (done) {
    //     const socket1 = newSocket(1);
    //     const socket2 = newSocket(2);

    //     socket1.emit('create', {}, (response: any) => {
    //         assert.notEqual(response, null);
    //         assert.equal(response.error, null);

    //         const code = response.code;
    //         let counter = 0;

    //         socket1.on('update', (returnState) => {
    //             if (counter === 0) {
    //                 assert.equal(returnState.error, undefined);
    //                 assert.equal(
    //                     returnState.player2.username,
    //                     process.env.TESTING_USERNAME_2
    //                 );
    //                 assert.notEqual(returnState.player2._id, null);
    //                 counter++;
    //             } else {
    //                 assert.equal(returnState.error, null);
    //                 assert.equal(returnState.player2.username, null);
    //                 assert.equal(returnState.player2._id, null);
    //                 done();
    //             }
    //         });

    //         socket2.emit('join', code, (returnState: any) => {
    //             assert.equal(returnState.error, undefined);

    //             setTimeout(() => {
    //                 socket2.disconnect();
    //             }, 500);
    //         });
    //     });
    // });

    it('A kicked player receives the kicked event and cannot rejoin the game', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.notEqual(response, null);
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (returnState: any) => {
                assert.equal(returnState.error, undefined);

                let resCount = 0;

                socket1.on('update', (returnState2: any) => {
                    console.log('Update:');
                    printClean(returnState2);
                    assert.equal(returnState2.error, undefined);
                    assert.notEqual(returnState2.player2, undefined);
                    assert.equal(returnState2.player2.username, null);
                    assert.equal(returnState2.player2._id, null);
                    resCount++;
                    if (resCount === 2) done();
                });

                // TODO: kicked event not being received
                socket2.on('kicked', () => {
                    console.log('Kicked!');
                    // Try to join again
                    socket2.emit('join', code, (returnState3: any) => {
                        assert.equal(
                            returnState3.error,
                            "You're not allowed to join that game!"
                        );
                        resCount++;
                        if (resCount === 2) done();
                    });
                });

                socket1.emit('action', code, 'L2K ', (returnState4: any) => {
                    assert.equal(returnState4.error, undefined);
                });
            });
        });
    });
});
