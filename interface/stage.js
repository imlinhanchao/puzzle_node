const path = require('path');

class Stage {
    constructor(stage) {
        this.stage = stage.stage || 0;
        this.next = stage.next || 'stage0';
        this.passwd = stage.passwd === undefined ? null : stage.passwd;
        this.title = stage.title || '';
        this.head = stage.head || (() => '');
        this.html = stage.html || (() => '');
        this.last = stage.last || (() => '');
        this.js = stage.js || (() => '');
        this.css = stage.css || (() => '');
        this.feedback = stage.feedback || (async passwd => '密码错误！')
        this.check = stage.check || null;
        this.beforeRsp = stage.beforeRsp || null;
    }

    get next_page() {
        return `/${this.next}.html`;
    }

    get headCode() {
        return this.head();
    }

    get htmlCode() {
        return this.html();
    }

    get lastCode() {
        return this.last();
    }

    get jsCode() {
        return this.js();
    }

    get cssCode() {
        return this.css();
    }

    async check2next(req, res) {
        if (this.check && this.check instanceof Function) return await this.check(req, res);
        if (this.passwd === null || req.body.passwd === undefined) return null; 
        if (this.passwd.toLowerCase() === req.body.passwd.toLowerCase()) 
        {
            return res.redirect(this.next_page);
        }
        else return res.send(await this.feedback(req.body.passwd.toLowerCase()));
    }

    static load(stage)
    {
        let stage_path = path.join('..', 'stages', stage.toLowerCase());
        try {
            return new Stage(require(stage_path));
        } catch (error) {
            return null;
        }
    }

    static commonJs(js) {
        return `onload = function(){
    var loginLink = document.getElementById("login");
    var registerLink = document.getElementById("register");
    function dialog(ev) {
        Dialogor.Open({
            title : this.innerText, 
            type : "iframe", 
            content : this.href, 
            height : 215, 
            width : 300
        });
        return false;
    }
    if (registerLink)
    {
        registerLink.onclick = dialog
    }
    if (loginLink) 
    {
        loginLink.onclick = dialog
    }
    var logoutLink = document.getElementById("logout");
    if(logoutLink)
    {
        logoutLink.onclick = function(ev) {
            if(confirm("你确定要退出登录吗？")) location = '/logout';
            return false;
        }
    }
    ${js||''}
}`
    }

    static commonCss(css) {
        return `@charset "utf-8";
html{position: relative;min-height: 100%;}
body {color:#000;background-color:#FFF;padding: 0 5px;margin:0 auto;font: 12px Quicksand,Source Sans Pro,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;}
input{font: 100% 12px Quicksand,Source Sans Pro,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;}
h1,h2,h3,h4,h5,h6{font-weight:normal;font-size: 100%;}
h1.title{font-size: 350%;}
a img{border:none;}
a{text-decoration:none;color:#999;}
a:hover{text-decoration:underline;}
a, area{blr:expression(this.onFocus=this.blur());}
:focus{-moz-outline-style:none;hidefocus:hidefocus;outline:none;}
.hide{display:none;}
.title{text-align: center;font-weight:bold;}
.puzzle, .passwd{text-align: center;margin: 5px auto;}
.rule{max-width:667px;text-align:left;font-size:150%;margin:auto;line-height:1.5;}
.rule p{text-indent: 2em;}
footer{height:70px;}
#userinfo{text-align:center;position:absolute;width:100%;bottom:0;left:0;color:#AAA;}
#userinfo a{color:#AAA;}
#userinfo .tip{color:red;}
#passwd{width: 130px;}
#cnzz{display: none;}
#dlg_view, #dlg_bg{width:100%;height:100%;position:fixed;_position:absolute;top:0;left:0;}
#dlg_bg{filter:alpha(opacity=50);opacity: 0.2;background: #000;}
#dlg_main{background:#fff url(../images/loading.gif) no-repeat center center;border: #ccc 1px solid;width:300px;position: absolute;_position:absolute;top: 50%;left: 50%;margin:auto;background-size: 30px;}
#dlg_main #dlg_title{height: 30px;padding: 0 0 0 10px;background: #000;color: #FFF;line-height: 30px;cursor: move;}
#dlg_main #dlg_title h4{float:left;padding:0;margin:0;font-size:14px;}
#dlg_main #dlg_close{float:right;cursor:pointer;width: 30px;text-align: center;}
#dlg_main #dlg_resize{width: 40px;height: 40px;cursor: nw-resize;right: -20px;bottom: -20px;position: absolute;}
${css||''}`;
    }
};

module.exports = Stage;