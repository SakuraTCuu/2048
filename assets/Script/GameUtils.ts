export default class GameUtils {

    public static popTips(parent: cc.Node, showText: string) {
        // cc.find('Canvas');

        let node = new cc.Node();
        let lab = node.addComponent(cc.Label);
        let labOutline = node.addComponent(cc.LabelOutline);
        // no sprites can be added to this node;
        // let sprite = node.addComponent(cc.Sprite);
        // sprite.spriteFrame = 
        labOutline.width = 1.5;
        lab.string = showText;
        lab.fontSize = 40;

        parent.addChild(node);
        node.setPosition(0, -200);

        let moveAct = cc.moveBy(0.5, 0, 200);
        let fadeAct = cc.fadeTo(0.5, 0);

        let ccFun = cc.callFunc(() => {
            let spawnAct = cc.spawn(moveAct, fadeAct);
            let act = cc.sequence(spawnAct, cc.callFunc(() => {
                node.active = false;
                node.removeFromParent();
                node.destroy();
            }));
            node.runAction(act);
        });

        let step1 = cc.sequence(moveAct, cc.delayTime(0.8), ccFun);

        node.runAction(step1);
    }



    /**
     * 显示对话框
     */
    public static showText(msg: string) {
        // cc.loader.load()
    }
}