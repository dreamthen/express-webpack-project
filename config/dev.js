const path = require('path'),
    webpack = require('webpack'),
    HappyPack = require('happypack'),
    TerserWebpackPlugin = require('terser-webpack-plugin'),
    ExtractWebpackPlugin = require('extract-text-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const PUBLIC_DIR = '/',
    OUTPUT_DIR = path.resolve(__dirname, '../build'),
    TEMPLATE_DIR = path.resolve(__dirname, '../public'),
    SRC_DIR = path.resolve(__dirname, '../src');

const TARGET = `./${process.env.npm_config_TARGET}`;

module.exports = {
    devtool: 'eval',
    mode: 'development',
    entry: {
        app: [
            //在入口处配置热加载模块的客户端配置,设置资源热加载内容变化时,开发环境服务器重新刷新,目录配置则是__webpack_hmr'
            'webpack-hot-middleware/client?path=__webpack_hmr&reload=true',
            TARGET
        ]
    },
    output: {
        publicPath: PUBLIC_DIR,
        filename: `js/[name].[hash].js`,
        path: OUTPUT_DIR
    },
    resolve: {
        modules: [
            'node_modules',
            SRC_DIR
        ]
    },
    externals: {
        jquery: 'jQuery'
    },
    optimization: {
        runtimeChunk: true,
        minimizer: [
            new TerserWebpackPlugin({
                //是否开启缓存机制
                cache: true,
                //是否开启多核压缩机制
                parallel: true,
                terserOptions: {
                    output: {
                        //是否删除除了含有@license意外其他所有的注释
                        comments: /@license/i
                    },
                    mangle: {
                        //开启对ie8浏览器的兼容
                        ie8: true,
                        //开启对IOS 10系统的兼容
                        safari10: true
                    }
                },
                //是否删除所有的注释
                extractComments: true
            })
        ],
        splitChunks: {
            chunks: 'all',
            minSize: 0,
            minChunks: 1,
            cacheGroups: {
                base: {
                    name: 'base',
                    minSize: 0,
                    minChunks: 1,
                    chunks: 'initial',
                    priority: 10,
                    test: (module)=>{
                        return /(react|react-dom|lodash|moment|react-router)/.test(module.context)
                    }
                },
                commons: {
                    name: 'commons',
                    minSize: 0,
                    minChunks: 1,
                    priority: 5,
                    chunks: 'initial'
                }
            }
        }
    },
    module: {
        rules: [{
            test: /\.js[x]?$/,
            include: [
                SRC_DIR
            ],
            use: [
                //happypack对js以及jsx文件进行处理,id为jsx
                'happypack/loader?id=jsx'
            ]
        }, {
            test: /\.css$/,
            //在不使用style-loader的情况下,可以使用extract-text-webpack-plugin和mini-css-extract-plugin将css样式抽成文件
            /**
             use: ExtractWebpackPlugin.extract({
                        fallback: 'style-loader',
                        use: ['happypack/loader?id=css']
                    })
             */

            use: [
                //MiniCssExtractPlugin.loader,
                /**
                 {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                //只在开发环境开启资源热更新
                                hmr: process.env.NODE_ENV === 'development',
                                //当热更新失效时,是否强制刷新更新资源
                                reloadAll: true
                            }
                        }
                 */
                //happypack对css文件进行处理,id为css
                'happypack/loader?id=css'
            ]
        }, {
            test: /\.less$/,
            //在不使用style-loader的情况下,可以使用extract-text-webpack-plugin和mini-css-extract-plugin将less样式抽成文件
            /**
             use: ExtractWebpackPlugin.extract({
                        fallback: 'style-loader',
                        use: ['happypack/loader?id=less']
                    })
             */
            use: [
                //MiniCssExtractPlugin.loader,
                /**
                 {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                //只在开发环境开启资源热更新
                                hmr: process.env.NODE_ENV === 'development',
                                //当热更新不生效时,进行强制刷新更新资源
                                reloadAll: true
                            }
                        }
                 */
                //happypack对less文件进行处理,id为less
                'happypack/loader?id=less'
            ]
        }, {
            test: /\.(png|jpeg|jpg|gif|bmp)$/,
            use: [
                //happypack对image图片文件进行处理,id为image
                'happypack/loader?id=image'
            ]
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        /**
         new ExtractWebpackPlugin({
                    filename: 'css/[name].[hash:6].css'
                }),
         */
        /**
         new MiniCssExtractPlugin({
                    filename: 'css/[name].[hash:6].css'
                }),
         */
        new HappyPack({
            id: 'jsx',
            //将主进程分为4个分进程进行编译和打包
            threads: 4,
            loaders: [
                //使用babel-loader对js以及jsx文件进行编译
                'babel-loader'
            ]
        }),
        new HappyPack({
            id: 'css',
            //将主进程分为2个分进程进行编译和打包
            threads: 2,
            loaders: [
                //使用style-loader,css-loader和postcss-loader对css文件进行编译
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                'postcss-loader'
            ]
        }),
        new HappyPack({
            id: 'less',
            //将主进程分为2个分进程进行编译和打包
            threads: 2,
            loaders: [
                //使用style-loader,css-loader,postcss-loader和less-loader对css文件进行编译
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 2
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                'less-loader'
            ]
        }),
        new HappyPack({
            id: 'image',
            //将主进程分为4个分进程进行编译和打包
            threads: 4,
            loaders: [{
                //使用url-loader对image文件进行编译
                loader: 'url-loader',
                options: {
                    limit: 102400,
                    name: '[name].[hash:6].[ext]'
                }
            }]
        }),
        new HtmlWebpackPlugin({
            //注入模块(js,css,image...)等其他资源的目录路径
            publicPath: PUBLIC_DIR,
            //处理的模板引擎或者是超文本传输协议文件的名称
            filename: 'index.html',
            //模板引擎或者是超文本传输协议文件的目录地址
            template: `${TEMPLATE_DIR}/index.ejs`,
            //选择要注入的模块名称
            chunks: ['base', 'commons', 'app'],
            //是否将注入的模块打上hash值
            hash: true,
            //注入到模板引擎或者是超文本传输协议文件的位置
            inject: 'body',
            //是否压缩模板引擎或者是超文本传输协议文件
            minify: true,
            //要传入到模板引擎当中的属性变量
            templateParameters: {
            }
        }),
        new BundleAnalyzerPlugin()
    ]
};