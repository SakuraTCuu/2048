(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/Item.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'cc31aqQf7VFCKZEvefOS9Xs', 'Item', __filename);
// Script/Item.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("./Game");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Item = /** @class */ (function (_super) {
    __extends(Item, _super);
    function Item() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numberSp = null;
        _this.bg = null;
        _this.particleNode = null;
        _this._num = 0;
        _this.hideNum = 0;
        return _this;
    }
    Item.prototype.showNumber = function (num, isMerge) {
        if (isMerge === void 0) { isMerge = false; }
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
        var numberAtlas = Game_1.default.instance.numberAtlas;
        this.numberSp.spriteFrame = numberAtlas.getSpriteFrame(num + "");
        if (isMerge) {
            //播放动画
            this.numberSp.node.scale = 0.5;
            var action = cc.scaleTo(0.1, 1);
            // this.numberSp.node.runAction(cc.skewBy(0.5, 10, 10));
            this.numberSp.node.runAction(action);
        }
    };
    //播放粒子特效
    Item.prototype.playParticle = function () {
        var _this = this;
        cc.log("播放特效");
        this.particleNode.node.active = true;
        this.particleNode.resetSystem();
        this.particleNode.enabled = true;
        this.scheduleOnce(function () {
            _this.particleNode.stopSystem();
            _this.particleNode.enabled = false;
        }, 0.5);
        // this.particleNode.
    };
    /**
        * 是否是有数字的块
        */
    Item.prototype.isNum = function () {
        return this._num != 0;
    };
    Item.prototype.getNum = function () {
        return this._num;
    };
    Item.prototype.setHideNum = function (num) {
        this.hideNum = num;
    };
    Item.prototype.getHideNum = function () {
        return this.hideNum;
    };
    __decorate([
        property(cc.Sprite)
    ], Item.prototype, "numberSp", void 0);
    __decorate([
        property(cc.Node)
    ], Item.prototype, "bg", void 0);
    __decorate([
        property(cc.ParticleSystem)
    ], Item.prototype, "particleNode", void 0);
    Item = __decorate([
        ccclass
    ], Item);
    return Item;
}(cc.Component));
exports.default = Item;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=Item.js.map
        