const yargs = require('yargs'),
    ora = require('ora'),
    glob = require('glob'),
    shelljs = require('shelljs');

const params = yargs.argv._[0];

if (!params) {
    ora().succeed('必须传递参数!');
    return false;
}

const start = () => {
    glob('src/**/app.jsx', (err, files) => {
        if(err) {
            ora({
                color: 'red'
            }).stopAndPersist({
                symbol: '✖',
                text: '没有找到此文件'
            });
        }
        const file = files.find(item => item.indexOf(params) !== -1) || '';
        shelljs.exec(`npm set TARGET ${file} && cross-env NODE_ENV=development node server.js`);
        ora({
            color: 'green'
        }).stopAndPersist({
            symbol: '✔',
            text: '开发环境服务器启动成功~'
        })
    });
};

start();