const fs = require('fs');
const db = require('./db');
const ormsdir = '/orms';

let files = fs.readdirSync(__dirname + ormsdir);

let js_files = files.filter((f) => {
    return f.endsWith('.js');
}, files);

module.exports = {};

for (let f of js_files) {
    console.info(`import model from file ${f}...`);
    let name = f.substring(0, f.length - 3);
    module.exports[name] = require(__dirname + ormsdir + '/' + f);
}
module.exports.sync = async () => {
    await db.sync();
};