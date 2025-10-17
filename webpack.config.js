const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'src'),
        filename: 'bundle.js',
    },
    devServer: {
        // Use multiple static directories
        static: [
            {
                directory: path.join(__dirname, 'src'),
            },
            {
                directory: path.join(__dirname, 'assets'),
                publicPath: '/assets',
            }
        ],
        compress: true,
        port: 8080,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    }
};