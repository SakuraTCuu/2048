const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimEffectScript extends cc.Component {

    onEnable() {
        let anim = this.getComponent(cc.Animation);
        if (anim) {
            anim.play();
        }
    }

    onDisable() {
        let anim = this.getComponent(cc.Animation);
        if (anim) {
            anim.stop();
        }
    }
}
