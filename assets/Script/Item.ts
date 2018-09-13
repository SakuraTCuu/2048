const { ccclass, property } = cc._decorator;

@ccclass
export default class Item extends cc.Component {

    @property(cc.Label)
    numLab: cc.Label = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.ParticleSystem)
    particleNode: cc.ParticleSystem = null;

    //标记 是否是空白块 是否是有数字的块

    _num: number = 0;

    showNumber(num: number) {
        this._num = num;
        this.numLab.node.active = true;
        this.numLab.string = num + "";
        if (this.numLab.node.active) {
            this.bg.active = false;
        }
        if (num == 0) { //白块
            this.bg.active = true;
            this.numLab.node.active = false;
            this.node.color = cc.color(150, 150, 150);
        } else if (num == 2) {
            this.node.color = cc.color(0, 255, 0);
        } else if (num == 4) {
            this.node.color = cc.color(0, 0, 255);
        } else if (num == 8) {
            this.node.color = cc.color(0, 120, 120);
        } else if (num == 16) {
            this.node.color = cc.color(0, 150, 150);
        } else if (num == 32) {
            this.node.color = cc.color(0, 180, 180);
        } else if (num == 64) {
            this.node.color = cc.color(120, 120, 20);
        } else if (num == 128) {
            this.node.color = cc.color(120, 120, 120);
        } else if (num == 256) {
            this.node.color = cc.color(120, 120, 220);
        } else if (num == 512) {
            this.node.color = cc.color(120, 220, 120);
        } else if (num == 1024) {
            this.node.color = cc.color(120, 0, 120);
        } else if (num == 2048) {
            this.node.color = cc.color(120, 0, 0);
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
}
