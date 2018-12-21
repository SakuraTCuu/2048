import { ItemType } from "./Game";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GameProp extends cc.Component {

    @property(cc.Sprite)
    showItemSp: cc.Sprite = null;

    @property(cc.Sprite)
    itemSprite: cc.Sprite = null;

    @property(cc.Label)
    desLab: cc.Label = null;

    @property(cc.SpriteFrame)
    hemmerSp: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    changeSp: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    brushSp: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    regretSp: cc.SpriteFrame = null;


    start() {

    }

    onClickMask() {
        //关闭道具使用
        this.node.active = false;
    }

    init(type: ItemType, targetNode: cc.Node) {
        let worldPos = targetNode.parent.convertToWorldSpaceAR(targetNode.position);
        let pos = this.showItemSp.node.parent.convertToNodeSpaceAR(worldPos);
        let sp = targetNode.getComponent(cc.Sprite).spriteFrame;
        cc.log(targetNode);
        switch (type) {
            case ItemType.hummer:
                this.showItemSp.spriteFrame = sp;
                this.showItemSp.node.position = pos;
                this.desLab.string = "锤子";
                this.itemSprite.spriteFrame = this.hemmerSp;
                break;
            case ItemType.brush:
                this.showItemSp.spriteFrame = sp;
                this.showItemSp.node.position = pos;
                this.desLab.string = "刷子";
                this.itemSprite.spriteFrame = this.brushSp;
                break;
            case ItemType.change:
                this.showItemSp.spriteFrame = sp;
                this.showItemSp.node.position = pos;
                this.desLab.string = "换位";
                this.itemSprite.spriteFrame = this.changeSp;
                break;
            case ItemType.regret:
                this.showItemSp.spriteFrame = sp;
                this.showItemSp.node.position = pos;
                this.desLab.string = "反悔";
                this.itemSprite.spriteFrame = this.regretSp;
                break;
        }
    }
}
