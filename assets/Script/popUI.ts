import Game from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class popUI extends cc.Component {

    /**
     * 重新开始游戏
     */
    onResetGame() {
        Game.instance.reSetGame();
    }

    /**
     * 关闭本界面
     */
    onCloseBtn() {
        this.node.active = false;
        //需要做动效
        //从上往下 缓慢出现
    }
}
