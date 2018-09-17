import AudioMgr from "./AudioMgr";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {

    @property(cc.Prefab)
    helpNode: cc.Prefab = null;

    @property(cc.Node)
    hallNode: cc.Node = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    //音量
    _sfxVolume: number = 1;
    _bgmVolume: number = 1;

    onLoad() {
        AudioMgr.init();
        AudioMgr.playBGM("BGM.mp3");
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
            AudioMgr.setSFXVolume(0);
            AudioMgr.setBGMVolume(0);
            on.active = false;
            off.active = true;
        } else {
            AudioMgr.setSFXVolume(1);
            AudioMgr.setBGMVolume(1);
            on.active = true;
            off.active = false;
        }
    }

    /**
     * 更多游戏
     */
    onClickMoreGame() {
        //小游戏
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            //预留着
        }
    }
}
