/**
 * Created by Franklin on 2017/3/14.
 */
var webpack = require('webpack');
var path = require('path');

module.exports = {
    context:__dirname,
    // mode: 'production',
    devtool: 'source-map',
    entry : [
        path.join(__dirname, './views_src/main/index.js')
    ],
    output: {
        path: path.join(__dirname, '/public/js/output/'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                loader: ['jsx-loader?harmony']
            }
        ]
    },
};

// use:[{loader: 'jsx-loader?harmony'}]