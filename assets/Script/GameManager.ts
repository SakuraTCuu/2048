import AudioMgr from "./AudioMgr";

export enum GameState {
    Hall,
    Game
}

export default class GameManager {
    static gameState: GameState = GameState.Hall;
}
