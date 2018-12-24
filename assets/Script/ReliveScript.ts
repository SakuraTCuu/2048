import Game from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ReliveScript extends cc.Component {

    @property(cc.Label)
    timeLab: cc.Label = null;


    onEnable() {
        this.startTimeCount();
        let anim = this.getComponent(cc.Animation);
        if (anim) {
            anim.play();
        }
    }

    startTimeCount() {
        let time = 9;
        this.schedule(() => {
            this.timeLab.string = time + "";
            if (time === 0) {
                cc.log('游戏结束了哦!');
                Game.instance.onClickReliveCloseBtn();
            }
            time--;
        }, 1, 10, 1);
    }

    onDisable() {
        this.unscheduleAllCallbacks();
        let anim = this.getComponent(cc.Animation);
        if (anim) {
            anim.stop();
        }
    }
}
