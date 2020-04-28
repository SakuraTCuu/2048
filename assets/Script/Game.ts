import Item from "./Item";
import AudioMgr from "./AudioMgr";
import GameManager, { GameState, PlayState, ItemType } from "./GameManager";
import HintUI, { HintUIType } from "./HintUI";
import config from "./config";
import GameProp from "./GameProp";
import HTTPMgr from "./net/HTTPMgr";
import GetItemUI from "./GetItemUI";

const { ccclass, property } = cc._decorator;
export interface locationInfo {
    l: number;   //行数
    r: number;   //列数
}

export enum slideDirection {
    LeftRight = 1,
    UpDown = 2,
}
export enum direction {
    left,
    right,
    up,
    down,
}

enum successType {
    success_2048 = 2048,
    success_4096 = 4096,
    success_8192 = 8192,
    success_16384 = 16384,
    success_32768 = 32768
}

@ccclass
export default class Game extends cc.Component {

    @property(cc.SpriteAtlas)
    numberAtlas: cc.SpriteAtlas = null;

    @property(cc.Prefab)
    squareItem: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    uiLayer: cc.Node = null;
    // @property(cc.Label)
    // scoreLab: cc.Label = null;

    // @property(cc.Label)
    // stepLab: cc.Label = null;

    @property(cc.Node)
    gameOverNode: cc.Node = null;

    @property(cc.Node)
    showItemNode: cc.Node = null;

    @property(cc.Node)
    pauseGameNode: cc.Node = null;

    @property(cc.Node)
    reliveNode: cc.Node = null;

    @property(cc.Node)
    maskNode: cc.Node = null;

    /**2048 4096 8192...  面板 */
    @property(cc.Node)
    continueNode: cc.Node = null;

    //提示面板
    @property(cc.Node)
    hintUINode: cc.Node = null;

    //获取道具面板
    @property(cc.Node)
    getItemView: cc.Node = null;

    @property(cc.Label)
    targetLab: cc.Label = null;

    @property(cc.Label)
    currentLab: cc.Label = null;

    @property(cc.Label)
    historyLab: cc.Label = null;

    @property(dragonBones.ArmatureDisplay)
    startEffectDrag: dragonBones.ArmatureDisplay = null;

    @property(dragonBones.ArmatureDisplay)
    successEffectDrag: dragonBones.ArmatureDisplay = null;

    @property(dragonBones.ArmatureDisplay)
    hummerEffectDrag: dragonBones.ArmatureDisplay = null;

    @property(dragonBones.ArmatureDisplay)
    brushEffectDrag: dragonBones.ArmatureDisplay = null;

    /**========================= 特效预制体============================= */
    @property(cc.Prefab)
    mergePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    hummerPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    popStarPrefab: cc.Prefab = null;

    /**========================底部道具列表节点========================================== */

    @property(cc.Label)
    brushLab: cc.Label = null;

    @property(cc.Label)
    hummerLab: cc.Label = null;

    @property(cc.Label)
    changeLab: cc.Label = null;


    // 最近一阶段的成功的数字   用于判断是否达成过
    _successPhase: successType = successType.success_2048;

    //上一次触摸点位置
    _pos: cc.Vec2 = null;
    //结束点
    _endPos: cc.Vec2 = null;
    //开始点
    _startPos: cc.Vec2 = null;
    //取消点
    _cancelPos: cc.Vec2 = null;

    //分数
    _score: number = 0;
    //历史分数
    _historyScore: string = null;
    //步数
    _step: number = 0;
    //合并的步数
    _mergeStep: number = 0;

    //每一行的格子数
    squareNum: number = 4;

    //格子的二维数组  横向
    _sqrt: cc.Node[][] = null;

    //格子的二维数组  竖向
    _sqrt2: cc.Node[][] = null;

    //滑动方向 默认向左划
    _direction: direction = direction.left;
    _slide: slideDirection = slideDirection.LeftRight;

    //当前特效龙骨动画的armature对象
    _effect_armature: dragonBones.Armature = null;
    _success_armature: dragonBones.Armature = null;
    _hummer_armature: dragonBones.Armature = null;
    _brush_armature: dragonBones.Armature = null;

    //使用锤子后点击的数字块节点
    hummerTarNode: cc.Node = null;

    //使用刷子后点击的数字块的节点
    brushTarNode: cc.Node = null;

    //互换的两个节点
    changeTarNode1: cc.Node = null;
    changeTarNode2: cc.Node = null;

    //本次是否进行过合并
    _isMerge: boolean = false;

    //播放音效的ID
    _audioID: number = 0;

    //点击判断
    _clickFlag: boolean = true;

    //点击视频后该获得的道具
    _clickItem: ItemType = ItemType.none;

    _isVideoPlay: boolean = false;

    //合并的数组
    _mergeNode: Array<cc.Node> = new Array();

    private static _instance: Game = null;

    public static get instance(): Game {
        return Game._instance;
    }

    /**
     * 2048 小方块
     * 每一步都出现一个方块 2 
     * 游戏开始 有两个随机数字 (2,4)或(2,2)
     * 2,4,8,16,32,64,128,256,512,1024,2048
     */
    onLoad() {
        GameManager.gameState = GameState.Hall
        Game._instance = this;

        //初始化
        this.initGame();

        this.content.width = this._sqrt[0][0].width * this.squareNum + (this.squareNum + 1) * 20;
        this.content.height = this._sqrt[0][0].height * this.squareNum + (this.squareNum + 1) * 20;

        this.content.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.content.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.content.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);

        this.maskNode.on(cc.Node.EventType.TOUCH_END, () => {
            //是否继续?
            this.continueNode.active = true;
            this.successEffectDrag.node.parent.active = false;
        }, this);

        this.initEffect();
        this.initView();
    }


    /**==================================游戏初始化===================================================== */

    initGame() {
        this._sqrt = new Array();
        this._sqrt2 = new Array();

        //多维数组不能直接定义多维，只能层层定义，很多高级语言都是如此
        for (let i = 0; i < this.squareNum; i++) {
            this._sqrt2[i] = new Array();//多维数组层层定义
        }

        for (let i = 0; i < this.squareNum; i++) {
            this._sqrt[i] = new Array();//多维数组层层定义
            for (let j = 0; j < this.squareNum; j++) {
                let item = cc.instantiate(this.squareItem);
                item.name = i + "" + j;
                this._sqrt[i][j] = item;
                this._sqrt2[j][i] = item;
                this.content.addChild(item);
                //计算位置
                this.initPos(item, i, j);
            }
        }

        this.scheduleOnce(() => {
            //随机两个存在的数字
            this.initGrid();
        }, 0.2);

    }

    //初始化位置 ，不用layout组件
    initPos(item: cc.Node, i: number, j: number) {
        // let x = item.width * i + item.width / 2 + (i + 1) * 20;
        // let y = item.height * j + item.width / 2 + (j + 1) * 20;
        let x = item.width * j + item.width / 2 + (j + 1) * 20;
        let y = item.height * i + item.width / 2 + (i + 1) * 20 + 20;
        item.position = cc.v2(x, -y);
    }

    initGrid() {
        let location1 = this.randomLocation();
        let location2 = this.randomLocation();
        let grid1 = this.randomNumber();
        let grid2 = this.randomNumber();

        //获取随机到的两个数的节点
        let item1 = this.content.getChildByName(location1.l + "" + location1.r);
        let item2 = this.content.getChildByName(location2.l + "" + location2.r);
        item1.getComponent(Item).showNumber(grid1, true);
        item2.getComponent(Item).showNumber(grid2, true);

        // let item0 = this.content.getChildByName("00");
        // let item1 = this.content.getChildByName("01");
        // let item2 = this.content.getChildByName("02");
        // let item3 = this.content.getChildByName("03");
        // let item10 = this.content.getChildByName("10");
        // let item11 = this.content.getChildByName("11");
        // let item12 = this.content.getChildByName("12");
        // let item13 = this.content.getChildByName("13");
        // let item20 = this.content.getChildByName("20");
        // let item21 = this.content.getChildByName("21");
        // let item22 = this.content.getChildByName("22");
        // let item23 = this.content.getChildByName("23");
        // let item30 = this.content.getChildByName("30");
        // let item31 = this.content.getChildByName("31");
        // let item32 = this.content.getChildByName("32");
        // let item33 = this.content.getChildByName("33");
        // item0.getComponent(Item).showNumber(1024);
        // item1.getComponent(Item).showNumber(1024);
        // item2.getComponent(Item).showNumber(1024);
        // item3.getComponent(Item).showNumber(1024);
        // item10.getComponent(Item).showNumber(8192);
        // item11.getComponent(Item).showNumber(8192);
        // item12.getComponent(Item).showNumber(8192);
        // item13.getComponent(Item).showNumber(1024);
        // item20.getComponent(Item).showNumber(1024);
        // item21.getComponent(Item).showNumber(1024);
        // item22.getComponent(Item).showNumber(1024);
        // item23.getComponent(Item).showNumber(1024);
        // item30.getComponent(Item).showNumber(1024);
        // item31.getComponent(Item).showNumber(1024);
        // item32.getComponent(Item).showNumber(1024);
        // item33.getComponent(Item).showNumber(1024);
    }

    initView() {
        this.targetLab.string = this._successPhase + "";
        this.setLabInfo();
        this.setHistoryLab();
        this.initBottomItem();
    }

    /**
     * 初始化底部道具列表
     */
    initBottomItem() {
        let userInfo = GameManager.userInfo;
        this.brushLab.string = userInfo.brush + "";
        this.hummerLab.string = userInfo.hummer + "";
        this.changeLab.string = userInfo.change + "";
    }

    /**
    * 设置面板信息
    */
    setLabInfo() {
        this.currentLab.string = this._score + "";
        // this.stepLab.string = this._step + "";
    }

    /**
     * 设置历史信息
     */
    setHistoryLab() {
        this._historyScore = cc.sys.localStorage.getItem('score');
        this.historyLab.string = this._historyScore ? this._historyScore : '0';
    }

    //保存历史信息
    saveHistoryScore() {
        //当  当前分大于历史成绩才触发
        if (this._score > Number(this._historyScore)) {
            cc.sys.localStorage.setItem('score', this._score);
        }
    }

    /**
     * 初始化 龙骨动画特效
     */
    initEffect() {
        this.hummerEffectDrag.node.active = true;
        this.brushEffectDrag.node.active = true;
        this.startEffectDrag.node.parent.active = true;
        this.successEffectDrag.node.parent.active = true;

        // 开始和后续消除次数 的特效
        this._effect_armature = this.startEffectDrag.armature();
        //成功达到一个阶段的特效
        this._success_armature = this.successEffectDrag.armature();
        //锤子特效
        this._hummer_armature = this.hummerEffectDrag.armature();
        //刷子特效
        this._brush_armature = this.brushEffectDrag.armature();


        this.successEffectDrag.addEventListener(dragonBones.EventObject.COMPLETE, this.successEventHandler, this);
        this.hummerEffectDrag.addEventListener(dragonBones.EventObject.COMPLETE, this.hummerEventHandler, this);
        this.brushEffectDrag.addEventListener(dragonBones.EventObject.COMPLETE, this.brushEventHandler, this);

        this.successEffectDrag.node.parent.active = false;
        this.hummerEffectDrag.node.active = false;
        this.brushEffectDrag.node.active = false;
    }



    /**==================================事件 函数===================================================== */
    onReturnHall() {
        cc.director.loadScene("Hall");
    }

    onClickPauseBtn() {
        this.pauseGameNode.active = true;
    }

    //关闭复活界面
    onClickReliveCloseBtn() {
        this.reliveNode.active = false;
        this.showGameOverUI();
    }

    onClickLookVideoClose() {
        this.getItemView.active = false;
    }

    showReliveUI() {
        this.reliveNode.active = true;
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
            on.active = false;
            off.active = true;
        } else {
            AudioMgr.setSFXVolume(1);
            on.active = true;
            off.active = false;
        }
    }

    /**
     * 暂停后继续游戏
     */
    onClickContinueGame() {
        this.pauseGameNode.active = false;
    }

    /** 完成一阶段了 继续下一阶段 */
    onClickContinueGameNextPhase() {
        this.scheduleOnce(() => {
            this.continueNode.active = false;
            //达成条件 触发 升级
            this.initView();
            this.showHintUI(HintUIType.Success, '目标已更新!');
        }, 0.1)
    }

    // /**
    //  * 复活
    //  * 消除2 和 4
    //  */
    // onClickReliveBtn() {
    //     GameManager.PLAYSTATE = PlayState.dead;
    //     this.reliveNode.active = false;
    //     this._clickFlag = true;
    //     let len = this.content.childrenCount;
    //     for (let i = 0; i < len; i++) {
    //         let num = this.content.children[i].getComponent(Item).getNum();
    //         if (num === 2 || num === 4) {
    //             //消除
    //             this.content.children[i].getComponent(Item).playPopEffect();
    //             this.content.children[i].getComponent(Item).playHummerEffect();
    //         } else if (num !== 0) {

    //         }
    //     }

    //     //重置游戏状态
    //     this.scheduleOnce(() => {
    //         GameManager.PLAYSTATE = PlayState.normal;
    //         // cc.log('@@', GameManager.PLAYSTATE);
    //         // cc.log('@@@!', GameManager.ITEMTYPE);
    //     }, 1);
    // }

    /**
     * 复活  
     * 消除2 和 4
     */
    onClickReliveBtn() {

        if (!CC_WECHATGAME) {
            this.clear2Or4();
            return;
        }
        if (this._isVideoPlay) {
            return;
        }
        //关闭结束界面
        this.reliveNode.active = false;
        
        //弹出广告的
        GameManager.VIDEOAD.getRewardedVideoAd(() => {
            this.clear2Or4();
            this._isVideoPlay = false;
        }, () => {
            this.showGameOverUI();
            this._isVideoPlay = false;
        });
        this._isVideoPlay = true;
    }

    //观看广告
    onClickVideoLook() {
        if (!CC_WECHATGAME) {
            this.getItemByVideo();
            return;
        }
        if (this._isVideoPlay) {
            return;
        }
        //弹出广告的
        GameManager.VIDEOAD.getRewardedVideoAd(() => {
            this.getItemByVideo();
            this._isVideoPlay = false;
        }, () => {
            this._isVideoPlay = false;
        });
        this._isVideoPlay = true;
        // videoAd.load()
    }

    //通过广告赚取道具
    getItemByVideo() {
        this.getItemView.active = false;
        //所有道具+2;
        // GameManager.userInfo.brush += 2;
        // GameManager.userInfo.hummer += 2;
        // GameManager.userInfo.change += 2;

        if (this._clickItem == ItemType.brush) {
            GameManager.userInfo.brush += 2;
        } else if (this._clickItem == ItemType.hummer) {
            GameManager.userInfo.hummer += 2;
        } else if (this._clickItem == ItemType.change) {
            GameManager.userInfo.change += 2;
        }

        GameManager.saveItemData();

        this.initBottomItem();
    }

    clear2Or4() {
        GameManager.PLAYSTATE = PlayState.dead;
        this.reliveNode.active = false;
        this._clickFlag = true;
        let len = this.content.childrenCount;
        for (let i = 0; i < len; i++) {
            let num = this.content.children[i].getComponent(Item).getNum();
            if (num === 2 || num === 4) {
                //消除
                this.content.children[i].getComponent(Item).playPopEffect();
                this.content.children[i].getComponent(Item).playHummerEffect();
            } else if (num !== 0) {

            }
        }

        //重置游戏状态
        this.scheduleOnce(() => {
            GameManager.PLAYSTATE = PlayState.normal;
            // cc.log('@@', GameManager.PLAYSTATE);
            // cc.log('@@@!', GameManager.ITEMTYPE);
        }, 1);
    }

    /**分享按钮 */
    onClickShareBtn() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //微信小游戏  分享
            wx.shareAppMessage({
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
            })
        } else {
            this.showHintUI(HintUIType.Failure, "该平台不支持分享!");
        }
    }

    /**==================================特效处理===================================================== */

    /**
     * 刷子动画回调
     */
    brushEventHandler(event: cc.Event.EventCustom) {
        cc.log('custom---', event.detail.animationState.name);
        //刷子特效完成, 开始消除数字块;
        if (this.brushTarNode) {
            this.brushTarNode.getComponent(Item).showRandomNumber();
            this.brushEffectDrag.node.active = false;
        }
        //结束使用道具状态;
        GameManager.PLAYSTATE = PlayState.normal;
        GameManager.ITEMTYPE = ItemType.none;

        //触发 道具计算
        this.calcUserItem(ItemType.brush);
    }

    /**
     * 锤子动画回调
     * @param event 
     */
    hummerEventHandler(event) {
        cc.log('custom---', event.detail.animationState.name);
        if (this.hummerTarNode) {
            this.hummerTarNode.getComponent(Item).playHummerEffect();
            this.hummerEffectDrag.node.active = false;
        }
        //结束使用道具状态;
        GameManager.PLAYSTATE = PlayState.normal;
        GameManager.ITEMTYPE = ItemType.none;
        //
        this.calcUserItem(ItemType.hummer);
    }

    /**
     * 换位道具特效
     */
    changeEventEffect() {
        if (this.changeTarNode1 && this.changeTarNode2) {
            let pos1 = this.changeTarNode1.position;
            let pos2 = this.changeTarNode2.position;
            let callFun1 = cc.callFunc(() => {
                this.content.removeChild(cloneNode1);
                cloneNode1.removeFromParent();
                cloneNode1.destroy();
            });
            let callFun2 = cc.callFunc(() => {
                this.content.removeChild(cloneNode2);
                cloneNode2.removeFromParent();
                cloneNode2.destroy();
            });
            let moveAvt1 = cc.moveTo(0.5, pos2).easing(cc.easeOut(3.0));
            let moveAvt2 = cc.moveTo(0.5, pos1).easing(cc.easeOut(3.0));

            let seqAct1 = cc.sequence(moveAvt1, callFun1);
            let seqAct2 = cc.sequence(moveAvt2, callFun2);

            let num1 = this.changeTarNode1.getComponent(Item).getNum();
            let num2 = this.changeTarNode2.getComponent(Item).getNum();

            this.changeTarNode1.getComponent(Item).showNumber(0);
            this.changeTarNode2.getComponent(Item).showNumber(0);

            let cloneNode1: cc.Node = cc.instantiate(this.squareItem);
            cloneNode1.getComponent(Item).showNumber(num1);
            cloneNode1.getComponent(Item).numberSp.spriteFrame = this.numberAtlas.getSpriteFrame(num1 + "_a");
            cloneNode1.position = pos1;
            this.content.addChild(cloneNode1);

            let cloneNode2: cc.Node = cc.instantiate(this.squareItem);
            cloneNode2.getComponent(Item).showNumber(num2);
            cloneNode2.position = pos2;
            this.content.addChild(cloneNode2);

            cloneNode1.runAction(seqAct1);
            cloneNode2.runAction(seqAct2);

            this.scheduleOnce(() => {
                this.changeTarNode1.getComponent(Item).showNumber(num2);
                this.changeTarNode2.getComponent(Item).showNumber(num1);
                this.changeTarNode1.getComponent(Item).hideLightEffect();
                this.changeTarNode1.getComponent(Item).hideLightEffect();
                //重置状态 
                GameManager.PLAYSTATE = PlayState.normal;
                GameManager.ITEMTYPE = ItemType.none;
                this.hideMaskItem();
                this.calcUserItem(ItemType.change);
            }, 0.5)
        } else {
            cc.log('err-->>换位节点没选完啊')
        }
    }

    /**
     * 停止切换特效
     */
    stopChangeEvent() {
        if (this.changeTarNode1) {
            this.changeTarNode1.getComponent(Item).hideLightEffect();
            //重置状态
            GameManager.PLAYSTATE = PlayState.normal;
            GameManager.ITEMTYPE = ItemType.none;
        } else {

        }
        GameManager.PLAYSTATE = PlayState.normal;
        GameManager.ITEMTYPE = ItemType.none;
    }

    /**成功龙骨动画播放回调 */
    successEventHandler(event: cc.Event.EventCustom) {
        cc.log(this._success_armature.animation.lastAnimationName);
        let animName = this._success_armature.animation.lastAnimationName;

        switch (animName) {
            case 'fenxiang1':

                this.maskNode.active = true;
                let effectName = this.getEffectNameByType();
                //更改等级阶段
                this._successPhase = this.getTargetScoreByType(this._successPhase);
                this._success_armature.animation.fadeIn(effectName, -1, -1, 0);

                break;
            case 'jiangbei2048chuxian':

                this._success_armature.animation.fadeIn('jiangbei2048jingzhi', -1, -1, 0, 'normal');

                break;
            case 'jiangbei4096chuxian':

                this._success_armature.animation.fadeIn('jiangbei4096jingzhi', -1, -1, 0, 'normal');

                break;
            case 'jiangbei8192chuxian':

                this._success_armature.animation.fadeIn('jiangbei8192jingzhi', -1, -1, 0, 'normal');

                break;
            case 'jiangbei16384chuxian':

                this._success_armature.animation.fadeIn('jiangbei16384jingzhi', -1, -1, 0, 'normal');

                break;
            case 'jiangbei32768chuxian':

                this._success_armature.animation.fadeIn('jiangbei32768jingzhi', -1, -1, 0, 'normal');

                break;
        }
    }


    /**
     *  event.getLocation()  返回的节点已经是世界坐标系下的节点,不需要额外的转换
     * 
     * 
     * 处理 道具使用
     */
    startItemEffect(pos: cc.Vec2) {

        //转换坐标系
        let worldPos = this.content.convertToWorldSpaceAR(pos);
        let localPos = this.brushEffectDrag.node.parent.convertToNodeSpaceAR(worldPos);
        //使用道具
        if (GameManager.ITEMTYPE === ItemType.hummer) {

            this.hummerEffectDrag.node.active = true;
            this._hummer_armature.animation.fadeIn('daoju1', -1, -1);
            this.hummerEffectDrag.node.position = localPos;

        } else if (GameManager.ITEMTYPE === ItemType.brush) {

            this.brushEffectDrag.node.active = true;
            this._brush_armature.animation.fadeIn('ddjshuazi', -1, -1);
            this.brushEffectDrag.node.position = localPos;

        } else if (GameManager.ITEMTYPE === ItemType.change) {

        } else if (GameManager.ITEMTYPE === ItemType.regret) {

        } else if (GameManager.ITEMTYPE === ItemType.none) {
            cc.log('报错了? 状态没设置对')
        } else {
            cc.log('有鬼?')
        }
        this.hideMaskItem();
    }

    /**更具当前达成的阶段分数来展示特效 */
    getEffectNameByType() {
        if (this._successPhase === 2048) {
            return 'jiangbei2048chuxian'
        } else if (this._successPhase === 4096) {
            return 'jiangbei4096chuxian'
        } else if (this._successPhase === 8192) {
            return 'jiangbei8192chuxian'
        } else if (this._successPhase === 16384) {
            return 'jiangbei16384chuxian'
        } else if (this._successPhase === 32768) {
            return 'jiangbei32768chuxian'
        }
    }

    /**
   * 播放成功特效
   * @param id 
   */
    showSuccessNode() {
        cc.log('showSuccessNode--')
        this.successEffectDrag.node.parent.active = true;
        this._success_armature.animation.fadeIn('fenxiang1', -1, -1, 0);

    }

    /**
     * 根据名称播放指定特效
     */
    setEffectNode(name: string) {
        this._effect_armature.animation.fadeIn(name, -1, -1, 0, "normal");
    }

    /**
     * 根据id获取特效名称
     * dtongguan1
     * dbgood
     * dbgreat
     * dbperfect
     * dbunbele
     * damazing
     * dbnandu
     * dbkaishi
     * looding
     * 设置特性
     */
    setEffectName(id: number) {
        let effectName = "";
        switch (id) {
            case 8:
                effectName = "dbgood";
                break;
            case 9:
                effectName = "dbgreat";
                break;
            case 10:
                effectName = "dbperfect";
                break;
            case 11:
                effectName = "dbunbele";
                break;
            case 12:
                effectName = "damazing";
                break;
        }
        if (effectName == "") {
        } else {
            this.setEffectNode(effectName);
        }
    }

    /**
     * 播放特效
     */
    playAudioEffect() {
        // cc.log("播放特效id---->>>", this._audioID);
        if (this._audioID > 12) {
            this._audioID = 0;//
            cc.log("你太牛逼了..连销12个..厉害了，从0继续吧");
            return;
        }
        if (this._audioID <= 0) {
            return;
        }

        //播放 特效
        this.setEffectName(this._audioID);
        AudioMgr.playSFX("audio" + this._audioID + ".ogg");
        //设置合并的步数
        this._mergeStep++;
    }

    /**==================================触摸事件 及游戏主循环逻辑=============================== */

    /**
     * 每一次移动之前都会触发的事件
     */
    everyTimeMoveCallback() {
        //播放滑动的视频
        // AudioMgr.playSFX("move.ogg");
    }

    /**
     * 每一次移动之后都会触发的事件
     */
    everyTimeEndCallback() {

        //播放滑动的视频
        // this._AudioMgr.playSFX("move.ogg");

    }

    /**
     * 每次合并都会触发的事件
     */
    everyTimeMergeCallBack() {

        for (let i = 0; i < this._mergeNode.length; i++) {
            this._score += Number(this._mergeNode[i].name);
        }
        //合并分数
        this.setLabInfo();
    }

    touchEnd(event) {
        if (this._clickFlag && GameManager.PLAYSTATE === PlayState.normal) {
            this._clickFlag = false;
            let pos = event.getLocation()
            this._endPos = cc.v2(pos.x, pos.y);
            this.everyTimeMoveCallback();
            this.checkSlideDirection(this._endPos);
            this._step++;
        } else {
        }
    }

    touchStart(event) {
        if (this._clickFlag && GameManager.PLAYSTATE === PlayState.normal) {
            let pos = event.getLocation()
            this._startPos = cc.v2(pos.x, pos.y);
        } else if (this._clickFlag && GameManager.PLAYSTATE === PlayState.useItem) {
        } else {
        }
    }

    touchCancel(event) {
        if (this._clickFlag && GameManager.PLAYSTATE === PlayState.normal) {
            this._clickFlag = false;
            let pos = event.getLocation()
            this._cancelPos = cc.v2(pos.x, pos.y);
            this.everyTimeMoveCallback();
            this.checkSlideDirection(this._cancelPos);
            this._step++;
        } else {
        }
    }

    /**
     * 检测滑动方向
     */
    checkSlideDirection(point: cc.Vec2) {
        //计算滑动的角度
        let subVect = cc.pSub(this._startPos, point);
        let radian = cc.pToAngle(subVect);//弧度
        let degrees = cc.radiansToDegrees(radian);//弧度转度数
        // degrees = 90 - degrees;
        if ((degrees >= 45 && degrees <= 135) ||
            (degrees <= -45 && degrees >= - 135)) {
            this._slide = slideDirection.UpDown;
        } else {
            this._slide = slideDirection.LeftRight;
        }

        if (this._slide == slideDirection.LeftRight) {
            if (this._startPos.x > point.x) {
                //左滑
                this._direction = direction.left;
            }

            if (this._startPos.x < point.x) {
                //右滑
                this._direction = direction.right;
            }
        } else {
            if (this._startPos.y > point.y) {
                this._direction = direction.down;
            }

            if (this._startPos.y < point.y) {
                this._direction = direction.up;
            }
        }
        this.slideSquare();
    }


    /**
     * 滑动
     * @param sd  滑动方向
     */
    slideSquare() {
        this._mergeNode.length = 0;
        //移动位置  所有块往一个方向移动
        this.moveSqrt();
        this.everyTimeEndCallback();

        if (this._isMerge) {
            this._audioID++;
            this.playAudioEffect();
            this.everyTimeMergeCallBack();
        } else {
            //本次没有合并成功的..音效id从开始
            this._audioID = 0;
            AudioMgr.playSFX("move.ogg");
        }
        this._isMerge = false;

        this.scheduleOnce(() => {
            //检测合并
            //随机生成 数字块
            this.randomSqrtInNULL();

            //判断游戏是否该结束
            if (this.checkGameOver() && GameManager.PLAYSTATE === PlayState.normal) {
                GameManager.PLAYSTATE = PlayState.over;
                cc.log("游戏结束");
                this.gameOver();
                this._clickFlag = true;
                return;
            }
            // }
        }, 0.2);
    }

    /**
     * 游戏结束
     */
    gameOver() {
        //设置分数和步数
        this.saveHistoryScore();

        if (CC_WECHATGAME) {
            //微信后台保存数据
            let score = this.getTheEndBigMergeNumber()
            config.submitScoreToWX(score);
        }

        //添加新的游戏结束画面
        this.showReliveUI();
    }

    showGameOverUI() {
        this.gameOverNode.active = true;
    }

    /**
     * 获取最后的合并的最大的数字
     */
    getTheEndBigMergeNumber() {
        let len = this.content.childrenCount;
        let lastMergeNumber = 0;
        for (let i = 0; i < len; i++) {
            let item = this.content.children[i]
            let itemTs = item.getComponent(Item);
            if (itemTs.isNum()) {
                let curNum = itemTs.getNum();
                if (curNum > lastMergeNumber) {
                    lastMergeNumber = curNum;
                }
            }
        }
        return lastMergeNumber;
    }

    /**
     * 检查游戏是否结束
     */
    checkGameOver() {
        let len = this.content.childrenCount;
        let flag = true;
        for (let i = 0; i < len; i++) {
            let item = this.content.children[i];
            let isNum = item.getComponent(Item).isNum();
            if (!isNum) {
                flag = false;
            }
        }
        if (flag) {
            //检测是否能进行合并
            let isGameOver = this.checkGameOverAllMerge();
            //还可以继续消除合并
            if (isGameOver) {
                flag = false;
            }
        }
        return flag;
    }

    /**
   * 将所有块往一个方向移动
   * 并检查合并  动作等
   */
    moveSqrt() {
        for (let i = 0; i < this.squareNum; i++) {
            this.calcSlidePosition(i);
        }
    }

    /**
     * 计算块的滑动
     * @param line  行/列
     * 
     * 主要移动和合并的逻辑判断
     * 9/13 修改
     */
    calcSlidePosition(line: number) {
        let flagList = new Array();
        let lineList;
        if (this._slide == slideDirection.LeftRight) {
            lineList = this._sqrt[line];
        } else {
            lineList = this._sqrt2[line];
        }

        if (this._direction == direction.left || this._direction == direction.up) {
            for (let i = 0; i < lineList.length; i++) {
                let isNum = lineList[i].getComponent(Item).isNum();
                if (isNum) {
                    flagList.push(i);
                }
            }
        } else {
            for (let i = lineList.length - 1; i >= 0; i--) {
                let isNum = lineList[i].getComponent(Item).isNum();
                if (isNum) {
                    flagList.push(i);
                }
            }
        }

        //合并的个数  这个值很关键
        let index = 0;
        //从左0开始依次把数字块 按顺序排
        //根据方向排列
        if (this._direction == direction.left || this._direction == direction.up) {
            for (let i = 0; i < flagList.length; i++) {
                let oldNode: cc.Node = null;
                let targetNode: cc.Node = null;

                oldNode = lineList[flagList[i]];
                targetNode = lineList[i];
                let num = oldNode.getComponent(Item).getNum();
                targetNode.name = num + "";
                oldNode.getComponent(Item).setHideNum(num);
                if (i > 0) {
                    if (lineList[flagList[i - 1]]) {
                        let preNum = lineList[flagList[i - 1]].getComponent(Item).getHideNum();
                        let curNum = oldNode.getComponent(Item).getHideNum();
                        if (preNum == curNum && curNum != 0) {
                            targetNode = lineList[i - 1 - index];
                            oldNode.getComponent(Item).setHideNum(0);
                            targetNode.name = num * 2 + "";
                            // targetNode.isMerge = true;
                            targetNode['isMerge'] = true;
                            index++;
                            this._isMerge = true;
                            this._mergeNode.push(targetNode);
                        } else {
                            targetNode = lineList[i - index];
                            targetNode.name = num + "";
                        }
                    }
                }
                this.positionMoveAction(oldNode, targetNode, num);
            }
        } else {
            for (let i = 0; i < flagList.length; i++) {
                let oldNode: cc.Node = null;
                let targetNode: cc.Node = null;

                oldNode = lineList[flagList[i]];
                targetNode = lineList[lineList.length - i - 1];
                let num = oldNode.getComponent(Item).getNum();
                targetNode.name = num + "";
                oldNode.getComponent(Item).setHideNum(num);

                if (i > 0) {
                    if (lineList[flagList[i - 1]]) {
                        let preNum = lineList[flagList[i - 1]].getComponent(Item).getHideNum();
                        let curNum = oldNode.getComponent(Item).getHideNum();
                        if (preNum == curNum && curNum != 0) {
                            // targetNode = lineList[i - 1 - index];
                            targetNode = lineList[lineList.length - i + index];
                            oldNode.getComponent(Item).setHideNum(0);
                            targetNode.name = num * 2 + "";
                            targetNode['isMerge'] = true;
                            index++;
                            this._isMerge = true;
                            this._mergeNode.push(targetNode);
                        } else {
                            targetNode = lineList[lineList.length - i + index - 1];
                            targetNode.name = num + "";
                        }
                    }
                }
                this.positionMoveAction(oldNode, targetNode, num);
            }
        }
    }

    checkGameOverAllMerge() {
        //排完序后  在检测 相同数字合并
        for (let i = 0; i < this.squareNum; i++) {
            for (let j = 0; j < this.squareNum; j++) {
                if (j < this.squareNum - 1) {
                    let isModify = this.checkTwoCanBeMerge(this._sqrt[i][j], this._sqrt[i][j + 1]);
                    if (isModify) {
                        return true;
                    }
                }
                if (j < this.squareNum - 1) {
                    let isModify = this.checkTwoCanBeMerge(this._sqrt[i][this.squareNum - j - 1], this._sqrt[i][this.squareNum - j - 2]);
                    if (isModify) {
                        return true;
                    }
                }
                if (j < this.squareNum - 1) {
                    let isModify = this.checkTwoCanBeMerge(this._sqrt2[i][j], this._sqrt2[i][j + 1]);
                    if (isModify) {
                        return true;
                    }
                }
                if (j < this.squareNum - 1) {
                    let isModify = this.checkTwoCanBeMerge(this._sqrt2[i][this.squareNum - j - 1], this._sqrt2[i][this.squareNum - j - 2]);
                    if (isModify) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    //在空白块中随机生成一个 数字块
    randomSqrtInNULL() {
        let len = this.content.childrenCount;
        let nullList: cc.Node[] = new Array();
        for (let i = 0; i < len; i++) {
            let item = this.content.children[i]
            let isNum = item.getComponent(Item).isNum();
            if (!isNum) {
                nullList.push(item);
            }
        }
        let index = Math.floor(Math.random() * nullList.length);
        let num = this.randomNumber();

        if (nullList.length == 0) {
            this._clickFlag = true;
            return;
        }

        //延迟0.2s
        // this.scheduleOnce(() => {
        nullList[index].getComponent(Item).showNumber(num, true);
        this._clickFlag = true;
        // }, 0.3);
    }

    /**
     * 随机一个数字  2/4
     */
    randomNumber(): number {
        return Math.random() < 0.8 ? 2 : 4;
    }

    /**
     * 随机获取一个位置
     */
    randomLocation(): locationInfo {
        let line = Math.floor(Math.random() * this.squareNum);
        let row = Math.floor(Math.random() * this.squareNum);
        return { l: line, r: row };
    }

    /**
     * 是否能合并  并不合并
     */
    checkTwoCanBeMerge(one: cc.Node, two: cc.Node) {
        let item1 = one.getComponent(Item);
        let item2 = two.getComponent(Item);
        let oneFlag = item1.isNum();
        let twoFlag = item2.isNum();
        if (oneFlag && twoFlag) {
            let num1 = item1.getNum();
            let num2 = item2.getNum();
            if (num1 == num2) {
                return true;
            }
        } else if (!oneFlag && twoFlag) {
            return true;
        } else {
            return false;
        }
        return false;
    }


    /**
     * move动作
     */
    positionMoveAction(oldNode: cc.Node, targetNode: cc.Node, num) {
        // 先判断是否需要移动
        if (oldNode === targetNode && !targetNode['isMerge']) {
            return;
            //说明不需要移动.直接return
        }

        oldNode.getComponent(Item).showNumber(0);
        let cloneNode: cc.Node = cc.instantiate(this.squareItem);
        cloneNode.getComponent(Item).showNumber(num);
        cloneNode.position = oldNode.position;
        this.content.addChild(cloneNode);

        let moveAct = cc.moveTo(0.2, targetNode.position);
        cloneNode.runAction(cc.sequence(moveAct, cc.callFunc(() => {
            if (targetNode['isMerge']) {
                targetNode.getComponent(Item).showNumber(Number(targetNode.name), false, true);
                targetNode['isMerge'] = false;
            } else {
                targetNode.getComponent(Item).showNumber(Number(targetNode.name));
            }
            this.content.removeChild(cloneNode);
            cloneNode.removeFromParent();
            cloneNode.destroy();
        })));

        if (Number(targetNode.name) === this._successPhase) {
            this.showSuccessNode();
        }

        //检测是否成功！
        if (Number(targetNode.name) > this._successPhase) {
            this.setTheSuccessType(Number(targetNode.name));
        }
    }

    /**==================================功能函数=============================== */

    /**
     * 通过类型获取分数
     */
    getTargetScoreByType(type: successType) {
        switch (type) {
            case successType.success_2048:
                return successType.success_4096;
            case successType.success_4096:
                return successType.success_8192;
            case successType.success_8192:
                return successType.success_16384;
            case successType.success_16384:
                return successType.success_32768;
            case successType.success_32768:
                return successType.success_32768;
        }
    }

    //当分数设置直接高过2048时  主要用于测试   不排除后续开发bigNumber 合成游戏
    setTheSuccessType(num: number) {
        if (num >= 0 && num < 2048) {
            this._successPhase = successType.success_2048;
        } else if (num >= 2048 && num < 4096) {
            this._successPhase = successType.success_4096;
        } else if (num >= 4096 && num < 8192) {
            this._successPhase = successType.success_8192;
        } else if (num >= 8192 && num < 16384) {
            this._successPhase = successType.success_16384;
        } else if (num >= 16384 && num < 32768) {
            this._successPhase = successType.success_32768;
        } else {
            this.showHintUI(HintUIType.Failure, '啊哦,出错误了');
        }
    }

    /**
     * 重新开始游戏
     */
    reSetGame() {
        this.gameOverNode.active = false;
        this.pauseGameNode.active = false;
        this.reliveNode.active = false;
        this.content.removeAllChildren();
        this._sqrt = null;
        this._sqrt2 = null;

        this._score = 0;
        this._step = 0;
        this._clickFlag = true;
        GameManager.PLAYSTATE = PlayState.normal;
        GameManager.ITEMTYPE = ItemType.none;
        this.initGame();
        this.setEffectNode('dbkaishi');
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

    showGetItemView(type: ItemType) {
        this._clickItem = type;
        this.getItemView.getComponent(GetItemUI).showItem(type);
        this.getItemView.active = true;
        //
    }

    /**
     * 返回大厅
     */
    returnToHall() {
        cc.director.loadScene("main");
    }

    /**---------------------------------------------------道具使用---------------------------------*/
    /**
     *  使用锤子道具    消除一个指定的道具
     */
    useHemmerItem(event) {
        if (!this.judgeItemEnough(ItemType.hummer)) {
            // this.showHintUI(HintUIType.Failure, '道具不足');
            this.showGetItemView(ItemType.hummer);
            return
        }
        GameManager.PLAYSTATE = PlayState.useItem;
        GameManager.ITEMTYPE = ItemType.hummer;
        this.useItemManage(event.currentTarget);

        //先判断 道具数量够不够
        //不够了去买钻石
        //钻石数量够不够/
        //不够了去看广告去,看完给你发钻石..ok?
        //展示阴影部分

        //点击一个道具 消灭它
    }

    /**
     * 刷子      给一个数字快随机一个数字
     */
    useBrushItem(event) {
        if (!this.judgeItemEnough(ItemType.brush)) {
            // this.showHintUI(HintUIType.Failure, '道具不足');
            this.showGetItemView(ItemType.brush);
            return
        }
        GameManager.PLAYSTATE = PlayState.useItem;
        GameManager.ITEMTYPE = ItemType.brush;
        this.useItemManage(event.currentTarget);
    }

    /**
     * 换位工具   两个数字块相互换位
     */
    useChangeItem(event) {
        if (!this.judgeItemEnough(ItemType.change)) {
            // this.showHintUI(HintUIType.Failure, '道具不足');
            this.showGetItemView(ItemType.change);
            return
        }
        GameManager.PLAYSTATE = PlayState.useItem;
        GameManager.ITEMTYPE = ItemType.change;
        this.useItemManage(event.currentTarget);
    }

    /**
     * 返回上一步  返回上一步状态
     */
    useRegretItem(event) {
        GameManager.PLAYSTATE = PlayState.useItem;
        GameManager.ITEMTYPE = ItemType.regret;
        this.useItemManage(event.currentTarget);
    }

    useItemManage(target: cc.Node) {
        // let item = cc.instantiate(this.showItemNode);
        this.showItemNode.active = true;
        this.showItemNode.getComponent(GameProp).init(GameManager.ITEMTYPE, target);
        // this.uiLayer.addChild(item);
    }

    //隐藏道具使用
    hideMaskItem() {
        this.showItemNode.active = false;
    }

    /**
     * 道具使用后 给服务器发消息
     */
    calcUserItem(type: ItemType) {
        cc.log("使用了道具");
        let userInfo = GameManager.userInfo;
        //前端扣除 然后再给服务器发消息
        if (type === ItemType.hummer) {
            userInfo.hummer -= 1;
            if (userInfo.hummer < 0) {
                userInfo.hummer = 0;
                cc.log('err-->>>锤子道具数量小于零');
            }
        } else if (type === ItemType.brush) {
            userInfo.brush -= 1;
            if (userInfo.brush < 0) {
                userInfo.brush = 0;
                cc.log('err-->>>刷子道具数量小于零');
            }
        } else if (type === ItemType.change) {
            userInfo.change -= 1;
            if (userInfo.change < 0) {
                userInfo.change = 0;
                cc.log('err-->>>换位道具数量小于零');
            }
        }

        // 保存用户数据
        GameManager.saveItemData();

        //更新界面展示
        this.initBottomItem();

        // let param = {
        //     itemType: type
        // }

        // HTTPMgr.post('userItem', param).then((res) => {

        // }).catch((err) => {

        // });
    }

    /**
     * 判断道具是否足够
     */
    judgeItemEnough(type: ItemType) {
        let userInfo = GameManager.userInfo;
        if (type === ItemType.brush) {
            return userInfo.brush >= 1;
        } else if (type === ItemType.hummer) {
            return userInfo.hummer >= 1;
        } else if (type === ItemType.change) {
            return userInfo.change >= 1;
        }
    }
}
