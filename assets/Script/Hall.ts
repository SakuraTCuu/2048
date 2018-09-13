import AudioMgr from "./AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {



    onClickStart() {
        cc.director.preloadScene("main", () => {
            cc.director.loadScene("main");
        });
    }

    //setting

}
