
export enum GameState {
    Hall,
    Game
}

export enum PlayState {
    stop = 1,  //游戏暂停
    useItem = 2, //使用道具
    normal = 3,  //正常情况
    dead = 4,  //游戏死亡  可以复活
    over = 5,  //游戏结束
}

export enum ItemType {
    hummer = 1,
    brush = 2,
    change = 3,
    change_1 = 6, //选择两个互换  
    regret = 4,
    none = 5
}

export default class GameManager {
    static gameState: GameState = GameState.Hall;

    /**游戏状态 */
    static PLAYSTATE: PlayState = PlayState.normal;

    /**使用道具类型 */
    static ITEMTYPE: ItemType = ItemType.none;

    static STATICARR: Array<number> = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]

}
