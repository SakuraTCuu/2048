import GameManager, { GameState } from "./GameManager";

export default class AudioMgr {
    static bgmVolume: number = 1;
    static sfxVolume: number = 1;
    static bgmAudioID: number = 0;
    //背景音乐播放的时间
    static bgmCurrentTime = 0
    //最大播放音乐数量
    //TODO  后边放到编辑器里初始化
    static MAX_AUDIO_NUM: number = 10;

    static audioUrl: string = '';

    /**
     * 初始化 音效
     */
    static init() {

        cc.audioEngine.setMaxAudioInstance(AudioMgr.MAX_AUDIO_NUM);

        // cc.game.on(cc.game.EVENT_HIDE, function () {
        //     AudioMgr.pauseAll();
        // });
        // cc.game.on(cc.game.EVENT_SHOW, function () {
        //     AudioMgr.resumeAll();
        // });
    }

    static getUrl(url) {
        return cc.url.raw("resources/audio/effectAudio/" + url);
    }

    static playBGM(url) {
        AudioMgr.audioUrl = url;
        const audioUrl = AudioMgr.getUrl(url);
        if (AudioMgr.bgmAudioID >= 0) {
            cc.audioEngine.stop(AudioMgr.bgmAudioID);
        }
        AudioMgr.bgmAudioID = cc.audioEngine.play(audioUrl, true, AudioMgr.bgmVolume);
    }

    static StopBGM() {
        cc.audioEngine.pause(AudioMgr.bgmAudioID);
    }

    static playSFX(url) {
        if (AudioMgr.sfxVolume > 0) {
            const audioUrl = AudioMgr.getUrl(url);
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
  
        cc.audioEngine.stopAll();
    }

    static resumeAll(): void {
      
        cc.audioEngine.stopAll();
        if (GameManager.gameState == GameState.Hall) {
      
            if (AudioMgr.audioUrl != '') {
                AudioMgr.playBGM(AudioMgr.audioUrl);
            } else {

            }
        } else {
            //不恢复播放背景音乐
        }
    }
}
