let http = require('http');
let url = require('url');
let app = require('./module/router.js')
let dbLogic = require('./module/dbLogic.js')

app.get('/login', function (req, res) {
    console.log('get 请求 login');
    let pathName = url.parse(req.url).pathname;
    console.log(req.url);
    // dbLogic.queryUser()
});

app.get('/sign', function (req, res) {
    console.log('get 请求 login');
});

//数据库连接
global.dbHandler = require('./module/dbHandler.js')
global.db = mongoose.createConnection('mongodb://localhost:27017/userInfo', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        console.log('Connection Error:' + err)
    } else {
        console.log('Connection success!')
    }
});

http.createServer(app).listen(8080);