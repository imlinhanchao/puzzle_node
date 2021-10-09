
module.exports = {
    stage: 1,
    title: 'title tips', // 标题 Tip
    next: 'stage2', // 下一关的地址，无需后缀
    passwd: 'password',
    head() {
        return `
    <meta name="next" content="${this.next_page}" />` // next_page 是组合后的下一关地址
    },
    beforeRsp(req, rsp) {
        // 渲染前的对 request 和 response 的处理
        this.user = req.session.user; // 可以访问 session 的数据
        rsp.cookie('tip', 'cookie tips'); // 可以添加 cookie
        rsp.setHeader('passwd', this.passwd); // 可以添加 header
        // rsp.end('自定义返回内容');
        // return true; // 如果自定义返回内容，就要 return true;
    },
    html() {
        return `
            <div class="puzzle">
                <p class="tip">主体内容 Tip: ${this.user ? this.user.nickname : ''} </p>
                <p><img src="/images/logo.jpg" width="100"/></p>
            </div>
            <div class="passwd">
                <input type="text" name="passwd" id="passwd"/>
                <input type="submit" name="Submit" value="确认密码">
            </div>
        `},
    last() {
        return `<!-- 网页末端Tip -->`
    },
    js() {
        return `
    alert('针对这个关卡隐秘注入的 js')`
    },
    css() {
        return `.passwd:after { content: '针对这个关卡隐秘注入 css'; }`
    },
    async feedback(passwd) {
        if (passwd == '123456') return `你想得太简单了！`; // 根据密码提供自定义的信息返回
        return `密码错误！`
    },
    async check(req, rsp) { // 自定义 post 请求的检查处理
        if (this.passwd === null || req.body.passwd === undefined) return null; 
        if (this.passwd.toLowerCase() === req.body.passwd.toLowerCase()) 
        {
            return rsp.redirect(this.next_page);
        }
        else return rsp.send(await this.feedback(req.body.passwd.toLowerCase()));
    }
}