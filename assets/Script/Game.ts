import Item from "./Item";
import AudioMgr from "./AudioMgr";
import GameManager from "./GameManager";

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


@ccclass
export default class Game extends cc.Component {

    @property(cc.SpriteAtlas)
    numberAtlas: cc.SpriteAtlas = null;

    @property(cc.Prefab)
    squareItem: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Label)
    scoreLab: cc.Label = null;

    @property(cc.Label)
    stepLab: cc.Label = null;

    @property(cc.Node)
    effectNode: cc.Node = null;

    @property(cc.Prefab)
    gameOverPrefab: cc.Prefab = null;

    //上一次触摸点位置
    _pos: cc.Vec2 = null;

    _endPos: cc.Vec2 = null; //结束点
    _startPos: cc.Vec2 = null;//开始点
    _cancelPos: cc.Vec2 = null;//取消点

    //分数
    _score: number = 0;
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

    //当前龙骨动画的armature对象
    _armature: dragonBones.Armature = null;

    //本次是否进行过合并
    _isMerge: boolean = false;

    //播放音效的ID
    _audioID: number = -1;

    _clickFlag: boolean = true;

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
        Game._instance = this;
        //大厅是不播放背景音乐的
        // this._AudioMgr.playBGM("BGM.mp3");

        //初始化
        this.initGame();

        this.content.width = this._sqrt[0][0].width * this.squareNum + (this.squareNum + 1) * 20;
        this.content.height = this._sqrt[0][0].height * this.squareNum + (this.squareNum + 1) * 20;

        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);

        this.initEffect();
    }

    /**
     * 初始化特效
     */
    initEffect() {
        let dragon = this.effectNode.getComponent(dragonBones.ArmatureDisplay);
        this._armature = dragon.armature();
    }

    /**
     * 
     * 根据名称播放指定特效
     */
    setEffectNode(name: string) {
        this._armature.animation.fadeIn(name, -1, -1, 0, "normal");
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
        cc.log("播放特效id---->>>", this._audioID);
        if (this._audioID > 12) {
            this._audioID = -1;//
            cc.log("你太牛逼了..连销12个..厉害了，从0继续吧");
            return;
        }
        if (this._audioID <= 0) {
            cc.log("下一次就有声音了哦");
            return;
        }

        //播放 特效
        this.setEffectName(this._audioID);
        AudioMgr.playSFX("audio" + this._audioID + ".ogg");
        //设置合并的步数
        this._mergeStep++;
    }

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
                // item.getComponent(Item).showNumber(2);
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
        // item0.getComponent(Item).showNumber(4);
        // item1.getComponent(Item).showNumber(16);
        // item2.getComponent(Item).showNumber(16);
        // item3.getComponent(Item).showNumber(4);
    }

    /**
     * 设置面板信息
     */
    setLabInfo() {
        // this.scoreLab.string = this._score + "";
        // this.stepLab.string = this._step + "";
    }

    /**
     * 每一次移动之前都会触发的事件
     */
    everyTimeMoveCallback() {
        //播放滑动的视频
        AudioMgr.playSFX("move.ogg");
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


    }

    touchEnd(event) {
        if (this._clickFlag) {
            this._clickFlag = false;
            let pos = event.getLocation()
            this._endPos = cc.v2(pos.x, pos.y);
            this.everyTimeMoveCallback();
            this.checkSlideDirection(this._endPos);
            this._step++;
            this.setLabInfo();
        } else {
            cc.log("你点的太快了");
        }

    }

    touchStart(event) {
        let pos = event.getLocation()
        this._startPos = cc.v2(pos.x, pos.y);
    }

    touchCancel(event) {
        if (this._clickFlag) {
            this._clickFlag = false;
            let pos = event.getLocation()
            this._cancelPos = cc.v2(pos.x, pos.y);
            this.everyTimeMoveCallback();
            this.checkSlideDirection(this._cancelPos);
            this._step++;
            this.setLabInfo();
        } else {
            cc.log("你点的太快了");
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
        //判断游戏是否该结束
        if (this.checkGameOver()) {
            cc.log("游戏结束");
            this.gameOver();
            this._clickFlag = true;
            return;
        }

        //移动位置  所有块往一个方向移动
        this.moveSqrt();
        this.everyTimeEndCallback();

        if (this._isMerge) {
            //本次有合并成功的
            //   音效id++
            this._audioID++;
            //播放音效
            this.playAudioEffect();
            this.everyTimeMergeCallBack();
        } else {
            //本次没有合并成功的..音效id从开始
            this._audioID = -1;
        }
        this._isMerge = false;

        this.scheduleOnce(() => {
            //检测合并
            // let flag = this.checkAllMerge();
            // this.randomSqrtInNULL();
            // cc.log("flag--->>>", flag);
            // if (flag) {
            //     this.slideSquare();
            // } else {
            //随机生成 数字块
            this.randomSqrtInNULL();
            // }
        }, 0.2);
    }

    /**
     * 游戏结束
     */
    gameOver() {
        // this.gameOverNode.active = true;
        // this.

        //设置分数和步数

        //重新开始按钮
        let gameOver = cc.instantiate(this.gameOverPrefab);
        this.node.addChild(gameOver);
        // gameOver.position = cc.v2(this.node.x, gameOver.y + this.node.height);
        //从小到大的动画
        gameOver.scale = 0;
        let mask = gameOver.getChildByName("mask");
        mask.active = false;
        gameOver.zIndex = 99;
        let act = cc.scaleTo(0.3, 1).easing(cc.easeOut(3.0));
        let seqAct = cc.sequence(act, cc.callFunc(() => {
            mask.active = true;
        }));
        gameOver.runAction(seqAct);
    }

    /**
     * 检查游戏是否结束
     */
    checkGameOver() {
        let len = this.content.childrenCount;
        let flag = true;
        for (let i = 0; i < len; i++) {
            let item = this.content.children[i]
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
                            index++;
                            this._isMerge = true;
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
                            index++;
                            this._isMerge = true;
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

    //检测所有的合并项
    checkAllMerge() {
        let flag = false;
        //排完序后  在检测 相同数字合并
        for (let i = 0; i < this.squareNum; i++) {
            for (let j = 0; j < this.squareNum; j++) {
                if (this._direction == direction.left) {
                    if (j < this.squareNum - 1) {
                        let isModify = this.checkTwoMerge(this._sqrt[i][j], this._sqrt[i][j + 1]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                } else if (this._direction == direction.right) {
                    if (j < this.squareNum - 1) {
                        let isModify = this.checkTwoMerge(this._sqrt[i][this.squareNum - j - 1], this._sqrt[i][this.squareNum - j - 2]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                } else if (this._direction == direction.up) {
                    if (j < this.squareNum - 1) {
                        let isModify = this.checkTwoMerge(this._sqrt2[i][j], this._sqrt2[i][j + 1]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                } else if (this._direction == direction.down) {
                    if (j < this.squareNum - 1) {
                        let isModify = this.checkTwoMerge(this._sqrt2[i][this.squareNum - j - 1], this._sqrt2[i][this.squareNum - j - 2]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                }
            }
        }
        return flag;
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

        let nullList = new Array();

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

    // /**
    //  * 计算水平滑动
    //  * 计算一行内所有数字块的位置,并进行 移动
    //  * @param line 行
    //  */
    // calcHorizontalSlidePosition(line: number) {
    //     this.calcSlidePosition(line);
    //     return;
    //     let lineList = this._sqrt[line];
    //     let flagList = new Array();

    //     if (this._direction == direction.left) {
    //         for (let i = 0; i < lineList.length; i++) {
    //             let isNum = lineList[i].getComponent(Item).isNum();
    //             if (isNum) {
    //                 flagList.push(i);
    //             }
    //         }
    //     } else {
    //         for (let i = lineList.length - 1; i >= 0; i--) {
    //             let isNum = lineList[i].getComponent(Item).isNum();
    //             if (isNum) {
    //                 flagList.push(i);
    //             }
    //         }
    //     }

    //     let index = 0;
    //     //从左0开始依次把数字块 按顺序排
    //     //根据方向排列

    //     if (this._direction == direction.left) {
    //         for (let i = 0; i < flagList.length; i++) {
    //             let oldNode: cc.Node = null;
    //             let targetNode: cc.Node = null;

    //             oldNode = lineList[flagList[i]];
    //             targetNode = lineList[i];
    //             let num = oldNode.getComponent(Item).getNum();
    //             targetNode.name = num + "";
    //             oldNode.getComponent(Item).setHideNum(num);

    //             if (i > 0) {
    //                 if (lineList[flagList[i - 1]]) {
    //                     let preNum = lineList[flagList[i - 1]].getComponent(Item).getHideNum();
    //                     let curNum = oldNode.getComponent(Item).getHideNum();
    //                     if (preNum == curNum && curNum != 0) {
    //                         targetNode = lineList[i - 1 - index];
    //                         oldNode.getComponent(Item).setHideNum(0);
    //                         targetNode.name = num * 2 + "";
    //                         index++;
    //                     } else {
    //                         targetNode = lineList[i - index];
    //                     }
    //                 }
    //             }
    //             this.positionMoveAction(oldNode, targetNode, num);
    //         }
    //     } else {
    //         for (let i = 0; i < flagList.length; i++) {
    //             let oldNode: cc.Node = null;
    //             let targetNode: cc.Node = null;

    //             oldNode = lineList[flagList[i]];
    //             targetNode = lineList[lineList.length - i - 1];
    //             let num = oldNode.getComponent(Item).getNum();
    //             targetNode.name = num + "";
    //             oldNode.getComponent(Item).setHideNum(num);

    //             if (i > 0) {
    //                 if (lineList[flagList[i - 1]]) {
    //                     let preNum = lineList[flagList[i - 1]].getComponent(Item).getHideNum();
    //                     let curNum = oldNode.getComponent(Item).getHideNum();
    //                     if (preNum == curNum && curNum != 0) {
    //                         // targetNode = lineList[i - 1 - index];
    //                         targetNode = lineList[lineList.length - i + index];
    //                         oldNode.getComponent(Item).setHideNum(0);
    //                         targetNode.name = num * 2 + "";
    //                         index++;
    //                     } else {
    //                         targetNode = lineList[lineList.length - i + index - 1];
    //                     }
    //                 }
    //             }
    //             this.positionMoveAction(oldNode, targetNode, num);
    //         }
    //     }
    // }

    // /**
    //  * 竖直滑动
    //  * 计算一列内所有数字块的位置,并进行 移动
    //  */
    // calcVerticalSlidePosition(row: number) {
    //     this.calcSlidePosition(row);
    //     return;
    //     let rowList = this._sqrt2[row];
    //     let flagList = new Array();
    //     for (let i = 0; i < rowList.length; i++) {
    //         let isNum = rowList[i].getComponent(Item).isNum();
    //         if (isNum) {
    //             flagList.push(i);
    //         }
    //     }

    //     //从左0开始依次把数字块 按顺序排
    //     //根据方向排列
    //     for (let i = 0; i < flagList.length; i++) {
    //         let oldNode: cc.Node = null;
    //         // let cloneNode: cc.Node = cc.instantiate(this.squareItem);
    //         let targetNode: cc.Node = null;

    //         if (this._direction == direction.up) {
    //             // let num = rowList[flagList[i]].getComponent(Item).getNum();
    //             // rowList[i].getComponent(Item).showNumber(num);

    //             oldNode = rowList[flagList[i]];
    //             let num = oldNode.getComponent(Item).getNum();
    //             // cloneNode.getComponent(Item).showNumber(num);
    //             // cloneNode.position = oldNode.position;
    //             // cloneNode.name = num + "";
    //             oldNode.name = num + "";
    //             targetNode = rowList[i];
    //             oldNode.getComponent(Item).showNumber(0);
    //         } else if (this._direction == direction.down) {
    //             // let num = rowList[flagList[flagList.length - i - 1]].getComponent(Item).getNum();
    //             // rowList[rowList.length - i - 1].getComponent(Item).showNumber(num);

    //             oldNode = rowList[flagList[flagList.length - i - 1]];
    //             let num = oldNode.getComponent(Item).getNum();
    //             oldNode.name = num + "";
    //             // cloneNode.getComponent(Item).showNumber(num);
    //             // cloneNode.position = oldNode.position;
    //             // cloneNode.name = num + "";
    //             targetNode = rowList[rowList.length - i - 1];
    //             oldNode.getComponent(Item).showNumber(0);
    //         }

    //         //A克隆一个节点A1,然后把节点A置空,然后移动到指定节点B位置
    //         // cloneNode = cc.instantiate(lineList[flagList[i]]);
    //         // this.content.addChild(cloneNode);
    //         // this.positionMoveAction(oldNode, targetNode);
    //     }

    //     //置空 之前的块
    //     // for (let i = 0; i < rowList.length; i++) {
    //     //     if (this._direction == direction.up) {
    //     //         if (i > flagList.length - 1) {
    //     //             rowList[i].getComponent(Item).showNumber(0);
    //     //         }
    //     //     } else if (this._direction == direction.down) {
    //     //         if (i < rowList.length - flagList.length) {
    //     //             rowList[i].getComponent(Item).showNumber(0);
    //     //         }
    //     //     }
    //     // }
    // }

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
     * 检测两个合并   能合并就合并
     */
    checkTwoMerge(one: cc.Node, two: cc.Node): boolean {
        let item1 = one.getComponent(Item);
        let item2 = two.getComponent(Item);

        let oneFlag = item1.isNum();
        let twoFlag = item2.isNum();

        if (oneFlag && twoFlag) {
            let num1 = item1.getNum();
            let num2 = item2.getNum();
            if (num1 == num2) {
                //合并两个
                item1.showNumber(num1 * 2);
                item2.showNumber(0);
                // let cloneNode: cc.Node = cc.instantiate(this.squareItem);
                // cloneNode.getComponent(Item).showNumber(num2);
                // cloneNode.position = two.position;
                // cloneNode.name = num2 + "";
                two.name = num2 * 2 + "";
                // this.positionMoveAction(two, one);
                //进行飞行动作
                this._score += num1;
                cc.log("合并两个--->>>");
                item1.playParticle();
                return true;
            }
        } else if (!oneFlag && twoFlag) {
            let num = item2.getNum();
            item1.showNumber(num);
            item2.showNumber(0);
            return true;
        } else {
            // this._isContinue = false;
            return false;
        }
        return false;
    }

    /**
     * move动作
     */
    positionMoveAction(oldNode: cc.Node, targetNode: cc.Node, num) {
        oldNode.getComponent(Item).showNumber(0);
        let cloneNode: cc.Node = cc.instantiate(this.squareItem);
        cloneNode.getComponent(Item).showNumber(num);
        cloneNode.position = oldNode.position;
        this.content.addChild(cloneNode);
        let runTime;
        if (this._slide == slideDirection.LeftRight) {
            runTime = Math.floor(Math.abs(oldNode.x - targetNode.x) / cloneNode.height) * 0.1;
        } else {
            runTime = Math.floor(Math.abs(oldNode.y - targetNode.y) / cloneNode.height) * 0.1;
        }

        let moveAct = cc.moveTo(0.2, targetNode.position);
        cloneNode.runAction(cc.sequence(moveAct, cc.callFunc(() => {
            if (targetNode.isMerge) {
                targetNode.getComponent(Item).showNumber(Number(targetNode.name), true);
                targetNode.isMerge = false;
            } else {
                targetNode.getComponent(Item).showNumber(Number(targetNode.name));
            }
            this.content.removeChild(cloneNode);
            cloneNode.removeFromParent();
            cloneNode.destroy();
        })));
    }

    /**
     * 重新开始游戏
     */
    reSetGame() {
        this.content.removeAllChildren();
        this._sqrt = null;
        this._sqrt2 = null;

        this._score = 0;
        this._step = 0;
        this._clickFlag = true;
        this.initGame();
    }

    /**
     * 返回大厅
     */
    returnToHall() {
        cc.director.loadScene("main");
    }

}
