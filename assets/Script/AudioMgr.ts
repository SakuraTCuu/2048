
export default class AudioMgr {
    bgmVolume: number = 0.5;
    sfxVolume: number = 0.3;
    bgmAudioID: number = 0;
    //背景音乐播放的时间
    bgmCurrentTime = 0
    //最大播放音乐数量
    //TODO  后边放到编辑器里初始化
    MAX_AUDIO_NUM: number = 10;
    constructor() {
        const bgm = cc.sys.localStorage.getItem("bgmVolume");
        if (bgm != null) {
            this.bgmVolume = parseFloat(bgm);
        }
        const sfx = cc.sys.localStorage.getItem("sfxVolume");
        if (sfx != null) {
            this.sfxVolume = parseFloat(sfx);
        }

        cc.audioEngine.setMaxAudioInstance(this.MAX_AUDIO_NUM);

    }

    init() {
        let self = this;
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll1");
            self.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll2");
            // cc.audioEngine.resumeAll();
            self.resumeAll();
        });
    }

    getUrl(url) {
        cc.log(url);
        return cc.url.raw("resources/audio/effectAudio/" + url);
    }

    playBGM(url) {
        const audioUrl = this.getUrl(url);
        cc.log(audioUrl);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
    }


    StopBGM() {
        cc.audioEngine.stop(this.bgmAudioID);
    }

    playSFX(url) {
        if (this.sfxVolume > 0) {
            const audioUrl = this.getUrl(url);
            cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    }

    setSFXVolume(v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    }

    setBGMVolume(v) {
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            } else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
        }
        if (this.bgmVolume != v) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    }

    pauseAll(): void {
        if (this.bgmAudioID > 0) {
            this.bgmCurrentTime = cc.audioEngine.getCurrentTime(this.bgmAudioID);
        }
        // cc.audioEngine.pauseAll();
        let state = cc.audioEngine.getState(this.bgmAudioID);
        if (state == cc.audioEngine.AudioState.PLAYING) {
            // cc.audioEngine.stop(this.bgmAudioID);
            cc.audioEngine.pause(this.bgmAudioID);
        } else {
            cc.log("bgm was paused");
        }

    }

    resumeAll(): void {
        // cc.audioEngine.resumeAll();
        // if (this.bgmVolume > 0 && this.bgmAudioID > 0) {
        //     // cc.audioEngine.resume(this.bgmAudioID);
        //     // cc.audioEngine.resumeAll();
        //     // this.bgmAudioID = cc.audioEngine.play(this.currentBGMUrl, true, this.bgmVolume);
        //     cc.audioEngine.setCurrentTime(this.bgmAudioID, this.bgmCurrentTime);
        // }

        let state = cc.audioEngine.getState(this.bgmAudioID);
        if (state == cc.audioEngine.AudioState.PAUSED) {
            cc.audioEngine.resume(this.bgmAudioID);
            cc.audioEngine.setCurrentTime(this.bgmAudioID, this.bgmCurrentTime);
        } else {
            cc.log("bgm was playing");
        }
    }
}
