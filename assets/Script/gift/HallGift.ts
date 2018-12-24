const { ccclass, property } = cc._decorator;

@ccclass
export default class HallGift extends cc.Component {

    @property(cc.Label)
    gift_num1: cc.Label = null;

    @property(cc.Label)
    gift_num2: cc.Label = null;

    @property(cc.Sprite)
    gift_icon1: cc.Sprite = null;

    @property(cc.Sprite)
    gift_icon2: cc.Sprite = null;

    @property(cc.SpriteFrame)
    spf1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    spf2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    spf3: cc.SpriteFrame = null;

    onLoad() {
        //获取签到信息,签到几天? 
        //  道具基数 1 * 签到天数 
        // 30天 = 1 *30 = 30;
    }

    onEnable() {
        // this.node.getComponent(cc.Animation).play();
        let anim = this.getComponent(cc.Animation);
        if (anim) {
            anim.play();
        }
    }

    start() {
        let returnData = {
            sign: 2,
            itemType: [1, 3]
        };
        this.init(returnData);
    }

    init(returnData) {
        this.gift_num1.string = returnData.sign + "";
        this.gift_num2.string = returnData.sign + "";

        if (returnData.itemType[0] === 1) {
            this.gift_icon1.spriteFrame = this.spf1;
        } else if (returnData.itemType[0] === 2) {
            this.gift_icon1.spriteFrame = this.spf2;
        } else if (returnData.itemType[0] === 3) {
            this.gift_icon1.spriteFrame = this.spf3;
        }

        if (returnData.itemType[1] === 1) {
            this.gift_icon2.spriteFrame = this.spf1;
        } else if (returnData.itemType[1] === 2) {
            this.gift_icon2.spriteFrame = this.spf2;
        } else if (returnData.itemType[1] === 3) {
            this.gift_icon2.spriteFrame = this.spf3;
        }
    }

    onClickCloseBtn() {
        //关闭按钮
        this.node.active = false;
        //龙骨动画暂停
        // this.
    }


    onClickGetBtn() {
        //领取按钮
        //给服务器发消息,获取签到礼包;

    }
}
