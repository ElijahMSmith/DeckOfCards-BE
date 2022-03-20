import { Rules } from './Rules';
import { Player } from './Player';
import { Card } from './Card';
import { Pile } from './Pile';
import { ReplayObject } from './ReplayObject';
import { ReturnState } from './ReturnState';
import { CardSet } from './CardSet';

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
    REVEAL = 'F',
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
    started: boolean = false;
    gameOwner: string;
    rules: Rules;

    deck: Pile;
    faceUp: Pile;
    discard: Pile;

    playerState: Player[];

    actionLog: string;
    playerLog: PlayerLogData[];
    deckArrangementLog: string[] = [];

    constructor(rules: Rules, gameOwner: string) {
        this.rules = rules;
        this.gameOwner = gameOwner;

        this.deck = new Pile(PileID.DECK);
        this.faceUp = new Pile(PileID.FACEUP, true);
        this.discard = new Pile(PileID.DISCARD);

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

        this.deck.shuffle(5 * this.deck.length());
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

    performAction(action: string): ReturnState {
        // TODO: Take each action and call the function to perform it
        const args = action.split('');

        switch (args[0].toUpperCase()) {
            case Action.PLAY:
                return this.playCard(args);
            case Action.DRAW:
                return this.drawCard(args);
            case Action.REVEAL:
                return this.revealCard(args);
            case Action.SHUFFLE:
                return this.shuffleCards(args);
            case Action.JOIN:
                return this.playerJoin(args);
            case Action.LEAVE:
                return this.playerLeave(args);
            case Action.ABSORB:
                return this.absorbCards(args);
            case Action.GIVE:
                return this.giveCards(args);
            case Action.NEW_DEALER:
                return this.newDealer(args);
            case Action.RESET:
                return this.resetGame();
            case Action.TERMINATE:
                return this.terminateGame();
            default:
                return null;
        }
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
        if (isNumeric(destinationID)) {
            const destPlayerNum = parseInt(destinationID);
            const destPlayerObj = this.playerState[destPlayerNum - 1];
            destSet = destPlayerObj.hand;
            returnObj[`player${destPlayerNum}`] = destPlayerObj;
        } else {
            switch (destinationID) {
                case PileID.DECK:
                    destSet = this.deck;
                    returnObj.deck = this.deck;
                case PileID.FACEUP:
                    destSet = this.faceUp;
                    returnObj.faceUp = this.faceUp;
                case PileID.DISCARD:
                    destSet = this.discard;
                    returnObj.discard = this.discard;
                case PileID.HAND:
                    destSet = playerObj.hand;
                case PileID.TABLE:
                    destSet = playerObj.table;
            }
        }

        const card = playerObj.removeCard(cardID);
        if (!card) return null;

        returnObj[`player${playerNum}`] = playerObj;

        destSet.insertCard(card);

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
            drawnCard.revealed = false;
            this.deck.addToTop(drawnCard);
            returnObj.deck = this.deck;
        } else if (destinationPile === PileID.FACEUP) {
            drawnCard.revealed = true;
            this.faceUp.addToTop(drawnCard);
            returnObj.faceUp = this.faceUp;
        } else if (destinationPile === PileID.DISCARD) {
            drawnCard.revealed = true;
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

    revealCard(args: string[]): ReturnState {
        const playerNum = parseInt(args[1]);
        const cardID = args[2];

        const playerObj = this.playerState[playerNum - 1];

        let found = playerObj.hand.revealCard(cardID);
        if (!found) found = playerObj.table.revealCard(cardID);
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

    playerJoin(args: string[]): ReturnState {
        const returnObj: ReturnState = {};

        // TODO: Handle player transaction

        return returnObj;
    }

    // TODO: Make a google doc cheat sheet for all game actions with the modifications and share
    /*
        playerJoin(args: string[])
        playerLeave(args: string[])
        absorbCards(args: string[])
        giveCards(args: string[])
        newDealer(args: string[])
        resetGame()
        terminateGame()
    */

    exportReplay(): void {
        const replay = new ReplayObject(
            this.playerLog,
            this.deckArrangementLog,
            this.actionLog,
            this.rules
        );

        // TODO: Save to Mongoose
    }
}

function isNumeric(value: string) {
    return /^-?\d+$/.test(value);
}

module.exports = {};
