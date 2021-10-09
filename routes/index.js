const express = require('express');
const router = express.Router();
const config = require('../config.json');
const Stage = require('../interface/stage');
const User = require('../interface/user');

function shorttime(t) {
    let time = t, unit = '秒';
    if (time > 600) { time = time / 60; unit = '分多钟'; }
    if (unit == '分多钟' && time > 300) { time = time / 60; unit = '小时多'; }
    if (unit == '小时多' && time > 48) { time = time / 24; unit = '天多'; }
    if (unit == '天多' && time > 365) { time = time / 365; unit = '年多'; }
    else if (unit == '天多' && time > 100) { time = time / 30; unit = '个多月'; }
    return parseInt(time) + unit;
}

/* GET home page. */
router.all('/', async function(req, res, next) {
    let user = req.session.user;
    let last = req.session.last;
    let puzzle = new Stage(require('../stages'));
    if (puzzle.beforeRsp instanceof Function && await puzzle.beforeRsp(req, res)) return;
    res.render('puzzle', { config, puzzle, user, last });
});

router.all('/rank.html', async function(req, res, next) {
    let records = await new User(req.session).getRecord();
    let last = req.session.last;
    let user = req.session.user || {};
    res.render('rank', { config, records, user, last, total: await User.count() });
});

router.post('/u/:username', async function(req, res, next) {
    try {
        let user = await new User(req.session);
        let account = Object.assign(req.body, { username: user.user.username });
        let info = await user.info(req.params.username, true, user.saftKey);
        let records = await user.history(req.params.username);
        let error = '';
        try {
            req.session.user = await user.update(Object.assign({ username: user.user.username }, req.body), true);
        } catch (err) {
            error = err.message;
        }
        res.render('profile', { 
            config, account, user: info, records, shorttime, error
        });
    } catch (error) {
        res.send(error.message);
    }
})

router.get('/u/:username', async function(req, res, next) {
    try {
        let user = await new User(req.session);
        let account = req.session.user || {};
        let info = await user.info(req.params.username, true, user.saftKey);
        let records = await user.history(req.params.username);
        res.render('profile', { 
            config, account, user: info, records, shorttime
        });
    } catch (error) {
        res.send(error.message);
    }
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: '登录', register: false, account: {} });
});

router.get('/logout', function(req, res, next) {
    let user = new User(req.session);
    if(user.islogin) user.logout();
    res.send(`<script>location = '${req.headers.referer || '/'}'</script>`);
});

router.get('/register', function(req, res, next) {
    res.render('login', { title: '注册', register: true, account: {} });
});

router.post('/login', async function(req, res, next) {
    let error = '';
    try {
        let user = new User(req.session);
        await user.login(req.body);
        return res.end(`<script>
        if (top != window) top.location = top.location;
        else location = '/'; document.write('');
        </script>`)
    } catch (err) {
        error = err.message;
    }
    res.render('login', { error, title: '登录', register: false, account: req.body });
});

router.post('/register', async function(req, res, next) {
    let error = '';
    try {
        let user = new User(req.session);
        await user.create(req.body);
        return res.send(`<script>
        if (top != window) top.location = top.location;
        else location = '/'; document.write('');
        </script>`)
    } catch (err) {
        error = err.message;
    }
    res.render('login', { error, title: '注册', register: true, account: req.body });
});

module.exports = router;
