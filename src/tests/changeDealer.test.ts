import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

describe('Change Dealer Tests', function () {
    this.timeout(4000);

    it('Changing the dealer updates currentDealer in the game state', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            printClean(response);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    assert.equal(returnState.currentDealer, 2);
                    done();
                });

                socket1.emit('action', code, 'N2  ', (err: any) =>
                    assert.equal(err.error, undefined)
                );
            });
        });
    });
});
