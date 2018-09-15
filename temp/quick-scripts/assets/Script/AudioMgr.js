(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/AudioMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '681da4n1/JHaKZYVrhLFq9u', 'AudioMgr', __filename);
// Script/AudioMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var AudioMgr = /** @class */ (function () {
    function AudioMgr() {
        this.bgmVolume = 0.5;
        this.sfxVolume = 0.3;
        this.bgmAudioID = 0;
        //背景音乐播放的时间
        this.bgmCurrentTime = 0;
        //最大播放音乐数量
        //TODO  后边放到编辑器里初始化
        this.MAX_AUDIO_NUM = 10;
        var bgm = cc.sys.localStorage.getItem("bgmVolume");
        if (bgm != null) {
            this.bgmVolume = parseFloat(bgm);
        }
        var sfx = cc.sys.localStorage.getItem("sfxVolume");
        if (sfx != null) {
            this.sfxVolume = parseFloat(sfx);
        }
        cc.audioEngine.setMaxAudioInstance(this.MAX_AUDIO_NUM);
    }
    AudioMgr.prototype.init = function () {
        var self = this;
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll1");
            self.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll2");
            // cc.audioEngine.resumeAll();
            self.resumeAll();
        });
    };
    AudioMgr.prototype.getUrl = function (url) {
        cc.log(url);
        return cc.url.raw("resources/audio/effectAudio/" + url);
    };
    AudioMgr.prototype.playBGM = function (url) {
        var audioUrl = this.getUrl(url);
        cc.log(audioUrl);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
    };
    AudioMgr.prototype.StopBGM = function () {
        cc.audioEngine.stop(this.bgmAudioID);
    };
    AudioMgr.prototype.playSFX = function (url) {
        if (this.sfxVolume > 0) {
            var audioUrl = this.getUrl(url);
            cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    };
    AudioMgr.prototype.setSFXVolume = function (v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    };
    AudioMgr.prototype.setBGMVolume = function (v) {
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
        }
        if (this.bgmVolume != v) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    };
    AudioMgr.prototype.pauseAll = function () {
        if (this.bgmAudioID > 0) {
            this.bgmCurrentTime = cc.audioEngine.getCurrentTime(this.bgmAudioID);
        }
        cc.audioEngine.pauseAll();
        // this.clearAll();
    };
    AudioMgr.prototype.resumeAll = function () {
        cc.audioEngine.resumeAll();
        if (this.bgmVolume > 0 && this.bgmAudioID > 0) {
            // cc.audioEngine.resume(this.bgmAudioID);
            // cc.audioEngine.resumeAll();
            // this.bgmAudioID = cc.audioEngine.play(this.currentBGMUrl, true, this.bgmVolume);
            cc.audioEngine.setCurrentTime(this.bgmAudioID, this.bgmCurrentTime);
        }
    };
    return AudioMgr;
}());
exports.default = AudioMgr;

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
        //# sourceMappingURL=AudioMgr.js.map
        