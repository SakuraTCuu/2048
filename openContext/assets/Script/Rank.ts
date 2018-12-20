import RankItem from "./RankItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Rank extends cc.Component {

    @property(cc.Node)
    scrollViewContent: cc.Node = null;

    @property(cc.Prefab)
    rank_item: cc.Prefab = null;

    @property(cc.Node)
    loadingLabel: cc.Node = null;


    start() {
        this.init();

        // this.test();
    }

    test() {
        for (let i = 0; i < 100; i++) {
            let playerInfo = {
                avatarUrl: 'http://112.74.174.202:8080/success.png',
                nickname: '校董' + i,
                KVDataList: [{ value: i }]
            }
            var item = cc.instantiate(this.rank_item);
            item.getComponent(RankItem).init(i, playerInfo);
            this.scrollViewContent.addChild(item);
        }
    }

    init() {
        if (CC_WECHATGAME) {
            window['wx'].onMessage(data => {
                cc.log("接收主域发来消息：", data);
                if (data.messageType == 0) {//移除排行榜
                } else if (data.messageType == 1) {//获取好友排行榜
                    this.fetchFriendData(data.MAIN_MENU_NUM);
                } else if (data.messageType == 3) {//提交得分
                    this.submitScore(data.MAIN_MENU_NUM, data.score);
                } else if (data.messageType == 5) {//获取群排行榜
                    this.fetchGroupFriendData(data.MAIN_MENU_NUM, data.shareTicket);
                }
            });
        }
    }


    initView() {
        this.scrollViewContent.removeAllChildren();
        this.loadingLabel.getComponent(cc.Label).string = "玩命加载中...";
        this.loadingLabel.active = true;
    }

    submitScore(MAIN_MENU_NUM, score) { //提交得分
        if (CC_WECHATGAME) {
            window['wx'].getUserCloudStorage({
                // 以key/value形式存储
                keyList: [MAIN_MENU_NUM],
                success: function (getres) {
                    console.log('getUserCloudStorage', 'success', getres)
                    if (getres.KVDataList.length != 0) {
                        if (getres.KVDataList[0].value > score) {
                            return;
                        }
                    }
                    // 对用户托管数据进行写数据操作
                    window['wx'].setUserCloudStorage({
                        KVDataList: [{ key: MAIN_MENU_NUM, value: "" + score }],
                        success: function (res) {
                            console.log('setUserCloudStorage', 'success', res)
                        },
                        fail: function (res) {
                            console.log('setUserCloudStorage', 'fail')
                        },
                        complete: function (res) {
                            console.log('setUserCloudStorage', 'ok')
                        }
                    });
                },
                fail: function (res) {
                    console.log('getUserCloudStorage', 'fail')
                },
                complete: function (res) {
                    console.log('getUserCloudStorage', 'ok')
                }
            });
        } else {
            cc.log("提交得分:" + MAIN_MENU_NUM + " : " + score)
        }
    }

    fetchFriendData(MAIN_MENU_NUM) {
        this.initView();
        if (CC_WECHATGAME) {
            cc.log('selfOpenId---->>>', ['selfOpenId'])
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    this.loadingLabel.active = false;
                    console.log('success', userRes.data)
                    let userData = userRes.data[0];
                    //取出所有好友数据
                    wx.getFriendCloudStorage({
                        keyList: [MAIN_MENU_NUM],
                        success: res => {
                            console.log("wx.getFriendCloudStorage success", res);
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[0].value - a.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {
                                var playerInfo = data[i];
                                var item = cc.instantiate(this.rank_item);
                                item.getComponent(RankItem).init(i, playerInfo);
                                this.scrollViewContent.addChild(item);
                                // if (data[i].avatarUrl == userData.avatarUrl) {
                                //     let userItem = cc.instantiate(this.rank_item);
                                //     userItem.getComponent('RankItem').init(i, playerInfo);
                                //     this.node.addChild(userItem, 1, 1000);
                                // }
                            }
                            // if (data.length <= 8) {
                            //     let layout = this.scrollViewContent.getComponent(cc.Layout);
                            //     layout.resizeMode = cc.Layout.ResizeMode.NONE;
                            // }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    }

    fetchGroupFriendData(MAIN_MENU_NUM, shareTicket) {
        this.initView();
        if (CC_WECHATGAME) {
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    console.log('success', userRes.data)
                    let userData = userRes.data[0];
                    //取出所有好友数据
                    wx.getGroupCloudStorage({
                        shareTicket: shareTicket,
                        keyList: [MAIN_MENU_NUM],
                        success: res => {
                            console.log("wx.getGroupCloudStorage success", res);
                            this.loadingLabel.active = false;
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[0].value - a.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {
                                var playerInfo = data[i];
                                var item = cc.instantiate(this.rank_item);
                                item.getComponent('RankItem').init(i, playerInfo);
                                this.scrollViewContent.addChild(item);
                                // if (data[i].avatarUrl == userData.avatarUrl) {
                                //     let userItem = cc.instantiate(this.rank_item);
                                //     userItem.getComponent('RankItem').init(i, playerInfo);
                                //     userItem.y = -354;
                                //     this.node.addChild(userItem, 1, 1000);
                                // }
                            }
                            if (data.length <= 8) {
                                let layout = this.scrollViewContent.getComponent(cc.Layout);
                                layout.resizeMode = cc.Layout.ResizeMode.NONE;
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    }
}
