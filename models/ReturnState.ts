import { Pile } from './Pile';
import { Player } from './Player';

export class ReturnState {
    deck?: Pile;
    faceUp?: Pile;
    discard?: Pile;

    player1?: Player;
    player2?: Player;
    player3?: Player;
    player4?: Player;
    player5?: Player;
    player6?: Player;
    player7?: Player;
    player8?: Player;
}
