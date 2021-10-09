
module.exports = {
    stage: 1,
    next: 'stage2',
    html() {
        return `
    <div class="puzzle">
        <span class="tip">好啦~赶紧~我们到下一关去吧~</span>
    </div>
    `},
}