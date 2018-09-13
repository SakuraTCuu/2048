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

    showNumber(num: number) {
        this._num = num;

        if (num == 0) { //白块
            this.bg.active = true;
            this.numberSp.spriteFrame = null;
            return;
            // this.node.color = cc.color(150, 150, 150);
        }
        //  else if (num == 2) {
        //     this.node.color = cc.color(0, 255, 0);
        // } else if (num == 4) {
        //     this.node.color = cc.color(0, 0, 255);
        // } else if (num == 8) {
        //     this.node.color = cc.color(0, 120, 120);
        // } else if (num == 16) {
        //     this.node.color = cc.color(0, 150, 150);
        // } else if (num == 32) {
        //     this.node.color = cc.color(0, 180, 180);
        // } else if (num == 64) {
        //     this.node.color = cc.color(120, 120, 20);
        // } else if (num == 128) {
        //     this.node.color = cc.color(120, 120, 120);
        // } else if (num == 256) {
        //     this.node.color = cc.color(120, 120, 220);
        // } else if (num == 512) {
        //     this.node.color = cc.color(120, 220, 120);
        // } else if (num == 1024) {
        //     this.node.color = cc.color(120, 0, 120);
        // } else if (num == 2048) {
        //     this.node.color = cc.color(120, 0, 0);
        // }

        let numberAtlas = Game.instance.numberAtlas;
        this.numberSp.spriteFrame = numberAtlas.getSpriteFrame(num + "");
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
