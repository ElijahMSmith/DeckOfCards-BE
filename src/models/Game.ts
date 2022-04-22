import { Rules } from './Rules';
import { Player } from './Player';
import { Card } from './Card';
import { Pile } from './Pile';
import { ReplayObject } from './ReplayObject';
import { ReturnState } from './ReturnState';
import { CardSet } from './CardSet';
import User from './User';
import Replay from './Replay';
import { printClean } from '../functions/utility';

enum PileID {
    DECK = 'F',
    FACEUP = 'P',
    DISCARD = 'D',
    HAND = 'H',
    TABLE = 'T',
}

enum Action {
    DRAW = 'D',
    PLAY = 'P',
    FLIP = 'F',
    SHUFFLE = 'S',
    JOIN = 'J',
    LEAVE = 'L',
    ABSORB = 'A',
    GIVE = 'G',
    NEW_DEALER = 'N',
    RESET = 'R',
    TERMINATE = 'T',
}

export class PlayerLogData {
    allIDs: string[];
}

export class Game {
    rules: Rules;
    currentDealer: number = 1;

    deck: Pile;
    faceUp: Pile;
    discard: Pile;

    playerState: Player[];

    actionLog: string = '';
    playerLog: PlayerLogData[];
    deckArrangementLog: string[] = [];

    blacklistedPlayers = [];

    numPlayers = 0;

    constructor(rules: Rules) {
        this.rules = rules ?? new Rules();

        this.deck = new Pile(PileID.DECK, false);
        this.faceUp = new Pile(PileID.FACEUP, true);
        this.discard = new Pile(PileID.DISCARD, true);

        // 1-13, A-M, 65-77 = hearts
        // 14-26, N-Z, 78-90 = diamonds
        // 27-39, a-m, 97-109 = clubs
        // 40-52, n-z, 110-122 = spades
        if (!rules.withoutHearts)
            for (let i = 65; i <= 77; i++)
                this.deck.insertCard(new Card(String.fromCharCode(i)));
        if (!rules.withoutDiamonds)
            for (let i = 78; i <= 90; i++)
                this.deck.insertCard(new Card(String.fromCharCode(i)));
        if (!rules.withoutClubs)
            for (let i = 97; i <= 109; i++)
                this.deck.insertCard(new Card(String.fromCharCode(i)));
        if (!rules.withoutSpades)
            for (let i = 110; i <= 122; i++)
                this.deck.insertCard(new Card(String.fromCharCode(i)));

        if (rules.jokersEnabled) {
            this.deck.insertCard(new Card('+'));
            this.deck.insertCard(new Card('-'));
        }

        this.deck.shuffle();
        this.deckArrangementLog.push(this.deck.toString());

        this.playerState = [
            new Player(),
            new Player(),
            new Player(),
            new Player(),
            new Player(),
            new Player(),
            new Player(),
            new Player(),
        ];

        this.playerLog = [
            { allIDs: [] },
            { allIDs: [] },
            { allIDs: [] },
            { allIDs: [] },
            { allIDs: [] },
            { allIDs: [] },
            { allIDs: [] },
            { allIDs: [] },
        ];
    }

    getCurrentState(): ReturnState {
        return {
            terminated: false,

            deck: this.deck,
            faceUp: this.faceUp,
            discard: this.discard,

            player1: this.playerState[1 - 1],
            player2: this.playerState[2 - 1],
            player3: this.playerState[3 - 1],
            player4: this.playerState[4 - 1],
            player5: this.playerState[5 - 1],
            player6: this.playerState[6 - 1],
            player7: this.playerState[7 - 1],
            player8: this.playerState[8 - 1],

            currentDealer: this.currentDealer,
            rules: this.rules,
        };
    }

    async performAction(action: string): Promise<ReturnState> {
        console.log('Action performed: "' + action + '"');
        this.actionLog += action;
        const args = action.split('');

        switch (args[0].toUpperCase()) {
            case Action.PLAY:
                return this.playCard(args);
            case Action.DRAW:
                return this.drawCard(args);
            case Action.FLIP:
                return this.flipCard(args);
            case Action.SHUFFLE:
                return this.shuffleCards(args);
            case Action.JOIN:
                return this.playerJoin(args);
            case Action.LEAVE:
                return this.playerLeave(args);
            case Action.ABSORB:
                return this.absorbCards(args);
            case Action.GIVE:
                return this.dealCards(args);
            case Action.NEW_DEALER:
                return this.newDealer(args);
            case Action.RESET:
                return this.resetGame();
            case Action.TERMINATE:
                return await this.terminateGame();
        }
        return null;
    }

    playCard(args: string[]): ReturnState {
        // 1-8, the player number who is playing the card
        const playerNum = Number(args[1]);
        const playerObj = this.playerState[playerNum - 1];
        // a-zA-Z+-, the character representing the card
        const cardID = args[2];
        // 1-8 if giving to another player,
        // F (face-down deck), P (face-up pile), or D (discard),
        // H (move to hand), T (move to table)
        const destinationID = args[3].toUpperCase();

        let destSet: CardSet;
        let returnObj: ReturnState = {};
        let showing = false;
        if (isNumeric(destinationID)) {
            const destPlayerNum = parseInt(destinationID);
            const destPlayerObj = this.playerState[destPlayerNum - 1];
            destSet = destPlayerObj.hand;
            returnObj[`player${destPlayerNum}`] = destPlayerObj;
        } else {
            console.log('Switching ' + destinationID);
            printClean(playerObj);
            switch (destinationID) {
                case PileID.DECK:
                    console.log('Deck');
                    destSet = this.deck;
                    returnObj.deck = this.deck;
                    showing = false;
                    break;
                case PileID.FACEUP:
                    console.log('FaceUp');
                    destSet = this.faceUp;
                    returnObj.faceUp = this.faceUp;
                    showing = true;
                    break;
                case PileID.DISCARD:
                    console.log('Discard');
                    destSet = this.discard;
                    returnObj.discard = this.discard;
                    showing = true;
                    break;
                case PileID.HAND:
                    console.log('Hand');
                    destSet = playerObj.hand;
                    break;
                case PileID.TABLE:
                    console.log('Table');
                    destSet = playerObj.table;
                    break;
            }
        }

        console.log(
            destinationID,
            ' = ',
            PileID.HAND,
            ' ? ',
            destinationID === PileID.HAND
        );

        console.log('Before removing: ');
        printClean(playerObj);
        console.log('Playing to (pre-removed version of pile if same): ');
        printClean(destSet);

        const card = playerObj.removeCard(cardID);
        if (!card) return null;

        console.log(card.value);
        console.log('After removing: ');
        printClean(playerObj);

        // If playing to the table, hide it if rule tells us to
        // Otherwise, only show if card is already showing
        if (destinationID === PileID.TABLE) {
            if (this.rules.playFacedDown) showing = false;
            else showing = card.revealed;
        } else if (destinationID === PileID.HAND) showing = card.revealed;

        destSet.insertCard(card, showing);
        returnObj[`player${playerNum}`] = playerObj;

        console.log('After inserting: ');
        printClean(playerObj);

        return returnObj;
    }

    drawCard(args: string[]): ReturnState {
        const playerNum = parseInt(args[1]);
        const pileID = args[2];
        const destinationPile = args[3];

        let drawnCard: Card;
        let returnObj: ReturnState = {};

        if (pileID === PileID.DECK) {
            drawnCard = this.deck.removeFromTop();
            returnObj.deck = this.deck;
        } else if (pileID === PileID.FACEUP) {
            drawnCard = this.faceUp.removeFromTop();
            returnObj.faceUp = this.faceUp;
        } else if (pileID === PileID.DISCARD) {
            drawnCard = this.discard.removeFromTop();
            returnObj.discard = this.discard;
        } else {
            return null;
        }

        if (!drawnCard) return null;

        if (destinationPile === PileID.DECK) {
            this.deck.addToTop(drawnCard);
            returnObj.deck = this.deck;
        } else if (destinationPile === PileID.FACEUP) {
            this.faceUp.addToTop(drawnCard);
            returnObj.faceUp = this.faceUp;
        } else if (destinationPile === PileID.DISCARD) {
            this.discard.addToTop(drawnCard);
            returnObj.discard = this.discard;
        } else {
            // Goes into the same player's hand
            const playerObj = this.playerState[playerNum - 1];
            playerObj.receiveCard(drawnCard);
            returnObj[`player${playerNum}`] = playerObj;
        }

        return returnObj;
    }

    flipCard(args: string[]): ReturnState {
        const playerNum = parseInt(args[1]);
        const cardID = args[2];

        const playerObj = this.playerState[playerNum - 1];

        let found = playerObj.hand.toggleCard(cardID);
        if (!found) found = playerObj.table.toggleCard(cardID);
        if (!found) return null;

        return {
            [`player${playerNum}`]: playerObj,
        };
    }

    shuffleCards(args: string[]): ReturnState {
        const returnObj: ReturnState = {};

        for (let i = 1; i <= 2; i++) {
            const otherPile = args[i];
            if (otherPile === PileID.FACEUP) {
                this.faceUp.combineInto(this.deck);
                returnObj.faceUp = this.faceUp;
            } else if (otherPile === PileID.DISCARD) {
                this.discard.combineInto(this.deck);
                returnObj.discard = this.discard;
            } // else -> blank
        }

        this.deck.shuffle();
        this.deckArrangementLog.push(this.deck.toString());
        returnObj.deck = this.deck;

        return returnObj;
    }

    // This action should be performed by the server
    // The server receives the socket connection and logs the uuid to the first vacant position
    // This function updates the player object for that respective position
    playerJoin(args: string[]): ReturnState {
        const playerNum = parseInt(args[1]);
        const playerObj = this.playerState[playerNum - 1];
        this.numPlayers++;

        return {
            [`player${playerNum}`]: playerObj,
        };
    }

    playerLeave(args: string[]): ReturnState {
        const returnObj: ReturnState = {};
        const playerNum = parseInt(args[1]);
        const playerObj = this.playerState[playerNum - 1];

        if (args[2] === 'K') this.blacklistedPlayers.push(playerObj._id);

        const returnedCards = playerObj.cleanUp(this.rules.autoAbsorbCards);
        if (returnedCards) {
            returnedCards.combineInto(this.discard);
            returnObj.discard = this.discard;
        }

        // If the current dealer is the one who left,
        // Find another player to be dealer
        if (playerNum === this.currentDealer) {
            let i = 1;
            for (; i <= 8; i++) if (!this.playerState[i - 1].vacant()) break;
            returnObj.currentDealer = this.currentDealer = i;
        }

        this.numPlayers--;

        // Terminate the game is the game owner leaves
        if (playerNum === 1) {
            this.terminateGame();
            return { terminated: true };
        }

        returnObj[`player${playerNum}`] = playerObj;
        return returnObj;
    }

    absorbCards(args: string[]): ReturnState {
        const playerNum = parseInt(args[1]);
        const playerObj = this.playerState[playerNum - 1];

        const returnedCards = playerObj.absorbCards();
        returnedCards.combineInto(this.discard);

        return {
            discard: this.discard,
            [`player${playerNum}`]: playerObj,
        };
    }

    dealCards(args: string[]): ReturnState {
        const returnObj: ReturnState = {};

        // 0 for all, or 1-8
        const toPlayer = parseInt(args[1]);
        // deal as many cards <= numCards as the deck has
        let numCards = parseInt(args[2] + args[3]);

        if (numCards == NaN) return null;
        if (this.rules.excludeDealer && this.numPlayers === 1) return null;

        if (toPlayer === 0) {
            // All players
            let pnum = this.currentDealer;
            numCards *= this.numPlayers - (this.rules.excludeDealer ? 1 : 0);

            while (this.deck.size() !== 0 && numCards > 0) {
                // Go to next player
                pnum++;
                if (pnum > 8) pnum = 1;

                // If that slot is empty or is the dealer who should be excluded, skip them
                if (
                    this.playerState[pnum - 1].vacant() ||
                    (this.rules.excludeDealer && this.currentDealer === pnum)
                )
                    continue;

                // Otherwise, give them the top card in the deck
                this.playerState[pnum - 1].receiveCard(
                    this.deck.removeFromTop()
                );
                numCards--;
            }

            for (let i = 1; i <= 8; i++)
                returnObj[`player${i}`] = this.playerState[i - 1];
        } else {
            // Single player
            const playerObj = this.playerState[toPlayer - 1];
            while (this.deck.size() !== 0 && numCards > 0) {
                const topCard = this.deck.removeFromTop();
                playerObj.receiveCard(topCard);
                numCards--;
            }

            returnObj[`player${toPlayer}`] = this.playerState[toPlayer - 1];
        }

        returnObj.deck = this.deck;
        this.deckArrangementLog.push(this.deck.toString());
        return returnObj;
    }

    newDealer(args: string[]): ReturnState {
        const newPlayerNum = parseInt(args[1]);
        this.currentDealer = newPlayerNum;

        return {
            currentDealer: this.currentDealer,
        };
    }

    resetGame(): ReturnState {
        for (let i = 1; i <= 8; i++) {
            const playerObj = this.playerState[i - 1];
            playerObj.hand.combineInto(this.deck);
            playerObj.table.combineInto(this.deck);
        }

        this.faceUp.combineInto(this.deck);
        this.discard.combineInto(this.deck);

        this.deck.hideAll();
        this.deck.shuffle();
        this.deckArrangementLog.push(this.deck.toString());

        return {
            deck: this.deck,
            faceUp: this.faceUp,
            discard: this.discard,
            player1: this.playerState[0],
            player2: this.playerState[1],
            player3: this.playerState[2],
            player4: this.playerState[3],
            player5: this.playerState[4],
            player6: this.playerState[5],
            player7: this.playerState[6],
            player8: this.playerState[7],
        };
    }

    async terminateGame(): Promise<ReturnState> {
        const replayObj = new ReplayObject(
            this.playerLog,
            this.deckArrangementLog,
            this.actionLog,
            this.rules
        );

        const replayDoc = new Replay(replayObj, true);
        await replayDoc.save();
        const replayID = replayDoc._id;

        console.log('Saved replay with _id ' + replayID);

        for (let pnum = 1; pnum <= 8; pnum++) {
            const allIDs = this.playerLog[pnum - 1].allIDs;
            for (let pid of allIDs) {
                console.log('Finding user with _id ' + pid);
                try {
                    User.findOne({
                        _id: pid,
                    }).exec(function (err, user) {
                        if (err) {
                            console.log(
                                'Could not save replay to user document\n' + err
                            );
                        } else {
                            console.log('Found!');
                            const userReplays = user.replays;

                            if (userReplays.length >= 5)
                                userReplays.splice(
                                    0,
                                    userReplays.length - 5 + 1
                                );

                            userReplays.push(replayID); // Add to end

                            console.log('Updated replays array to be ');
                            printClean(userReplays);

                            user.save();
                        }
                    });
                } catch (error) {
                    console.log(
                        'Adding replay to user failed: not find user with id ' +
                            pid
                    );
                }
            }
        }

        return { terminated: true };
    }

    firstOpenPosition(): number {
        for (let i = 1; i <= 8; i++)
            if (this.playerState[i - 1].vacant()) return i;
        return -1;
    }

    getPlayerPositionByID(pid: string): number {
        for (let i = 1; i <= 8; i++)
            if (this.playerState[i - 1]._id === pid) return i;
        return -1;
    }

    toString(): string {
        return `
            Deck: '${this.deck.toString()}'
            FaceUp: '${this.faceUp.toString()}'
            Discard: '${this.discard.toString()}'

            Player1:
            Hand:  '${this.playerState[1 - 1].hand.toString()}'
            Table: '${this.playerState[1 - 1].table.toString()}'
            Player2:
            Hand:  '${this.playerState[2 - 1].hand.toString()}'
            Table: '${this.playerState[2 - 1].table.toString()}'
            Player3:
            Hand:  '${this.playerState[3 - 1].hand.toString()}'
            Table: '${this.playerState[3 - 1].table.toString()}'
            Player4:
            Hand:  '${this.playerState[4 - 1].hand.toString()}'
            Table: '${this.playerState[4 - 1].table.toString()}'
            Player5:
            Hand:  '${this.playerState[5 - 1].hand.toString()}'
            Table: '${this.playerState[5 - 1].table.toString()}'
            Player6:
            Hand:  '${this.playerState[6 - 1].hand.toString()}'
            Table: '${this.playerState[6 - 1].table.toString()}'
            Player7:
            Hand:  '${this.playerState[7 - 1].hand.toString()}'
            Table: '${this.playerState[7 - 1].table.toString()}'
            Player8:
            Hand:  '${this.playerState[8 - 1].hand.toString()}'
            Table: '${this.playerState[8 - 1].table.toString()}'
            `;
    }
}

function isNumeric(value: string) {
    return /^-?\d+$/.test(value);
}

export default Game;
