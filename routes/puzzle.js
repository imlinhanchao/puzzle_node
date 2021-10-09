const express = require('express');
const path = require('path');
const router = express.Router();
const config = require('../config.json');
const Stage = require('../interface/stage');
const User = require('../interface/user');

router.post('/:stage.html', async function(req, res, next) {
    let puzzle = Stage.load(req.params.stage);
    if (!puzzle) return next();
    if((await puzzle.check2next(req, res)) === null) res.redirect(req.url);
});
  
router.post('/:folder/:stage.html', async function(req, res, next) {
    let puzzle = Stage.load(path.join(req.params.folder, req.params.stage));
    if (!puzzle) return next();
    if ((await puzzle.check2next(req, res)) === null) res.redirect(req.url);
});

router.get('/:stage.php', function(req, res, next) {
    res.redirect(req.url.replace(/\.php/, '.html'));
});

router.get('/:folder/:stage.php', function(req, res, next) {
    res.redirect(req.url.replace(/\.php/, '.html'));
});

router.get('/:stage.html', async function(req, res, next) {
    let puzzle = Stage.load(req.params.stage);
    if (!puzzle) return next();
    if (req.session.last && puzzle.stage - req.session.last.stage > 1) 
        return next();
    let user = new User(req.session);
    let last = { url: req.url, stage: puzzle.stage < 0 ? 0 : puzzle.stage }
    if (user.islogin) await user.addRecord(last)
    if (!req.session.last || req.session.last.stage < puzzle.stage) req.session.last = last
    if (puzzle.beforeRsp instanceof Function && await puzzle.beforeRsp(req, res)) return;
    res.render('puzzle', { config, puzzle, user: req.session.user, last: req.session.last });
});
  
router.get('/:folder/:stage.html', async function(req, res, next) {
    let puzzle = Stage.load(path.join(req.params.folder, req.params.stage));
    if (!puzzle) return next();
    if (req.session.last && puzzle.stage - req.session.last.stage > 1) 
        return next();
    let user = new User(req.session);
    let last = { url: req.url, stage: puzzle.stage < 0 ? 0 : puzzle.stage }
    if (user.islogin) await user.addRecord(last)
    if (!req.session.last || req.session.last.stage < puzzle.stage) req.session.last = last
    if (puzzle.beforeRsp instanceof Function && await puzzle.beforeRsp(req, res)) return;
    res.render('puzzle', { config, puzzle, user: req.session.user, last: req.session.last });
});

router.get('/css/common.css', function(req, res, next) {
    let puzzle = null;
    if (req.headers.referer) {
        let ref = new URL(req.headers.referer);
        puzzle = Stage.load(ref.pathname.replace(/^\/|\.html/g, ''));
    }
    res.setHeader('Content-Type', 'text/css;charset=UTF-8');
    res.send(Stage.commonCss(puzzle?.cssCode))
})

router.get('/js/common.js', function(req, res, next) {
    let puzzle = null;
    if (req.headers.referer) {
        let ref = new URL(req.headers.referer);
        puzzle = Stage.load(ref.pathname.replace(/^\/|\.html/g, ''));
    }
    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send(Stage.commonJs(puzzle?.jsCode))
});

module.exports = router;