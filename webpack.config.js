const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
	host: '0.0.0.0',
	contentBase: './dist'
    },
    entry: './src/index.ts',
    output: {
	path: path.resolve(__dirname, 'dist')
    },
    module: {
	rules: [
	    {
		test: /\.(ttf|woff|eot)$/,
		loader: 'file-loader',
		options: {
		    name: '[name].[ext]?[hash]'
		}
	    },
	    {
		test: /\.css$/,
		use:['style-loader','css-loader'],
		include: [/node_modules/]
	    },
	    {
		test: /\.tsx?$/,
		use: 'ts-loader',
		exclude: /node_modules/,
	    }
	    
	],
    },
    resolve: {
	extensions: [ '.tsx', '.ts', '.js' ],
    },
    plugins: [
	new HtmlWebpackPlugin({template: 'src/presentation.html'})
    ]
};
