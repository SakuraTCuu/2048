
const { ccclass, property } = cc._decorator;

export enum HintUIType {
    Failure,
    Success
}

@ccclass
export default class HintUI extends cc.Component {

    @property(cc.Node)
    succNode: cc.Node = null;
    @property(cc.Node)
    failureNode: cc.Node = null;

    @property(cc.Label)
    hintLabel: cc.Label = null;

    _isShow = false;
    _anim: cc.Animation = null;

    onLoad() {
        this._anim = this.getComponent(cc.Animation);
        this._anim.on('finished', this.showComplete, this);
    }

    show(uitype: HintUIType, hint?: string) {
        if (this._isShow) return;

        this._isShow = true;
        this.node.active = true;
        this.node.zIndex = 10;
        if (uitype == HintUIType.Failure) {
            this.succNode.active = false;
            this.failureNode.active = true;
        } else {
            this.succNode.active = true;
            this.failureNode.active = false;
        }
        hint = hint == null ? (uitype == HintUIType.Failure ? "操作失败" : "操作成功") : hint;
        this.hintLabel.string = hint;
        this.node.width += this.hintLabel.node.width;
        this.node.width += 50;
        this.node.x = -this.node.width / 2;
        this._anim.play();
    }

    isShowing() {
        return this._isShow;
    }

    showComplete() {
        this.scheduleOnce(() => {
            this.hide();
        }, 2);
    }

    hide() {
        this._isShow = false;
        this.node.active = false;
        this.node.width = 100;
    }
}
