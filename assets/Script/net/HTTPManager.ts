import GameManager from "../GameManager";

export default class HTTPManager {

    public static init(cb: Function, options: any) {
        //初始化
        GameManager.pinus.init(options, () => {
            //网络初始化成功
            GameManager.NETSTATE = true;
            cc.log("network init success");
            cb && cb();
        });
    }

    public static get(url: String, params: Object): Promise<any> {
        return new Promise((resolve, reject) => {
            GameManager.pinus.request(url, params, (data) => {
                if (data.code >= 200 && data.code <= 300) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        })
    }
}

export class getURL {
    //本地测试
    public static baseUrl: String = "127.0.0.1";
    public static port: number = 3014;
    //远程地址
    // private static baseUrl:String = "http://qzjsakura.cn/";
    /** 获取 gate 服务器 */
    public static REQUERYGATE: string = "gate.gateHandler.queryEntry";
    /** 获取 connector 服务器 */
    public static REQUERYCONNECTOR: string = "connector.entryHandler.enter";
    /**用户登录 */
    public static LOGIN: string = "connector.entryHandler.login";
    // 注册
    public static REGISTER: string = "connector.entryHandler.register";
    /** 用户使用道具 */
    public static USERITEM: string = "connector.entryHandler.userItem";
}