const path = require('path');

module.exports = {
	entry: './src/js/main.ts',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'build'),
	},
	module: {
		rules: [
			{
				test: /\.s?css$/,
				include: path.resolve(__dirname, 'src/scss'),
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.js$/,
				enforce: 'pre',
				use: ['source-map-loader'],
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
		],
	},
	devServer: {
		contentBase: path.join(__dirname, 'public'),
		publicPath: '/build',
		port: 8080,
	},
	optimization: {
		minimize: true,
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
};
