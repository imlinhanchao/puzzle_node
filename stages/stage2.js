
module.exports = {
    stage: 2,
    next: 'rank',
    html() {
        return `
    <div class="puzzle">
        <span class="tip">嗯啊~那么下一关又在哪儿呢？</span>
    </div>
    <a href="${this.next_page}" style="color:white;float:right;display:inline-block;">下一关>> </a>
    `},
}