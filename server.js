const express = require('express'),
    path = require('path'),
    ora = require('ora'),
    proxy = require('http-proxy-middleware'),
    webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    dev = require('./config/dev');

const NODE_ENV = process.env.NODE_ENV,
    PORT = 8024;

const app = express();

app.use('/app', proxy.createProxyMiddleware({
    target: 'http://10.64.57.204',
    secure: false,
    changeOrigin: true
}));

if (NODE_ENV === 'development') {
    const compiler = webpack(dev);
    app.use(webpackDevMiddleware(compiler, {
        publicPath: dev.output.publicPath
    }));
    app.use(webpackHotMiddleware(compiler, {
        heartbeat: 3000
    }));
    app.get('/', (req, res) => {
        const file = path.join(__dirname, 'public/index.ejs');
        compiler.outputFileSystem.readFile(file, (err, result) => {
            if (err) {
                ora().stopAndPersist({
                    symbol: '✖',
                    text: '读取文件出现错误～'
                });
            }
            res.set('content-type', 'text/html');
            res.send(result);
        });
    });
} else {

}

app.listen(PORT, () => {
    ora().stopAndPersist({
        symbol: '✔',
        text: `web网站已在localhost:${PORT}域名中启动`
    });
});
