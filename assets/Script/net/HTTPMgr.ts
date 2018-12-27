import GameManager from "../GameManager";

export default class HTTPMgr {

    // static baseUrl = 'http://localhost:8080/'

    static baseUrl = 'http://localhost:8123/'

    static get(path, param) {
        return this._request(HTTPMgr.baseUrl + path, 'GET', param);
    }

    static post(path, param) {
        return this._request(HTTPMgr.baseUrl + path, 'POST', param);
    }

    private static _request(url, method, param?: Object) {
        return new Promise<any>((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.onload = () => {
                cc.log("xhr--onLoad");
            };
            let paramData = null;
            if (method == 'GET') {
                url = url + encodeURI(this.objParam2GetString(param));
            } else {
                paramData = param == null ? null : encodeURI(this.objParam2PostString(param));
            }
            cc.log("_request url ----- ", url);
            req.open(method, url, true);
            req.setRequestHeader("content-type", "application/x-www-form-urlencoded");
            if (cc.sys.osVersion) {
                req.setRequestHeader("systemversion", cc.sys.osVersion);
            }
            if (GameManager.userInfo && GameManager.userInfo.userId) {
                cc.log("userId===>>>", GameManager.userInfo.userId);
                req.setRequestHeader("userId", GameManager.userInfo.userId);
            }
            req.onreadystatechange = () => {
                cc.log("---req readyState---", req.readyState);
                if (req.readyState == 4 && (req.status > 199 && req.status < 300)) {
                    cc.log("---req responseText---", req.responseText);
                    try {
                        const ret = JSON.parse(req.responseText);
                        const code = ret['code'];
                        if (code == 200) {
                            resolve(ret);
                        } else {
                            reject(ret);
                        }
                    } catch (e) {
                        const ret = {
                            code: -1,
                            msg: 'parse err'
                        }
                        reject(ret);
                    } finally {
                    }
                }
            }
            req.onerror = (err: ProgressEvent) => {
                console.log(err);
                const ret = {
                    code: -3,
                    msg: '未知错误!'
                }
                reject(ret);
            }
            req.ontimeout = (ev: ProgressEvent) => {
                const ret = {
                    code: -4,
                    msg: '请求服务器超时!'
                }
                reject(ret);
            }
            req.send(paramData);
        });
    }

    /**
     * 将对象转成 a=1&b=2的形式
     * @param obj 对象
     */
    static objParam2PostString(obj) {
        let paramStr = "";
        for (var k in obj) {
            paramStr += (k + "=" + obj[k]);
            paramStr += "&";
        }
        if (paramStr != "") {
            paramStr = paramStr.slice(0, paramStr.length - 1);
        }
        return paramStr;
    }

    static objParam2GetString(obj) {
        let paramStr = "?";
        for (var k in obj) {
            paramStr += (k + "=" + obj[k]);
            paramStr += "&";
        }
        if (paramStr != "") {
            paramStr = paramStr.slice(0, paramStr.length - 1);
        }
        return paramStr;
    }
}