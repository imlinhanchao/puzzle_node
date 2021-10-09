const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    user: {
        type: db.ID,
        comment: '用戶'
    },
    url: {
        type: db.STRING(260),
        comment: '關卡地址'
    },
    stage: {
        type: db.INTEGER,
        comment: '關卡編號'
    },
    pass_time: {
        type: db.INTEGER,
        comment: '過關時間'
    }
};
let table_name = prefix + 'record';
module.exports = db.defineModel(table_name, orm, {
    comment: '闖關記錄表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};