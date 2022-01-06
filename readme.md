<p align="center">
  <a href="https://p.hancel.org">
    <img width="200" src="./public/images/logo.png">
  </a>
</p>

<h1 align="center">Online Puzzle Node</h1>

由之前的网页解谜开发模板 PHP 版本([szisa/puzzle](https://github.com/szisa/puzzle))演化而来，支持了更多自定义功能，另外增加用户登录注册和排行榜。依据此模板开发的网页解谜网站有：

1. [摸鱼大闯关](https://p.hancel.org)
2. [和平哥的谜](https://puzzle.iwpz.net/)

## 📦 配置

1. 在 `stages` 拷贝 `tpl.js` 为一个新的 js 文件。文件名必须完全小写，名称与关卡地址一致。
2. 填写关卡编号 `stage`，下一关卡路径 `next` ，网页title提示 `title`(选填)，通关密码 `passwd` (选填)等等。
3. 在 `html()` 中编写谜面。
4. 更多参数参考 [tpl.js](stages/tpl.js)

## ✨ 参数
1. `stage` : 目前关卡编号，用于显示在页面告知解谜者。
2. `next` : 下一页面的地址，这里分为两种：  
 - 通过提交密码通关，这里 URL 必须填写从 `stages` 目录开始的路径，无需写后缀名 ，例如：`lang/ruby`；  
 - 通过 URL 方式通关，则根据需要填写即可，建议一样写上，方便后续查看。
3. `title` : 当需要在网页的`<title>`标签填写提示语时，则设置该项；
4. `passwd` : 选中第b种解谜方式时，则需要填写该项，并且需配合模板中的密码框提交密码。
你也可以针对每个关卡编写自己的检查处理，查看 `check` 参数； 
5. `js` :  设置*页面加载完成后*执行的js代码，此部分代码不会直接出现在页面中，而是过`script`标签引用外部文件；  
6. `css` : 设置关卡的独立css代码，此部分代码不会直接出现在页面中，而是过`link`标签引用外部文件；  
7. `feedback` : 设置指定密码 feedback，此参数仅可以用于包含密码检查的关卡，必须为一个 `async` 函数，`return` 值为显示的 feedback；  
8. `head` : 插入到 `head` 标签的代码；
9. `html` : 页面主体的代码，一般为主要谜面；
10. `last` : 插入到网页末端的代码，一般为注释。
11. `beforeRsp` : 在页面渲染前执行的代码，可以对 request 和 response 进行处理。

## 🛡 部署
服务器需安装 `nodejs` 和 `npm` 。部署执行如下脚本：
```bash
npm install
```

初始化配置
```bash
npm run init
```

重新初始化数据库（**会清空数据**）
```bash
npm run initdb
npm run initdb -- user # 初始化指定表
```

启动服务：
```bash
npm start
```

以守护进程方式，启动服务：
```bash
forever start ./bin/www --uid puzzle
```
or
```bash
pm2 start -n puzzle npm -- start
```

## ⚙️ 调试
1. 执行`npm install`;
2. 使用 Visual Studio Code 运行调试（直接按下`F5`即可）。

## 📁 目录
- .vscode - VSCode 调试配置
- bin - 服务启动入口  
- interface - 业务接口实现   
- stages - 关卡文件
- pubilc - 静态资源  
- routes - 网页路由  
- script - 脚本 
- views - 页面模板
- models - 数据库模型
