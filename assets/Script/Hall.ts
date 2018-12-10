import AudioMgr from "./AudioMgr";
import GameManager, { GameState } from "./GameManager";
import GameUtils from "./GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {

    @property(cc.Prefab)
    helpNode: cc.Prefab = null;

    @property(cc.Node)
    hallNode: cc.Node = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    @property(cc.Node)
    musicNode: cc.Node = null;

    onLoad() {
        GameManager.gameState = GameState.Hall
        AudioMgr.init();
        AudioMgr.playBGM("BGM.mp3");

        //设置音效状态
        if (AudioMgr.bgmVolume == 0) {
            let on = this.musicNode.getChildByName("on");
            let off = this.musicNode.getChildByName("off");
            on.active = false;
            off.active = true;
        }
    }

    onClickStart() {
        this.hallNode.active = false;
        this.loadingNode.active = true;
        cc.director.preloadScene("main", () => {
            this.scheduleOnce(() => {
                AudioMgr.StopBGM();
                cc.director.loadScene("main");
            }, 2.5);
        });
    }

    /**
     * 游戏帮助
     */
    onClickHelp() {
        let help = this.node.getChildByName("help");
        if (help) {
            help.active = true;
        } else {
            help = cc.instantiate(this.helpNode);
            this.node.addChild(help);
        }

        help.getChildByName("close").on(cc.Node.EventType.TOUCH_END, () => {
            help.active = false;
        }, this);
    }

    /**
     * 音效开关
     */
    onClickMusic(e) {
        let musicNode: cc.Node = e.target;
        let on = musicNode.getChildByName("on");
        let off = musicNode.getChildByName("off");
        if (on.active) {
            // AudioMgr.setSFXVolume(0);
            AudioMgr.setBGMVolume(0);
            on.active = false;
            off.active = true;
        } else {
            // AudioMgr.setSFXVolume(1);
            AudioMgr.setBGMVolume(1);
            on.active = true;
            off.active = false;
        }
    }

    /**
     * 更多游戏
     */
    _preTime: number = null;
    onClickMoreGame() {
        let curTime = Date.now();
        if (curTime - this._preTime <= 1500) {
            return;
        }
        this._preTime = curTime;
        //小游戏
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            //预留着
        } else {

        }
        //弹出框
        GameUtils.popTips(this.node.getChildByName('popLayer'), '功能暂未开放');
    }
}
