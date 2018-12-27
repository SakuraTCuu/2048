import Game from "./Game";
import GameManager, { ItemType, PlayState } from "./GameManager";

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

    _preClickTime: number = null;

    _act: cc.Action = null;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    /**
     * 判断类型
     */
    onClick() {
        if (GameManager.PLAYSTATE === PlayState.normal) {
            return;
        }
        let currentTime = Date.now();
        if (currentTime - this._preClickTime < 2000) { return }
        this._preClickTime = currentTime;
        if (this._num !== 0) {
            if (GameManager.ITEMTYPE == ItemType.hummer) {
                Game.instance.hummerTarNode = this.node;
                Game.instance.startItemEffect(this.node.position);
                // this.playHummerEffect();

            } else if (GameManager.ITEMTYPE == ItemType.brush) {
                Game.instance.brushTarNode = this.node;
                Game.instance.startItemEffect(this.node.position);

            } else if (GameManager.ITEMTYPE == ItemType.change) {
                //先记录一个数字块
                Game.instance.changeTarNode1 = this.node;
                GameManager.ITEMTYPE = ItemType.change_1;
                this.playLightEffect();
                cc.log('第一个选中')
            } else if (GameManager.ITEMTYPE == ItemType.change_1) {
                if (Game.instance.changeTarNode1 === this.node) {
                    this.hideLightEffect();
                } else {
                    //再记录一个数字块
                    Game.instance.changeTarNode2 = this.node;
                    //开始换位置;
                    Game.instance.changeEventEffect();
                }
            } else if (GameManager.ITEMTYPE == ItemType.regret) {
                this.showNumber(0);
            }
        }
        //默认是锤子
        //做特效
    }

    showNumber(num: number, isGen: boolean = false, isMerge: boolean = false) {
        this._num = num;

        if (num == 0) { //白块
            this.bg.active = true;
            this.numberSp.spriteFrame = null;
            return;
        }


        let numberAtlas = Game.instance.numberAtlas;
        this.numberSp.spriteFrame = numberAtlas.getSpriteFrame(num + "");

        if (isGen) {
            this.numberSp.node.scale = 0.6;
            let action = cc.scaleTo(0.2, 1);
            this.numberSp.node.runAction(action);
        }

        if (isMerge) {
            this.numberSp.node.stopAllActions();
            let scaAction1 = cc.scaleTo(0.15, 0.1, 1);
            let scaAction2 = cc.scaleTo(0.15, 1, 1);

            let callFun2 = cc.callFunc(() => {
                this.playAnimEffect();
            });

            let seqAct = cc.sequence(scaAction1, scaAction2, callFun2);

            this.numberSp.node.runAction(seqAct);
        }
    }

    /**
     * 随机一个数字  
     * 刷子生成
     */
    showRandomNumber() {
        let index = Math.floor(Math.random() * 10);
        let num = GameManager.STATICARR[index];
        if (this._num === num) {
            this.showRandomNumber();
        } else {
            this.showNumber(num, false, true);
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
     * 播放合并后小星星特效
     */
    playAnimEffect() {
        let anim = cc.instantiate(Game.instance.mergePrefab);
        this.node.addChild(anim);
        this.scheduleOnce(() => {
            anim.stopAllActions();
            anim.destroy();
        }, 0.8);
    }

    /**
     * 播放2和4消除的特效
     */
    playPopEffect() {
        let anim = cc.instantiate(Game.instance.popStarPrefab);
        this.node.addChild(anim);
        this.scheduleOnce(() => {
            // anim.stopAllActions();
            anim.destroy();
        }, 0.6);
    }

    /**
     * 播放 锤子敲击之后的特效
     */
    playHummerEffect() {
        let hummer = cc.instantiate(Game.instance.hummerPrefab);
        this.node.addChild(hummer);
        this.scheduleOnce(() => {
            // hummer.stopAllActions();
            hummer.destroy();
            this.showNumber(0);
        }, 0.3);
    }


    /**
     * 播放选中特效
     */
    playLightEffect() {
        let numberAtlas = Game.instance.numberAtlas;
        this.numberSp.spriteFrame = numberAtlas.getSpriteFrame(this._num + "_a");

        //放大缩小特效
        let scale1 = cc.scaleTo(0.6, 1.05, 1.05);
        let scale2 = cc.scaleTo(0.6, 0.95, 0.95);

        let act = cc.repeatForever(cc.sequence(scale1, scale2));
        this._act = this.node.runAction(act);
    }

    /**
     * 隐藏选中特效
     */
    hideLightEffect() {
        //去掉换位道具的闪光效果
        let numberAtlas = Game.instance.numberAtlas;
        this.numberSp.spriteFrame = numberAtlas.getSpriteFrame(this._num + "");

        if (this._act) {
            this.node.stopAction(this._act);
        }
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
