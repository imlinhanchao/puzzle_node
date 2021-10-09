const config = require('../config.json');

// 首页，不可重命名或删除
module.exports = {
    stage: 0,
    next: 'stage1',
    html() {
        return `
        <div class="puzzle">
            <div class="rule">
                <ol>
                    <li>这个游戏的目标就只有一个：进入下一关。在大部份关卡中，你需要利用网页上的提示来找到密码并进入下一关。找到密码后，把密码放到网址中即可过关：${config.domain}/folder/answer.html</li>
                    <li>部分关卡的密码是填入密码框中，如果密码正确，提交网页后就会直接进入下一关。</li>
                    <li>在不少的关卡中，你需要利用 <a target="_blank" href="https://www.google.com/">Google</a> 来搜寻数据以破关。<a target="_blank" href="https://www.wikipedia.org/">Wikipedia</a> (即维基百科)里也许也有较直接的信息。</li>
                    <li>${this.user ? '<del>' : ''}你可以<a id="login" href="/login">登录</a>以便于自动记录闯关~如果没有账号，可以<a href="/register" id="register">注册</a>一个。${this.user ? '</del>' : ''}
                    ${this.user ? `
                    <br />欢迎你的挑战，<b><a title="个人资料" href="/u/${this.user.username}" style="color:#000">${this.user.nickname}</a></b>。
                    ${ this.laststage.stage > 0 ? `上次你已到达<a title="立即前往 >>" href="${this.laststage.url}">Stage ${this.laststage.stage}</a>。` : ''}
                    ` : ''}
                    </li>
                </ol>
            <p>那么，就开始吧~Let's make fun~</p>
            </div>
            <a href="${this.next_page}" title="Let's make fun~">
            <img src="/images/logo.jpg" width="200" />
            </a>
        </div>
    `},
    beforeRsp(req, rsp) {
        this.user = req.session.user;
        this.laststage = req.session.last;
    }
}