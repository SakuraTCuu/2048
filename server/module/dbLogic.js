let dbLogic = {
    //用户注册 登录
    userLogin: function (uName, openId) {
        console.log('uName-->>', uName)
        console.log('openId-->>', openId)
    },
    userRegister: function (uName, openId) {
        var User = global.dbHandle.getModel("user");
        User.create({
            userName: uName,
            openId: openId,
            loginTime: Date.now()
        }, (err, doc, len) => {
            if (err) {
                console.log('err-->>', err)
            }
            console.log(`result :${doc}`);
            console.log(`three : ${len}`);
        });
    },
    // 查询用户是否存在
    queryUser: function (uName, openId) {
        let self = this;
        var User = global.dbHandle.getModel("user");
        User.findOne({
            name: uName,
            openId: openId
        }, function (err, doc) { //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {
                res.send(500);
                console.log('500--->>', err);
            } else if (!doc) {
                console.log("用户不存在,需要注册");
                self.userRegister();
            } else {
                //返回此数据
                console.log(doc);
                console.log("用户已存在");
                self.userLogin();
            }
        })
    },
}
module.exports = dbLogic;