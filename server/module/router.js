let url = require('url');
let querystring = require('querystring');

let Server = function () {

    let quene = {};
    quene['get'] = {};
    quene['post'] = {};

    let app = function (req, res) {
        let pathName = url.parse(req.url).pathname;
        if (!pathName.endsWith('/')) {
            pathName = pathName + '/';
        }
        let method = req.method.toLowerCase();

        if (quene[method][pathName]) {
            if (method === 'get') {
                quene[method][pathName](req, res);
            } else if (method === 'post') {
                var postStr = '';
                req.on('data', function (chunk) {
                    postStr += chunk;
                })
                req.on('end', function (err, chunk) {
                    let postData = querystring.parse(postStr);
                    console.log(postData);
                    // req.body = postStr; /*表示拿到post的值*/
                    quene[method][pathname](req, res); /*执行方法*/
                })
            }
        } else {
            console.log('访问路由不存在');
        }
    };

    app.get = function (path, callback) {
        if (!path.endsWith('/')) {
            path = path + '/';
        }
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        //    /login/
        quene['get'][path] = callback;
    };

    app.post = function (path, callback) {
        if (!path.endsWith('/')) {
            path = path + '/';
        }
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        //    /login/
        quene['post'][path] = callback;
    }
    // console.log('router-->>', app)
    return app;
}

module.exports = Server();