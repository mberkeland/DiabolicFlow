const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
    runtimeCompiler: true,
    assetsDir: './static_escape',
    configureWebpack: {
        performance: {
            hints: false
        },
        optimization: {
            splitChunks: {
                minSize: 10000,
                maxSize: 250000,
            },
            minimizer: [
                new TerserPlugin({
                    sourceMap: true, // Must be set to true if using source-maps in production
                    terserOptions: {
                        compress: {
                            drop_console: false,
                        },
                    },
                }),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.(svg)(\?.*)?$/,
                    use: [
                        {
                            loader: 'svg-sprite-loader',
                            options: {
                                symbolId: 'V'
                            }
                        }
                    ]
                }
            ]
        }
    },
    chainWebpack: config => {
        config.module
            .rule('svg')
            .test(() => false)
            .use('file-loader')
    },
}