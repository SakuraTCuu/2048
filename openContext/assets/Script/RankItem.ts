const { ccclass, property } = cc._decorator;

@ccclass
export default class RankItem extends cc.Component {

    @property(cc.Label)
    user_Name: cc.Label = null;

    @property(cc.Label)
    user_Score: cc.Label = null;

    @property(cc.Sprite)
    user_Icon: cc.Sprite = null;

    @property(cc.Label)
    rank_num: cc.Label = null;

    @property(cc.Node)
    rank_1: cc.Node = null;

    @property(cc.Node)
    rank_2: cc.Node = null;

    @property(cc.Node)
    rank_3: cc.Node = null;



    init(rank, data) {
        let avatarUrl = data.avatarUrl;
        // let nick = data.nickname.length <= 10 ? data.nickname : data.nickname.substr(0, 10) + "...";
        let nick = data.nickname;
        let grade = data.KVDataList.length != 0 ? data.KVDataList[0].value : 0;

        this.rank_num.node.active = false;
        if (rank == 0) {
            this.rank_1.active = true;
            this.rank_2.active = false;
            this.rank_3.active = false;
        } else if (rank == 1) {
            this.rank_1.active = false;
            this.rank_2.active = true;
            this.rank_3.active = false;
        } else if (rank == 2) {
            this.rank_1.active = false;
            this.rank_2.active = false;
            this.rank_3.active = true;
        } else {
            this.rank_1.active = false;
            this.rank_2.active = false;
            this.rank_3.active = false;
            this.rank_num.node.active = true;
        }

        this.rank_num.string = (rank + 1).toString();
        this.user_Name.string = nick;
        this.user_Score.string = grade.toString();
        this.createImage(avatarUrl);
    }

    createImage(avatarUrl) {
        if (CC_WECHATGAME) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        this.user_Icon.spriteFrame = new cc.SpriteFrame(texture);
                    } catch (e) {
                        cc.log(e);
                        this.user_Icon.node.active = false;
                    }
                };
                image.src = avatarUrl;
            } catch (e) {
                cc.log(e);
                this.user_Icon.node.active = false;
            }
        } else {
            cc.loader.load({
                url: avatarUrl, type: 'jpg'
            }, (err, texture) => {
                this.user_Icon.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }
}
