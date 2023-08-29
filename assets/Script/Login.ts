import GameManager from "./GameManager";
import HTTPManager, { getURL } from "./net/HTTPManager";
import { init_net } from "./Interface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends cc.Component {

    @property(cc.EditBox)
    inputName: cc.EditBox = null;

    @property(cc.EditBox)
    inputPwd: cc.EditBox = null;

    onLoad() {

        let options = {
            host: getURL.baseUrl,
            port: getURL.port,
            log: true
        }

        HTTPManager.init(() => {
            HTTPManager.get(getURL.REQUERYGATE, { type: "init" }).then((data: init_net) => {
                console.log(data);
                options.host = data.host;
                options.port = data.port;
                HTTPManager.init(() => {
                    console.log("connector init success");
                }, options);
            }, (data) => {
                console.log(data);
            });
        }, options);
    }



    public clickLogin(): void {
        let name = this.inputName.string;
        let pwd = this.inputPwd.string;

        if (!(!!name && !!pwd)) {
            console.log("name or pwd must be a string")
        }

        let data = Object.assign({
            name,
            pwd
        })

        HTTPManager.get(getURL.LOGIN, data).then((res) => {
            console.log("res--->>", res)
        }, (err) => {
            console.log("res--->>", err)
        });
    }

    public clickRegister(): void {

        let name = this.inputName.string;
        let pwd = this.inputPwd.string;

        if (!(!!name && !!pwd)) {
            console.log("name or pwd must be a string")
        }

        let data = Object.assign({
            name,
            pwd
        })

        HTTPManager.get(getURL.REGISTER, data).then((res) => {
            console.log("res--->>", res)
        }, (err) => {
            console.log("res--->>", err)
        });
    }

}