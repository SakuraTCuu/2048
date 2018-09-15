"use strict";
cc._RF.push(module, '64b8176Jz1ACbR6ZTDH7KkE', 'Game');
// Script/Game.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Item_1 = require("./Item");
var AudioMgr_1 = require("./AudioMgr");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var slideDirection;
(function (slideDirection) {
    slideDirection[slideDirection["LeftRight"] = 1] = "LeftRight";
    slideDirection[slideDirection["UpDown"] = 2] = "UpDown";
})(slideDirection = exports.slideDirection || (exports.slideDirection = {}));
var direction;
(function (direction) {
    direction[direction["left"] = 0] = "left";
    direction[direction["right"] = 1] = "right";
    direction[direction["up"] = 2] = "up";
    direction[direction["down"] = 3] = "down";
})(direction = exports.direction || (exports.direction = {}));
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numberAtlas = null;
        _this.squareItem = null;
        _this.content = null;
        _this.scoreLab = null;
        _this.stepLab = null;
        _this.effectNode = null;
        //上一次触摸点位置
        _this._pos = null;
        _this._endPos = null; //结束点
        _this._startPos = null; //开始点
        _this._cancelPos = null; //取消点
        //分数
        _this._score = 0;
        //步数
        _this._step = 0;
        //合并的步数
        _this._mergeStep = 0;
        //每一行的格子数
        _this.squareNum = 4;
        //格子的二维数组  横向
        _this._sqrt = null;
        //格子的二维数组  竖向
        _this._sqrt2 = null;
        //滑动方向 默认向左划
        _this._direction = direction.left;
        _this._slide = slideDirection.LeftRight;
        //当前龙骨动画的armature对象
        _this._armature = null;
        //本次是否进行过合并
        _this._isMerge = false;
        //播放音效的ID
        _this._audioID = -1;
        _this._AudioMgr = null;
        _this._clickFlag = true;
        return _this;
    }
    Game_1 = Game;
    Object.defineProperty(Game, "instance", {
        get: function () {
            return Game_1._instance;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 2048 小方块
     * 每一步都出现一个方块 2
     * 游戏开始 有两个随机数字 (2,4)或(2,2)
     * 2,4,8,16,32,64,128,256,512,1024,2048
     */
    Game.prototype.onLoad = function () {
        Game_1._instance = this;
        this._AudioMgr = new AudioMgr_1.default();
        this._AudioMgr.StopBGM();
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
    };
    /**
     * 初始化特效
     */
    Game.prototype.initEffect = function () {
        var dragon = this.effectNode.getComponent(dragonBones.ArmatureDisplay);
        this._armature = dragon.armature();
    };
    /**
     *
     * 根据名称播放指定特效
     */
    Game.prototype.setEffectNode = function (name) {
        this._armature.animation.fadeIn(name, -1, -1, 0, "normal");
    };
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
    Game.prototype.setEffectName = function (id) {
        var effectName = "";
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
        }
        else {
            this.setEffectNode(effectName);
        }
    };
    /**
     * 播放特效
     */
    Game.prototype.playAudioEffect = function () {
        cc.log("播放特效id---->>>", this._audioID);
        if (this._audioID > 12) {
            this._audioID = -1; //
            cc.log("你太牛逼了..连销12个..厉害了，从0继续吧");
            return;
        }
        if (this._audioID <= 0) {
            cc.log("下一次就有声音了哦");
            return;
        }
        //播放 特效
        this.setEffectName(this._audioID);
        this._AudioMgr.playSFX("audio" + this._audioID + ".ogg");
        //设置合并的步数
        this._mergeStep++;
    };
    Game.prototype.initGame = function () {
        var _this = this;
        this._sqrt = new Array();
        this._sqrt2 = new Array();
        //多维数组不能直接定义多维，只能层层定义，很多高级语言都是如此
        for (var i = 0; i < this.squareNum; i++) {
            this._sqrt2[i] = new Array(); //多维数组层层定义
        }
        for (var i = 0; i < this.squareNum; i++) {
            this._sqrt[i] = new Array(); //多维数组层层定义
            for (var j = 0; j < this.squareNum; j++) {
                var item = cc.instantiate(this.squareItem);
                item.name = i + "" + j;
                // item.getComponent(Item).showNumber(2);
                this._sqrt[i][j] = item;
                this._sqrt2[j][i] = item;
                this.content.addChild(item);
                //计算位置
                this.initPos(item, i, j);
            }
        }
        this.scheduleOnce(function () {
            //随机两个存在的数字
            _this.initGrid();
        }, 0.2);
    };
    //初始化位置 ，不用layout组件
    Game.prototype.initPos = function (item, i, j) {
        // let x = item.width * i + item.width / 2 + (i + 1) * 20;
        // let y = item.height * j + item.width / 2 + (j + 1) * 20;
        var x = item.width * j + item.width / 2 + (j + 1) * 20;
        var y = item.height * i + item.width / 2 + (i + 1) * 20 + 20;
        item.position = cc.v2(x, -y);
    };
    Game.prototype.initGrid = function () {
        var location1 = this.randomLocation();
        var location2 = this.randomLocation();
        var grid1 = this.randomNumber();
        var grid2 = this.randomNumber();
        //获取随机到的两个数的节点
        var item1 = this.content.getChildByName(location1.l + "" + location1.r);
        var item2 = this.content.getChildByName(location2.l + "" + location2.r);
        item1.getComponent(Item_1.default).showNumber(grid1, true);
        item2.getComponent(Item_1.default).showNumber(grid2, true);
        // let item0 = this.content.getChildByName("00");
        // let item1 = this.content.getChildByName("01");
        // let item2 = this.content.getChildByName("02");
        // let item3 = this.content.getChildByName("03");
        // item0.getComponent(Item).showNumber(4);
        // item1.getComponent(Item).showNumber(16);
        // item2.getComponent(Item).showNumber(16);
        // item3.getComponent(Item).showNumber(4);
    };
    /**
     * 设置面板信息
     */
    Game.prototype.setLabInfo = function () {
        this.scoreLab.string = this._score + "";
        this.stepLab.string = this._step + "";
    };
    /**
     * 每一次移动之前都会触发的事件
     */
    Game.prototype.everyTimeMoveCallback = function () {
        //播放滑动的视频
        this._AudioMgr.playSFX("move.ogg");
    };
    /**
     * 每一次移动之后都会触发的事件
     */
    Game.prototype.everyTimeEndCallback = function () {
        //播放滑动的视频
        // this._AudioMgr.playSFX("move.ogg");
    };
    /**
     * 每次合并都会触发的事件
     */
    Game.prototype.everyTimeMergeCallBack = function () {
    };
    Game.prototype.touchEnd = function (event) {
        if (this._clickFlag) {
            this._clickFlag = false;
            var pos = event.getLocation();
            this._endPos = cc.v2(pos.x, pos.y);
            this.everyTimeMoveCallback();
            this.checkSlideDirection(this._endPos);
            this._step++;
            this.setLabInfo();
        }
        else {
            cc.log("你点的太快了");
        }
    };
    Game.prototype.touchStart = function (event) {
        var pos = event.getLocation();
        this._startPos = cc.v2(pos.x, pos.y);
    };
    Game.prototype.touchCancel = function (event) {
        if (this._clickFlag) {
            this._clickFlag = false;
            var pos = event.getLocation();
            this._cancelPos = cc.v2(pos.x, pos.y);
            this.everyTimeMoveCallback();
            this.checkSlideDirection(this._cancelPos);
            this._step++;
            this.setLabInfo();
        }
        else {
            cc.log("你点的太快了");
        }
    };
    /**
     * 检测滑动方向
     */
    Game.prototype.checkSlideDirection = function (point) {
        //计算滑动的角度
        var subVect = cc.pSub(this._startPos, point);
        var radian = cc.pToAngle(subVect); //弧度
        var degrees = cc.radiansToDegrees(radian); //弧度转度数
        // degrees = 90 - degrees;
        if ((degrees >= 45 && degrees <= 135) ||
            (degrees <= -45 && degrees >= -135)) {
            this._slide = slideDirection.UpDown;
        }
        else {
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
        }
        else {
            if (this._startPos.y > point.y) {
                this._direction = direction.down;
            }
            if (this._startPos.y < point.y) {
                this._direction = direction.up;
            }
        }
        this.slideSquare();
    };
    /**
     * 滑动
     * @param sd  滑动方向
     */
    Game.prototype.slideSquare = function () {
        var _this = this;
        //判断游戏是否该结束
        if (this.checkGameOver()) {
            cc.log("游戏结束");
            this.gameOver();
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
        }
        else {
            //本次没有合并成功的..音效id从开始
            this._audioID = -1;
        }
        this._isMerge = false;
        this.scheduleOnce(function () {
            //检测合并
            // let flag = this.checkAllMerge();
            // this.randomSqrtInNULL();
            // cc.log("flag--->>>", flag);
            // if (flag) {
            //     this.slideSquare();
            // } else {
            //随机生成 数字块
            _this.randomSqrtInNULL();
            // }
        }, 0.2);
    };
    /**
     * 游戏结束
     */
    Game.prototype.gameOver = function () {
        // this.gameOverNode.active = true;
        // this.
        //设置分数和步数
        //重新开始按钮
    };
    /**
     * 检查游戏是否结束
     */
    Game.prototype.checkGameOver = function () {
        var len = this.content.childrenCount;
        var flag = true;
        for (var i = 0; i < len; i++) {
            var item = this.content.children[i];
            var isNum = item.getComponent(Item_1.default).isNum();
            if (!isNum) {
                flag = false;
            }
        }
        if (flag) {
            //检测是否能进行合并
            var isGameOver = this.checkGameOverAllMerge();
            //还可以继续消除合并
            if (isGameOver) {
                flag = false;
            }
        }
        return flag;
    };
    /**
   * 将所有块往一个方向移动
   */
    Game.prototype.moveSqrt = function () {
        for (var i = 0; i < this.squareNum; i++) {
            this.calcSlidePosition(i);
        }
    };
    /**
     * 计算块的滑动
     * @param line  行/列
     *
     * 主要移动和合并的逻辑判断
     * 9/13 修改
     */
    Game.prototype.calcSlidePosition = function (line) {
        var flagList = new Array();
        var lineList;
        if (this._slide == slideDirection.LeftRight) {
            lineList = this._sqrt[line];
        }
        else {
            lineList = this._sqrt2[line];
        }
        if (this._direction == direction.left || this._direction == direction.up) {
            for (var i = 0; i < lineList.length; i++) {
                var isNum = lineList[i].getComponent(Item_1.default).isNum();
                if (isNum) {
                    flagList.push(i);
                }
            }
        }
        else {
            for (var i = lineList.length - 1; i >= 0; i--) {
                var isNum = lineList[i].getComponent(Item_1.default).isNum();
                if (isNum) {
                    flagList.push(i);
                }
            }
        }
        var index = 0;
        //从左0开始依次把数字块 按顺序排
        //根据方向排列
        if (this._direction == direction.left || this._direction == direction.up) {
            for (var i = 0; i < flagList.length; i++) {
                var oldNode = null;
                var targetNode = null;
                oldNode = lineList[flagList[i]];
                targetNode = lineList[i];
                var num = oldNode.getComponent(Item_1.default).getNum();
                targetNode.name = num + "";
                oldNode.getComponent(Item_1.default).setHideNum(num);
                if (i > 0) {
                    if (lineList[flagList[i - 1]]) {
                        var preNum = lineList[flagList[i - 1]].getComponent(Item_1.default).getHideNum();
                        var curNum = oldNode.getComponent(Item_1.default).getHideNum();
                        if (preNum == curNum && curNum != 0) {
                            targetNode = lineList[i - 1 - index];
                            oldNode.getComponent(Item_1.default).setHideNum(0);
                            targetNode.name = num * 2 + "";
                            // targetNode.isMerge = true;
                            index++;
                            this._isMerge = true;
                        }
                        else {
                            targetNode = lineList[i - index];
                            targetNode.name = num + "";
                        }
                    }
                }
                this.positionMoveAction(oldNode, targetNode, num);
            }
        }
        else {
            for (var i = 0; i < flagList.length; i++) {
                var oldNode = null;
                var targetNode = null;
                oldNode = lineList[flagList[i]];
                targetNode = lineList[lineList.length - i - 1];
                var num = oldNode.getComponent(Item_1.default).getNum();
                targetNode.name = num + "";
                oldNode.getComponent(Item_1.default).setHideNum(num);
                if (i > 0) {
                    if (lineList[flagList[i - 1]]) {
                        var preNum = lineList[flagList[i - 1]].getComponent(Item_1.default).getHideNum();
                        var curNum = oldNode.getComponent(Item_1.default).getHideNum();
                        if (preNum == curNum && curNum != 0) {
                            // targetNode = lineList[i - 1 - index];
                            targetNode = lineList[lineList.length - i + index];
                            oldNode.getComponent(Item_1.default).setHideNum(0);
                            targetNode.name = num * 2 + "";
                            index++;
                            this._isMerge = true;
                        }
                        else {
                            targetNode = lineList[lineList.length - i + index - 1];
                            targetNode.name = num + "";
                        }
                    }
                }
                this.positionMoveAction(oldNode, targetNode, num);
            }
        }
    };
    //检测所有的合并项
    Game.prototype.checkAllMerge = function () {
        var flag = false;
        //排完序后  在检测 相同数字合并
        for (var i = 0; i < this.squareNum; i++) {
            for (var j = 0; j < this.squareNum; j++) {
                if (this._direction == direction.left) {
                    if (j < this.squareNum - 1) {
                        var isModify = this.checkTwoMerge(this._sqrt[i][j], this._sqrt[i][j + 1]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                }
                else if (this._direction == direction.right) {
                    if (j < this.squareNum - 1) {
                        var isModify = this.checkTwoMerge(this._sqrt[i][this.squareNum - j - 1], this._sqrt[i][this.squareNum - j - 2]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                }
                else if (this._direction == direction.up) {
                    if (j < this.squareNum - 1) {
                        var isModify = this.checkTwoMerge(this._sqrt2[i][j], this._sqrt2[i][j + 1]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                }
                else if (this._direction == direction.down) {
                    if (j < this.squareNum - 1) {
                        var isModify = this.checkTwoMerge(this._sqrt2[i][this.squareNum - j - 1], this._sqrt2[i][this.squareNum - j - 2]);
                        if (isModify) {
                            flag = true;
                        }
                    }
                }
            }
        }
        return flag;
    };
    Game.prototype.checkGameOverAllMerge = function () {
        //排完序后  在检测 相同数字合并
        for (var i = 0; i < this.squareNum; i++) {
            for (var j = 0; j < this.squareNum; j++) {
                if (j < this.squareNum - 1) {
                    var isModify = this.checkTwoCanBeMerge(this._sqrt[i][j], this._sqrt[i][j + 1]);
                    if (isModify) {
                        return true;
                    }
                }
                if (j < this.squareNum - 1) {
                    var isModify = this.checkTwoCanBeMerge(this._sqrt[i][this.squareNum - j - 1], this._sqrt[i][this.squareNum - j - 2]);
                    if (isModify) {
                        return true;
                    }
                }
                if (j < this.squareNum - 1) {
                    var isModify = this.checkTwoCanBeMerge(this._sqrt2[i][j], this._sqrt2[i][j + 1]);
                    if (isModify) {
                        return true;
                    }
                }
                if (j < this.squareNum - 1) {
                    var isModify = this.checkTwoCanBeMerge(this._sqrt2[i][this.squareNum - j - 1], this._sqrt2[i][this.squareNum - j - 2]);
                    if (isModify) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    //在空白块中随机生成一个 数字块
    Game.prototype.randomSqrtInNULL = function () {
        var len = this.content.childrenCount;
        var nullList = new Array();
        for (var i = 0; i < len; i++) {
            var item = this.content.children[i];
            var isNum = item.getComponent(Item_1.default).isNum();
            if (!isNum) {
                nullList.push(item);
            }
        }
        var index = Math.floor(Math.random() * nullList.length);
        var num = this.randomNumber();
        if (nullList.length == 0) {
            this._clickFlag = true;
            return;
        }
        //延迟0.2s
        // this.scheduleOnce(() => {
        nullList[index].getComponent(Item_1.default).showNumber(num, true);
        this._clickFlag = true;
        // }, 0.3);
    };
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
    Game.prototype.randomNumber = function () {
        return Math.random() < 0.8 ? 2 : 4;
    };
    /**
     * 随机获取一个位置
     */
    Game.prototype.randomLocation = function () {
        var line = Math.floor(Math.random() * this.squareNum);
        var row = Math.floor(Math.random() * this.squareNum);
        return { l: line, r: row };
    };
    /**
     * 是否能合并  并不合并
     */
    Game.prototype.checkTwoCanBeMerge = function (one, two) {
        var item1 = one.getComponent(Item_1.default);
        var item2 = two.getComponent(Item_1.default);
        var oneFlag = item1.isNum();
        var twoFlag = item2.isNum();
        if (oneFlag && twoFlag) {
            var num1 = item1.getNum();
            var num2 = item2.getNum();
            if (num1 == num2) {
                return true;
            }
        }
        else if (!oneFlag && twoFlag) {
            return true;
        }
        else {
            return false;
        }
        return false;
    };
    /**
     * 检测两个合并   能合并就合并
     */
    Game.prototype.checkTwoMerge = function (one, two) {
        var item1 = one.getComponent(Item_1.default);
        var item2 = two.getComponent(Item_1.default);
        var oneFlag = item1.isNum();
        var twoFlag = item2.isNum();
        if (oneFlag && twoFlag) {
            var num1 = item1.getNum();
            var num2 = item2.getNum();
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
        }
        else if (!oneFlag && twoFlag) {
            var num = item2.getNum();
            item1.showNumber(num);
            item2.showNumber(0);
            return true;
        }
        else {
            // this._isContinue = false;
            return false;
        }
        return false;
    };
    /**
     * move动作
     */
    Game.prototype.positionMoveAction = function (oldNode, targetNode, num) {
        var _this = this;
        oldNode.getComponent(Item_1.default).showNumber(0);
        var cloneNode = cc.instantiate(this.squareItem);
        cloneNode.getComponent(Item_1.default).showNumber(num);
        cloneNode.position = oldNode.position;
        this.content.addChild(cloneNode);
        var runTime;
        if (this._slide == slideDirection.LeftRight) {
            runTime = Math.floor(Math.abs(oldNode.x - targetNode.x) / cloneNode.height) * 0.1;
        }
        else {
            runTime = Math.floor(Math.abs(oldNode.y - targetNode.y) / cloneNode.height) * 0.1;
        }
        var moveAct = cc.moveTo(0.2, targetNode.position);
        cloneNode.runAction(cc.sequence(moveAct, cc.callFunc(function () {
            if (targetNode.isMerge) {
                targetNode.getComponent(Item_1.default).showNumber(Number(targetNode.name), true);
                targetNode.isMerge = false;
            }
            else {
                targetNode.getComponent(Item_1.default).showNumber(Number(targetNode.name));
            }
            _this.content.removeChild(cloneNode);
            cloneNode.removeFromParent();
            cloneNode.destroy();
        })));
    };
    /**
     * 重新开始游戏
     */
    Game.prototype.reSetGame = function () {
        this.content.removeAllChildren();
        this._sqrt = null;
        this._sqrt2 = null;
        this._score = 0;
        this._step = 0;
        this._clickFlag = true;
        this.initGame();
    };
    /**
     * 返回大厅
     */
    Game.prototype.returnToHall = function () {
        cc.director.loadScene("main");
    };
    Game._instance = null;
    __decorate([
        property(cc.SpriteAtlas)
    ], Game.prototype, "numberAtlas", void 0);
    __decorate([
        property(cc.Prefab)
    ], Game.prototype, "squareItem", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "content", void 0);
    __decorate([
        property(cc.Label)
    ], Game.prototype, "scoreLab", void 0);
    __decorate([
        property(cc.Label)
    ], Game.prototype, "stepLab", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "effectNode", void 0);
    Game = Game_1 = __decorate([
        ccclass
    ], Game);
    return Game;
    var Game_1;
}(cc.Component));
exports.default = Game;

cc._RF.pop();