import { ItemType } from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GetItemUI extends cc.Component {

    @property(cc.Node)
    brushItem: cc.Node = null;

    @property(cc.Node)
    changeItem: cc.Node = null;

    @property(cc.Node)
    hemmerItem: cc.Node = null;

    onLoad() {

    }

    hideAll() {
        this.brushItem.active = false;
        this.changeItem.active = false;
        this.hemmerItem.active = false;
    }

    showItem(type: ItemType) {

        cc.log(type);
        this.hideAll();

        switch (type) {
            case ItemType.hummer:
                this.hemmerItem.active = true;
                break;
            case ItemType.change:
                this.changeItem.active = true;
                break;
            case ItemType.brush:
                this.brushItem.active = true;
                break;
        }

    }

}
