const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); //每次构建清理dist目录
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 模式配置
  mode: 'development',
  // 入口文件
  entry: {
    pagination: './src/index.js'
  },
  // 出口文件
  output: {
    path: path.resolve(__dirname, 'dist-es6'),
    filename: "pagination.min.js",
    libraryTarget: 'umd',
    library: 'pagination'
  },
  // 对应的插件
  plugins: [
    new CleanWebpackPlugin(['dist-es6']),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body',
    }),
    new UglifyJsPlugin({
      test: /\.js($|\?)/i
    })
  ],
  // 开发服务器配置
  devServer: {},
  // 处理对应模块
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname , 'src'),
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.less$/,
        // include: path.join(__dirname , 'style'),
        exclude: /node_modules/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'less-loader'
        }]
      }
    ]
  }
}
