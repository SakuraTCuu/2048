"use strict";
cc._RF.push(module, 'e1b90/rohdEk4SdmmEZANaD', 'Hall');
// Script/Hall.ts

Object.defineProperty(exports, "__esModule", { value: true });
var AudioMgr_1 = require("./AudioMgr");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Hall = /** @class */ (function (_super) {
    __extends(Hall, _super);
    function Hall() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hallNode = null;
        _this.loadingNode = null;
        return _this;
        //setting
    }
    Hall.prototype.onLoad = function () {
        var audioMgr = new AudioMgr_1.default();
        audioMgr.init();
        audioMgr.playBGM("BGM.mp3");
    };
    Hall.prototype.onClickStart = function () {
        var _this = this;
        this.hallNode.active = false;
        this.loadingNode.active = true;
        cc.director.preloadScene("main", function () {
            _this.scheduleOnce(function () {
                cc.director.loadScene("main");
            }, 2.5);
        });
    };
    __decorate([
        property(cc.Node)
    ], Hall.prototype, "hallNode", void 0);
    __decorate([
        property(cc.Node)
    ], Hall.prototype, "loadingNode", void 0);
    Hall = __decorate([
        ccclass
    ], Hall);
    return Hall;
}(cc.Component));
exports.default = Hall;

cc._RF.pop();