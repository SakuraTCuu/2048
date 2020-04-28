export default class VideoAd {

    private static _instance: VideoAd = null;

    public static get instance(): VideoAd {
        if (!this._instance) {
            this._instance = new VideoAd();
        }
        return this._instance;
    }

    public getRewardedVideoAd(suc: Function, fail: Function) {

        if (!CC_WECHATGAME) {
            fail && fail();
            return;
        }

        let videoAd = wx.createRewardedVideoAd({ adUnitId: 'adunit-c150f3266bdb2c80' })

        videoAd.onLoad(() => {
            console.log('激励视频 广告加载成功')
        })

        videoAd.onError(err => {
            console.log(err);
            wx.showToast({
                title: '今日广告已经看完了！明日再来吧',
                icon: 'none',
                duration: 1000
            })
            fail && fail();
        })

        videoAd.show()
            .catch(err => {
                videoAd.load()
                    .then(() => videoAd.show())
            });

        //关闭视频的回调函数
        videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            console.log(res)
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励  初始化下一个广告
                //消除2和4
                suc && suc();
            } else {
                wx.showToast({
                    title: '您的视频还没看完，无法获得奖励',
                    icon: 'none',
                    duration: 1000
                })
                // 播放中途退出，不下发游戏奖励
                //退出就结束游戏
                fail && fail();
            }
            videoAd.offClose()
        })
        return videoAd;
    }

    public getOneVideo() {

    }

}