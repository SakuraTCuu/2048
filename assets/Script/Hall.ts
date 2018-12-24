import AudioMgr from "./AudioMgr";
import GameManager, { GameState } from "./GameManager";
import GameUtils from "./GameUtils";
import HintUI, { HintUIType } from "./HintUI";
import config from "./config";

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

    @property(cc.Node)
    hintUINode: cc.Node = null;

    @property(cc.Sprite)
    rankingScrollView: cc.Sprite = null;

    @property(cc.Node)
    giftNode: cc.Node = null;

    tex: cc.Texture2D = null;

    onLoad() {
        GameManager.gameState = GameState.Hall
        AudioMgr.init();
        AudioMgr.playBGM("BGM.mp3");

        this.initWX();

        //设置音效状态
        if (AudioMgr.bgmVolume == 0) {
            let on = this.musicNode.getChildByName("on");
            let off = this.musicNode.getChildByName("off");
            on.active = false;
            off.active = true;
        }

    }

    initWX() {
        let self = this;
        if (CC_WECHATGAME) {
            window['wx'].showShareMenu({ withShareTicket: true });//设置分享按钮，方便获取群id展示群排行榜
            this.tex = new cc.Texture2D();
            window['sharedCanvas'].width = 720;
            window['sharedCanvas'].height = 1280;
            //分享
            wx.showShareMenu({
                success: function (res) { console.log(res); },
                fail: function (res) { console.log(res); }
            });

            wx.onShareAppMessage(function () {
                // 用户点击了“转发”按钮
                return {
                    title: '来看看谁的得分最高!',
                    imageUrl: config.shareImg_url,
                    success: () => {
                        console.log('转发成功!');
                        this.showHintUI(HintUIType.Success, "转发成功,多谢你的支持!");
                    },
                    fail(res) {
                        console.log('转发失败--->>', res);
                        this.showHintUI(HintUIType.Failure, "转发失败!");
                    }
                }
            });
        }
    }

    onClickGiftBtn() {
        this.giftNode.active = true;
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


    /**分享按钮 */
    onClickShareBtn() {
        config.clickWXShare(this);
    }

    /**
     * 排行榜
     */
    _isShow: boolean = false;
    onClickRankBtn() {
        this._isShow = !this._isShow;
        if (this._isShow) {
            config.clickRankBtn();
        }
    }

    /**
     * 关闭排行榜
     */
    onClickCloseRankBtn() {
        this.onClickRankBtn();
    }

    /**
   * 大厅信息提示 框
   * @param hintUIType 
   * @param msg 信息
   */
    showHintUI(hintUIType: HintUIType, msg?: string) {
        const failureJS = this.hintUINode.getComponent(HintUI);
        if (failureJS.isShowing()) return false;
        failureJS.show(hintUIType, msg);
        return true;
    }

    /**
     *  群组 排行
     * @param event 
     */
    groupFriendButtonFunc(event) {
        if (CC_WECHATGAME) {
            window['wx'].shareAppMessage({
                success: (res) => {
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window['wx'].postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "x1",
                            shareTicket: res.shareTickets[0]
                        });
                    }
                }
            });
        } else {
            cc.log("获取群排行榜数据。x1");
        }
    }

    /**
     * 刷新子域的纹理
     */
    _updateSubDomainCanvas() {
        if (window['sharedCanvas'] != undefined) {
            this.tex.initWithElement(window['sharedCanvas']);
            this.tex.handleLoadedTexture();
            this.rankingScrollView.spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    update() {
        if (this._isShow) {
            this.rankingScrollView.node.parent.active = true;
            this.rankingScrollView.node.active = true;
            this._updateSubDomainCanvas();
        } else {
            this.rankingScrollView.node.parent.active = false;
            this.rankingScrollView.node.active = false;
        }
    }


}
