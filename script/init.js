const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
let config = {
    name: 'Online Puzzle',
    port: 3000,
    domain: 'http://localhost:3000',
    cnzz: '',
    identityKey: '',
    secret: '',
    salt: ''
};

let db = {
    database: 'puz',
    dialect: 'mysql',
    prefix: 'puz_',
    port: 3306,
    logging: false
};

const randomStr = () => randomUp(Math.random().toString(36).substr(2));
const randomUp = s => s.split('').map(s => parseInt(Math.random() * 10) % 2 ? s : s.toUpperCase()).join('');

async function main() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.inputData = function (key, defaultVal) {
        return new Promise((resolve, reject) => {
            try {
                this.question(`${key}: ` + (defaultVal ? `[${defaultVal}]` : ''), function (val) {
                    resolve(val || defaultVal);
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    console.info('Let\'s config website.');

    if (config['identityKey'] == ''
        || await rl.inputData('Do you want to reset safe key config (identityKey etc.) ?', 'N') == 'Y') {
        config['identityKey'] = '_LIB_SESSION_ID_' + randomStr();
        config['secret'] = randomStr() + randomStr();
        config['salt'] = randomUp(uuidv4());
    }
    config['port'] = parseInt(await rl.inputData('Port', config['port']));
    config['domain'] = await rl.inputData('Domain', config['domain']);

    config['name'] = await rl.inputData('Website Name', config['name']);
    config['cnzz'] = await rl.inputData('CNZZ', config['cnzz']);
        
    db['port'] = parseInt(await rl.inputData('Database Port', db['port']));
    db['database'] = await rl.inputData('Database Name', db['database']);
    db['prefix'] = await rl.inputData('Table Prefix', db['prefix']);
    db['logging'] = await rl.inputData('Log SQL Execute', db['logging'] ? 'Y' : 'N') == 'Y';

    db['host'] = await rl.inputData('Database Host', 'localhost');
    db['user'] = await rl.inputData('Database User', 'root');
    db['password'] = await rl.inputData('Database Password', '');
    
    fs.writeFile(path.join(__dirname, '../config.json'),
        JSON.stringify(config, null, 4),
        (err) => {
            if (err) console.error(`Save website config failed: ${err.message}`);
            else {
                // Save DB Config
                fs.writeFile(path.join(__dirname, '../models/config.json'),
                JSON.stringify(db, null, 4),
                (err) => {
                    if (err) console.error(`Save db config failed: ${err.message}`);
                    else initDB();
                });        
            }
        });
    rl.close();

}

function initDB () {
    (async () => {
        const model = require('../models');
        try {
            await model.sync();
            console.info('Init all model finish.');
        } catch (err) {
            console.error(`Init model failed: ${err.message}`);                
        }
        console.info('Please execute \'npm run build\' to build frontend, and then execute \'npm  start\' to start the website.');
        process.exit();
    })();
}

main();