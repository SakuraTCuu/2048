import { HintUIType } from "./HintUI";

export default class config {
    static shareImg_url = 'http://112.74.174.202:8080/success.png'
    // static shareImg_url = ''

    success

    /**
     *  提交分数给微信后台
     */
    static submitScoreToWX(score: number) {
        score = score || 0;
        if (CC_WECHATGAME) {
            window['wx'].postMessage({
                messageType: 3,
                MAIN_MENU_NUM: "x1",
                score: score,
            });
        } else {
            cc.log("提交得分: x1 : " + score)
        }
    }

    /**
     * 分享
     * @param ts 
     */
    static clickWXShare(ts: any) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //微信小游戏  分享
            wx.shareAppMessage({
                title: '来看看谁的得分最高!',
                imageUrl: this.shareImg_url,
                success: () => {
                    console.log('转发成功!');
                    // this.showHintUI(HintUIType.Success, "转发成功,多谢你的支持!");
                },
                fail(res) {
                    console.log('转发失败--->>', res);
                    // this.showHintUI(HintUIType.Failure, "转发失败!");
                }
            })
        } else {
            ts.showHintUI(HintUIType.Failure, "该平台不支持分享!");
        }
    }


    /**
     * 显示排行榜
     */
    static clickRankBtn() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            // 发消息给子域 
            this.friendButtonFunc();
        } else {
            cc.log('显示排行数据')
        }
    }

    /**
     * 好友排行
     */
    static friendButtonFunc() {
        if (CC_WECHATGAME) {
            // 发消息给子域
            window['wx'].postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x1"
            });
        } else {
            cc.log("获取好友排行榜数据。x1");
        }
    }
}