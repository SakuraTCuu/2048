(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/Hall.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'e1b90/rohdEk4SdmmEZANaD', 'Hall', __filename);
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
        //# sourceMappingURL=Hall.js.map
        