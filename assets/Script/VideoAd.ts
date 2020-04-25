export default class VideoAd {

    private static _instance: VideoAd = null;

    private _videoId: any = null;

    public static get instance(): VideoAd {
        if (!this._instance) {
            this._instance = new VideoAd();
        }
        return this._instance;
    }

    public getRewardedVideoAd() {

        if (!CC_WECHATGAME) {
            return;
        }

        let rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'adunit-c150f3266bdb2c80' })

        return rewardedVideoAd;
    }

    public getOneVideo() {

    }

}