require("dotenv").config()
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const Dotenv = require("dotenv-webpack")

module.exports = {
	mode: process.env.NODE_ENV,
	entry: {
		app: path.resolve(__dirname, "./frontend/App.jsx"),
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist")
	},
	resolve: {
		extensions: [".js", ".jsx"]
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: [/node_modules/],
				loader: "babel-loader"
			},
			{
				test: /\.css$/,
				use: [ "style-loader","css-loader" ]
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: "babel-loader",
					}
				],
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "frontend/app.html"),
			chunks : ["app"],
			filename: "app.html"
		}),
		new Dotenv()
	]
}