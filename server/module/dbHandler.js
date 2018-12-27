var mongoose = require('mongoose')
let models = {
    user: {
        userName: {
            type: String,
            required: true
        },
        openId: {
            type: Number,
            required: true
        },
        loginTime: {
            type: Number,
            required: true
        },
    },

    sign: {
        currentTime: {
            type: Number,
            required: true
        },
    }
}

for (const m of models) {
    mongoose.model(m, new schema(models[m]));
}

module.exports = {
    getModel: function (type) {
        return _getModel(type);
    }
};
var _getModel = function (type) {
    return mongoose.model(type);
}