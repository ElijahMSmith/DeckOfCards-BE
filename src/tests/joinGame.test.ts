import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

// Force createGame to run before this one
require('./createGame.test');

dotenv.config();

describe('Join game tests', function () {
    this.timeout(4000);
    it('Other player can join game', function (done) {
        const socket1 = newSocket(1);

        socket1.emit('create', {}, (response: any) => {
            assert.notEqual(response, null);
            assert.equal(response.error, null);
            assert.equal(response.playerNumber, 1);
            assert.notEqual(response.code, null);

            const code = response.code;

            const socket2 = newSocket(2);
            const socket3 = newSocket(3);
            const socket4 = newSocket(4);

            socket4.emit('join', code, (response2: any) => {
                assert.notEqual(response2, null);
                assert.equal(response2.error, undefined);

                socket2.emit('join', code, (response3: any) => {
                    assert.notEqual(response3, null);
                    assert.equal(response3.error, undefined);
                    assert.equal(response3.playerNumber, 3);

                    socket3.emit('join', code, (response4: any) => {
                        assert.notEqual(response4, null);
                        assert.equal(response4.error, undefined);
                        assert.equal(response4.playerNumber, 4);

                        socket1.disconnect();
                        socket2.disconnect();
                        socket3.disconnect();
                        socket4.disconnect();

                        done();
                    });
                });
            });
        });
    });

    it('A joining player is placed at the highest available open slot', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);
        const socket3 = newSocket(3);
        const socket4 = newSocket(4);

        socket1.emit('create', {}, (response: any) => {
            assert.notEqual(response, null);
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (returnState2: any) => {
                assert.equal(returnState2.error, undefined);
                socket3.emit('join', code, (returnState3: any) => {
                    assert.equal(returnState3.error, undefined);
                    socket2.disconnect();
                    setTimeout(() => {
                        socket4.emit('join', code, (returnState4: any) => {
                            assert.equal(returnState4.error, undefined);
                            assert.equal(returnState4.playerNumber, 2);
                            assert.equal(
                                returnState4.currentState.player2.username,
                                process.env.TESTING_USERNAME_4
                            );
                            done();
                        });
                    }, 500);
                });
            });
        });
    });
});
