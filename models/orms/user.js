const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '登錄帳號'
    },
    nickname: {
        type: db.STRING(20),
        comment: '暱稱'
    },
    passwd: {
        type: db.STRING(64),
        comment: '密碼'
    },
    email: {
        type: db.STRING(100),
        comment: '郵箱',
        defaultValue: ''
    },
    lastlogin: {
        type: db.INTEGER,
        comment: '最後登錄時間'
    }
};
let table_name = prefix + 'user';
module.exports = db.defineModel(table_name, orm, {
    comment: '用戶表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};