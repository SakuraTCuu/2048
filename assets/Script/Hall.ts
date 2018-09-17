import AudioMgr from "./AudioMgr";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {

    @property(cc.Node)
    hallNode: cc.Node = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    onLoad() {
        AudioMgr.init();
        AudioMgr.playBGM("BGM.mp3");
    }

    onClickStart() {
        this.hallNode.active = false;
        this.loadingNode.active = true;
        cc.director.preloadScene("main", () => {
            this.scheduleOnce(() => {
                cc.director.loadScene("main");
            }, 2.5);
        });
    }

    //setting

}
