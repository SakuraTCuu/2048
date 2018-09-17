
export default class AudioMgr {
    static bgmVolume: number = 1;
    static sfxVolume: number = 1;
    static bgmAudioID: number = 0;
    //背景音乐播放的时间
    static bgmCurrentTime = 0
    //最大播放音乐数量
    //TODO  后边放到编辑器里初始化
    static MAX_AUDIO_NUM: number = 10;

    /**
     * 初始化 音效
     */
    static init() {

        const bgm = cc.sys.localStorage.getItem("bgmVolume");
        if (bgm != null) {
            AudioMgr.bgmVolume = parseFloat(bgm);
        }
        const sfx = cc.sys.localStorage.getItem("sfxVolume");
        if (sfx != null) {
            AudioMgr.sfxVolume = parseFloat(sfx);
        }

        cc.audioEngine.setMaxAudioInstance(AudioMgr.MAX_AUDIO_NUM);

        cc.log("sfxVolume--->>>", AudioMgr.sfxVolume);
        cc.log("bgmVolume--->>>", AudioMgr.bgmVolume);

        cc.game.on(cc.game.EVENT_HIDE, function () {
            AudioMgr.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            AudioMgr.resumeAll();
        });
    }

    static getUrl(url) {
        return cc.url.raw("resources/audio/effectAudio/" + url);
    }

    static playBGM(url) {
        const audioUrl = AudioMgr.getUrl(url);
        cc.log(audioUrl);
        if (AudioMgr.bgmAudioID >= 0) {
            cc.audioEngine.stop(AudioMgr.bgmAudioID);
        }
        AudioMgr.bgmAudioID = cc.audioEngine.play(audioUrl, true, AudioMgr.bgmVolume);
    }

    static StopBGM() {
        cc.audioEngine.stop(AudioMgr.bgmAudioID);
    }

    static playSFX(url) {
        cc.log("sfxVolume-->>", AudioMgr.sfxVolume);
        if (AudioMgr.sfxVolume > 0) {
            const audioUrl = AudioMgr.getUrl(url);
            cc.log("audioUrl--->>", audioUrl);
            cc.audioEngine.play(audioUrl, false, AudioMgr.sfxVolume);
        }
    }

    static setSFXVolume(v) {
        if (AudioMgr.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            AudioMgr.sfxVolume = v;
        }
    }

    static setBGMVolume(v) {
        if (AudioMgr.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(AudioMgr.bgmAudioID);
            } else {
                cc.audioEngine.pause(AudioMgr.bgmAudioID);
            }
        }
        if (AudioMgr.bgmVolume != v) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            AudioMgr.bgmVolume = v;
            cc.audioEngine.setVolume(AudioMgr.bgmAudioID, v);
        }
    }

    static pauseAll(): void {
        cc.log("pauseAll---");
        if (AudioMgr.bgmAudioID > 0) {
            AudioMgr.bgmCurrentTime = cc.audioEngine.getCurrentTime(AudioMgr.bgmAudioID);
        }
        // cc.audioEngine.pauseAll();
        let state = cc.audioEngine.getState(AudioMgr.bgmAudioID);
        if (state == cc.audioEngine.AudioState.PLAYING) {
            cc.audioEngine.pause(AudioMgr.bgmAudioID);
        } else {
            cc.log("bgm was paused");
        }
    }

    static resumeAll(): void {
        // cc.audioEngine.resumeAll();
        // if (AudioMgr.bgmVolume > 0 && AudioMgr.bgmAudioID > 0) {
        //     // cc.audioEngine.resume(AudioMgr.bgmAudioID);
        //     // cc.audioEngine.resumeAll();
        //     // AudioMgr.bgmAudioID = cc.audioEngine.play(AudioMgr.currentBGMUrl, true, AudioMgr.bgmVolume);
        //     cc.audioEngine.setCurrentTime(AudioMgr.bgmAudioID, AudioMgr.bgmCurrentTime);
        // }
        cc.log("resumeAll---");
        let state = cc.audioEngine.getState(AudioMgr.bgmAudioID);
        if (state == cc.audioEngine.AudioState.PAUSED) {
            cc.audioEngine.resume(AudioMgr.bgmAudioID);
            cc.audioEngine.setCurrentTime(AudioMgr.bgmAudioID, AudioMgr.bgmCurrentTime);
        } else {
            cc.log("bgm was playing");
        }
    }
}
