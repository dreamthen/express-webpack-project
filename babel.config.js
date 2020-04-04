const config = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                corejs: 3
            }
        ],
        '@babel/preset-react'
    ],
    plugins: [
        [
            '@babel/plugin-proposal-decorators',
            {
                legacy: true
            }
        ],
        '@babel/plugin-proposal-class-properties',
        [
            '@babel/plugin-transform-runtime',
            {
                helpers: false,
                regenerator: true
            }
        ]
    ]
};

module.exports = config;