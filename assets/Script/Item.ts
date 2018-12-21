import Game from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Item extends cc.Component {

    @property(cc.Sprite)
    numberSp: cc.Sprite = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.ParticleSystem)
    particleNode: cc.ParticleSystem = null;

    _num: number = 0;

    hideNum: number = 0;


    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this)
    }

    /**
     * 判断类型
     */
    onClick() {
        //默认是锤子
        this.showNumber(0);

        //做特效
    }

    showNumber(num: number, isMerge: boolean = false) {
        this._num = num;

        if (num == 0) { //白块
            this.bg.active = true;
            this.numberSp.spriteFrame = null;
            return;
        }

        let numberAtlas = Game.instance.numberAtlas;
        this.numberSp.spriteFrame = numberAtlas.getSpriteFrame(num + "");

        if (isMerge) {
            //播放动画
            this.numberSp.node.scale = 0.8;
            let action = cc.scaleTo(0.2, 1);
            // this.numberSp.node.runAction(cc.skewBy(0.5, 10, 10));
            this.numberSp.node.runAction(action);
        }
    }

    //播放粒子特效
    playParticle() {
        cc.log("播放特效");
        this.particleNode.node.active = true;
        this.particleNode.resetSystem();
        this.particleNode.enabled = true;
        this.scheduleOnce(() => {
            this.particleNode.stopSystem();
            this.particleNode.enabled = false;
        }, 0.5);
        // this.particleNode.
    }

    /**
        * 是否是有数字的块
        */
    isNum() {
        return this._num != 0;
    }

    getNum() {
        return this._num;
    }

    setHideNum(num: number) {
        this.hideNum = num;
    }

    getHideNum() {
        return this.hideNum;
    }

}
