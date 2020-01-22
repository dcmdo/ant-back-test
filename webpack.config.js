var path = require("path");//引入NodeJS的路径对象
var webpack = require("webpack");//引入webpack对象
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var alias = require("./webpack.config.alias");
//获取app打包配置信息
var app_pack_path = function (appName, entryName,buildPath) {
    var pack_info = {};
    var entry_path = path.resolve(__dirname, "apps", appName, "entrys");
    var output_path = path.resolve(__dirname, "apps", appName, "builds/"+buildPath);
    pack_info.entry = {};
    pack_info.output = {};
    pack_info.entry[entryName] = path.resolve(entry_path, entryName);
    pack_info.output.path = output_path;
    pack_info.output.filename = "[name].build.js";
    return pack_info;
};
var pack_info;
//初始化当前app的打包路径
pack_info = app_pack_path("ant-design-react", "main","");//国网商旅-electron 国网商旅v2.0 差旅标准 ant-design-react
module.exports = {
    mode:"development",
    entry: pack_info.entry,
    output: pack_info.output,
    resolve:{
        alias:alias
    },
    target: "electron-main",
    plugins:[
        new MiniCssExtractPlugin({filename:"[name].css"})
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader:'babel-loader',
                options:{
                    presets:['@babel/preset-env','@babel/preset-react']
                }
            },
            {
                test:/\.css$/,
                exclude: /node_modules\/(?!highlight.js\/styles)/,
                use:[MiniCssExtractPlugin.loader,'css-loader','postcss-loader']
            },
            {
                test:/\.scss$/,
                exclude: /node_modules/,
                use:[MiniCssExtractPlugin.loader,'css-loader','postcss-loader','sass-loader']
            },
            {
                test:/\.(png|jpg|gif)$/i,
                exclude:/node_modules/,
                loader:'url-loader?limit=10000&name=./images/[name].[ext]'
            },
            {
                test:/\.(eot|svg|ttf|woff|woff2)$/i,
                exclude:/node_modules/,
                loader:'file-loader?name=./fonts/[name].[ext]'
            }
        ]
    }
};

//服务器端技术
// new webpack.DefinePlugin({
//     'process.env': {
//         // Useful to reduce the size of client-side libraries, e.g. react
//         NODE_ENV: JSON.stringify('production')
//     }
// })