import AudioMgr from "./AudioMgr";
import GameManager, { GameState } from "./GameManager";
import GameUtils from "./GameUtils";
import HintUI, { HintUIType } from "./HintUI";
import config from "./config";
import HTTPMgr from "./net/HTTPMgr";
import userModel from "./model/userModel";

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

    // @property(cc.Node)
    // wxLoginNode: cc.Node = null;

    @property(cc.Node)
    AuthorizeBtnNode: cc.Node = null;

    tex: cc.Texture2D = null;

    _wxCode: string = null;

    //是否已经授权
    _auth: boolean = false;

    onLoad() {
        // let code = {
        //     code: 'xsxxxxxxxxxxx'
        // };
        // HTTPMgr.post('wxCode', code).then((res) => {
        //     console.log(res);
        // }).catch((err) => {
        //     console.log(err);
        // });

        GameManager.gameState = GameState.Hall
        AudioMgr.init();
        AudioMgr.playBGM("BGM.mp3");

        this.initWX();
        // if (!CC_WECHATGAME) {
        this.initUserInfo();
        // }
        //设置音效状态
        if (AudioMgr.bgmVolume == 0) {
            let on = this.musicNode.getChildByName("on");
            let off = this.musicNode.getChildByName("off");
            on.active = false;
            off.active = true;
        }
    }

    initUserInfo() {
        let user: userModel = {
            userName: 'other',
            userId: 'xxxxxxx',
            hummer: 2,
            brush: 2,
            change: 2
        };
        //读取本地存储
        let itemData: String = GameManager.getItemData();

        if (itemData && itemData !== "") {
            let itemList = itemData.split("_");//2_2_2
            user.hummer = Number(itemList[0]);
            user.brush = Number(itemList[1]);
            user.change = Number(itemList[2]);
        }
        console.log(user);
        GameManager.userInfo = user;
        GameManager.saveItemData();
    }

    initWX() {
        let self = this;
        if (CC_WECHATGAME) {
            // this.initWXLogin();
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
                    // imageUrl: canvas.toTempFilePathSync({
                    //     destWidth: 500,
                    //     destHeight: 400
                    // }),
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
        self.initVideo();
    }

    initVideo() {
        //缓存
        // GameManager.VIDEOAD.getRewardedVideoAd();
    }

    initWXLogin() {
        // 登录
        wx.login({
            success: res => {
                this._wxCode = res.code;
            }
        });

        // let userInfo = wx.getStorageSync('userInfo');
        // if (userInfo) {
        //     //已经有userId了
        //     GameManager.userInfo.userId = userInfo['userId'];
        // } else {
        //     //没有
        // }
        // wx.getSetting({
        //     success: (res) => {
        //         console.log('是否授权', res.authSetting['scope.userInfo'] !== undefined);
        //         this._auth = res.authSetting['scope.userInfo'] !== undefined
        //         if (this._auth) {
        //             //获取用户信息
        //         } else {
        //             // this.wxLoginNode.active = true;
        //             this.createAuthorizeBtn(this.AuthorizeBtnNode);
        //         }
        //     }
        // });
        this.createAuthorizeBtn(this.AuthorizeBtnNode);
    }

    onClickGiftBtn() {
        this.giftNode.active = true;
    }

    startGame() {
        this.hallNode.active = false;
        this.loadingNode.active = true;
        cc.director.preloadScene("main", () => {
            this.scheduleOnce(() => {
                AudioMgr.StopBGM();
                cc.director.loadScene("main");
            }, 2.5);
        });
    }

    onClickStart() {
        // this.hallNode.active = false;
        // this.loadingNode.active = true;
        // cc.director.preloadScene("main", () => {
        //     this.scheduleOnce(() => {
        //         AudioMgr.StopBGM();
        //         cc.director.loadScene("main");
        //     }, 2.5);
        // });
        // if (CC_WECHATGAME) {
        //     if (this._auth) {
        //         this.startGame();
        //     }
        // } else {
        //     this.startGame();
        // }
        this.startGame();
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

    createAuthorizeBtn(btnNode: cc.Node) {
        let btnSize = cc.size(btnNode.width + 10, btnNode.height + 10);
        let frameSize = cc.view.getFrameSize();
        let winSize = cc.director.getWinSize();
        // console.log("winSize: ",winSize);
        // console.log("frameSize: ",frameSize);
        //适配不同机型来创建微信授权按钮
        let left = (winSize.width * 0.5 + btnNode.x - btnSize.width * 0.5) / winSize.width * frameSize.width;
        let top = (winSize.height * 0.5 - btnNode.y - btnSize.height * 0.5) / winSize.height * frameSize.height;
        let width = btnSize.width / winSize.width * frameSize.width;
        let height = btnSize.height / winSize.height * frameSize.height;
        // console.log("button pos: ",cc.v2(left,top));
        // console.log("button size: ",cc.size(width,height));
        let btnAuthorize = wx.createUserInfoButton({
            type: 'text',
            text: '',
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
                lineHeight: 0,
                backgroundColor: '',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        })

        btnAuthorize.onTap((uinfo) => {
            console.log("onTap uinfo: ", uinfo);
            if (uinfo.userInfo) {
                console.log("wxLogin auth success");

                let iv = uinfo.iv;
                let encryptedData = uinfo.encryptedData;
                let userName = uinfo.userInfo.nickName;

                let param = {
                    userName: userName,
                    iv: iv,
                    encryptedData: encryptedData,
                    code: this._wxCode
                }

                //把code 发送到服务器
                if (this._wxCode) {
                    HTTPMgr.post('wxCode', param).then((res) => {
                        console.log(res);
                        GameManager.userInfo = res['data'];
                        this.showHintUI(HintUIType.Success, "登录成功");
                        wx.setStorageSync('userInfo', res['data']);
                        this.startGame();
                    }).catch((err) => {
                        console.log("登录失败-->>>", err);
                        this.showHintUI(HintUIType.Success, "登录失败");
                    });
                }
            } else {
                console.log("wxLogin auth fail");
                // wx.showToast({ title: "授权失败" });
                this.showHintUI(HintUIType.Failure, "授权失败");
            }
        });
    }
}
