const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const model = require('../models');
const App = require('./app');
const Account = model.user;
const Record = model.record;

const __salt = require('../config').salt;

let __error__ = Object.assign({
	verify: App.error.reg('帐号或密码错误！'),
	captcha: App.error.reg('验证码错误！'),
	existed: App.error.existed('帐号'),
	existedmail: App.error.existed('邮箱'),
	notexisted: App.error.existed('帐号', false),
	usertooshort: App.error.reg('用户名太短！'),
	passtooshort: App.error.reg('密码太短！'),
}, App.error);

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'oklogin', msg: '登录成功' },
            { fun: App.ok, name: 'oklogout', msg: '登出成功' },
            { fun: App.ok, name: 'okget', msg: '获取成功' },
            { fun: App.ok, name: 'oksend', msg: '发送成功' },
            { fun: App.ok, name: 'okverify', msg: '验证成功' },
        ]);
        this.session = session;
        this.name = '用户';
        this.saftKey = ['id'].concat(Account.keys().filter(k => ['passwd'].indexOf(k) < 0));
    }

    get error() {
        return __error__;
    }
    
    async login(data) {
        const keys = ['username', 'passwd'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, keys);

        try {
            let account = await this.exist(data.username, true);
            if(!account) {
                throw this.error.verify;
            } else {
                let sha256 = crypto.createHash('sha256');
                let passwd = sha256.update(data.passwd + __salt).digest('hex');
                if (account.passwd != passwd) {
                    throw this.error.verify;
                }
            }

            account.lastlogin = parseInt(new Date().valueOf() / 1000);
            account.save();

            this.session.user = App.filter(account, this.saftKey);
            let last = await Record.findOne({
                where: { user: this.user.id },
                order: [['stage', 'DESC']]
            })
            this.session.last = App.filter(last, ['stage', 'url'])
            return this.oklogin(App.filter(this.session.user, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network(err));
        }
    }

    async create(data, onlyData = false) {
        const keys = ['username', 'passwd'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        if (data.username.length < 5) {
            throw this.error.usertooshort;
        }

        if (data.passwd.length < 8) {
            throw this.error.passtooshort;
        }

        data = App.filter(data, keys);
        
        try {
            data.nickname = data.username;
            data.lastlogin = new Date().valueOf() / 1000;
            let sha256 = crypto.createHash('sha256');
            data.passwd = sha256.update(data.passwd + __salt).digest('hex');
            data.email = data.email || '';
            let account = await super.new(data, Account, 'username');
            this.session.user = App.filter(account, this.saftKey);
            await this.addRecord(this.session.last || {stage: 0, url: '/'});
            if (onlyData) return account;
            return this.okcreate(App.filter(account, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async update(data, onlyData=false) {
        const keys = ['username'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, Account.keys().concat(['id', 'oldpasswd']));

        try {
            let account = await this.info(this.user.username, true, this.saftKey.concat(['passwd']));
            if (account.username != data.username) {
                throw this.error.limited;
            }

            // 用户名不可更改
            data.username = undefined;
            data.id = account.id;
            if (data.passwd) {
                let sha256 = crypto.createHash('sha256');
                let passwd = sha256.update(data.oldpasswd + __salt).digest('hex');
                if (account.passwd != passwd) {
                    throw this.error.verify;
                }
                sha256 = crypto.createHash('sha256');
                data.passwd = sha256.update(data.passwd + __salt).digest('hex');
            }
            else data.passwd = undefined;

            account = App.filter(await super.set(data, Account), this.saftKey);

            if (onlyData) return account;
      
            return this.okupdate(account);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async exist(username, onlyData = false) {
        try {
            let data = await Account.findOne({
                where: {
                    username: username
                }
            });
            if (onlyData) return data;
            return this.okget(!!data);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async exists(data, onlyData = false) {
        const keys = ['email'];

        if (!App.hasone(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, keys);
        try {
            let account = await Account.findOne({
                where: data
            });
            if (onlyData) return account;
            return this.okget(!!account);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    logout() {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        this.session.user = undefined;
        this.session.last = undefined;
        return this.oklogout();
    }

    get islogin() {
        return this.session && this.session.user;
    }

    async info(username, onlyData = false, fields=null) {
        fields = fields || this.saftKey;
        let data = await Account.findOne({
            where: {
                username
            }
        });

        if (!data) throw(this.error.notexisted);

        if (this.islogin && username == this.user.username) {
            let last = await Record.findOne({
                where: { user: this.user.id },
                order: [['stage', 'DESC']]
            })
            this.session.last = App.filter(last, ['stage', 'url']);
            data.lastlogin = parseInt(new Date().valueOf() / 1000);
            data.save();
        }

        if (onlyData == true) return App.filter(data, fields);
        return this.okget(App.filter(data, fields));
    }

    async query(query, fields=null, onlyData=false) {
        let ops = {
            id: App.ops.in,
            username: App.ops.in,
        };
        query = App.filter(query, Object.keys(ops));
        try {
            let data = {
                index: 0,
                count: -1,
                query
            };
            data.fields = fields || this.saftKey.filter(k => ['email', 'phone'].indexOf(k) < 0);
            let queryData = await super.query(
                data, Account, ops
            );
            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async history(username) {
        try {
            let user = await Account.findOne({
                where: { username }
            });

            if (!user) throw(this.error.notexisted);

            let records = await Record.findAll({
                where: {
                    user: user.id
                },
                order: [['stage', 'desc']]
            });

            return records.map(r => App.filter(r, ['stage', 'url', 'create_time', 'pass_time']));
        } catch (error) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async addRecord(data) {
        const keys = ['url', 'stage'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, keys);
        
        try {
            data.pass_time = 0;
            data.user = this.user.id;

            let record = await Record.findOne({
                where: { stage: data.stage, user: data.user }
            });
            if (record) {
                if (record.stage > this.session.last.stage) this.session.last = App.filter(record, ['url', 'stage']);
                return record;
            }

            let greater = await Record.findOne({
                where: App.where({ 
                    stage: data.stage, 
                    user: data.user 
                }, { 
                    stage: App.ops.greater, 
                    user: App.ops.equal 
                })
            });
            if (greater) return null;
            record = await super.new(data, Record, ['user', 'stage']);
            this.session.last = App.filter(record, ['url', 'stage']);

            let prev = await Record.findOne({
                where: { stage: data.stage - 1, user: data.user  }
            });
            if (prev) {
                prev.pass_time = parseInt(new Date().valueOf() / 1000);
                prev.save();
            }
            
            return record;
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    static async count() {
        try{
            return (await Record.findAll({
                attributes: [[Account.db.fn('COUNT', Record.db.col('user')), 'total']],
                group: ['user'],
            })).length;
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }                           
    }

    async getRecord() {
        try{
            Record.belongsTo(Account, { foreignKey: 'user', targetKey: 'id' });
            let records = await Record.findAll({
                attributes: [[Record.db.fn('MAX', Record.db.col('stage')), 'stage'], [Record.db.fn('MAX', Record.db.col('puz_record.create_time')), 'create_time']],
                include: [{ 
                    model: Account,
                    required: true,
                    attributes: [['username', 'username'], ['nickname', 'nickname']]
                }],
                group: ['user'],
                order: [[Record.db.fn('MAX', Record.db.col('stage')), 'DESC'], [Record.db.fn('MAX', Record.db.col('puz_record.create_time')), 'ASC']],
                limit: 50
            })

            return records.map(r => Object.assign({ username: r.puz_user.username, nickname: r.puz_user.nickname }, App.filter(r, ['username', 'nickname', 'stage', 'create_time'])));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }                           
}

    get user() {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        return this.session.user;
    }
}

module.exports = Module;