import dotenv = require('dotenv');
import assert from 'assert';
import { newSocket, printClean } from '../functions/utility';

dotenv.config();

describe('Absorb Cards Tests', function () {
    this.timeout(4000);

    it("All cards from the player's hand and table are placed into the discard pile", function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', {}, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                const p2Cards = [];
                socket2.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    printClean(returnState);
                    if (count === 0) {
                        // Dealt out 5 cards to each player
                        assert.equal(
                            returnState.player1.hand.contents.length,
                            5
                        );

                        const hand = returnState.player2.hand;
                        assert.equal(hand.contents.length, 5);

                        for (let card of hand.contents)
                            p2Cards.push(card.value);

                        console.log(p2Cards);

                        count++;
                    } else if (count === 1) {
                        const discard = returnState.discard;
                        assert.notEqual(discard, undefined);

                        const found = [];
                        for (let card of discard.contents) {
                            let index = p2Cards.indexOf(card.value);
                            if (index !== -1) found.push(p2Cards[index]);
                        }

                        assert.equal(found.length, 5);
                        console.log(found);
                        done();
                    }
                });

                socket1.emit('action', code, 'G005', (err: any) =>
                    assert.equal(err.error, undefined)
                );

                setTimeout(
                    () =>
                        socket1.emit('action', code, 'A2  ', (err: any) =>
                            assert.equal(err.error, undefined)
                        ),
                    200
                );
            });
        });
    });

    it('Players that leave have their cards absorbed when the respective rule is set', function (done) {
        const socket1 = newSocket(1);
        const socket2 = newSocket(2);

        socket1.emit('create', { autoAbsorbCards: true }, (response: any) => {
            assert.equal(response.error, null);
            const code = response.code;

            socket2.emit('join', code, (response2: any) => {
                assert.equal(response2.error, null);

                let count = 0;
                const p2Cards = [];
                socket1.on('update', (returnState) => {
                    assert.equal(returnState.error, undefined);
                    if (count === 0) {
                        // Dealt out 5 cards to each player
                        assert.equal(
                            returnState.player1.hand.contents.length,
                            5
                        );

                        const hand = returnState.player2.hand;
                        assert.equal(hand.contents.length, 5);

                        for (let card of hand.contents)
                            p2Cards.push(card.value);

                        console.log(p2Cards);

                        count++;
                    } else if (count === 1) {
                        const discard = returnState.discard;
                        assert.notEqual(discard, undefined);

                        const found = [];
                        for (let card of discard.contents) {
                            let index = p2Cards.indexOf(card.value);
                            if (index !== -1) found.push(p2Cards[index]);
                        }

                        assert.equal(found.length, 5);
                        console.log(found);
                        done();
                    }
                });

                socket1.emit('action', code, 'G005', (err: any) =>
                    assert.equal(err.error, undefined)
                );

                setTimeout(() => socket2.disconnect(), 200);
            });
        });
    });
});
