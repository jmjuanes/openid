let path = require("path");
let MiniCssExtract = require("mini-css-extract-plugin");

//Export the webpack configuration
module.exports = {
    "entry": "./src/index.js",
    "mode": "development",
    "output": {
        "path": path.resolve(__dirname, "./public/"),
        "filename": "app.js"
    },
    "resolve": {
        "modules": [
            path.resolve(__dirname, "./bower_components/"),
            path.resolve(__dirname, "./node_modules/")
        ],
    },
    "module": {
        "rules": [
            {
                "test": /\.scss$/,
                "use": [
                    MiniCssExtract.loader,
                    {loader: "css-loader"},
                    {
                        "loader": "sass-loader",
                        "options": {"includePaths": ["./node_modules/"]}
                    }
                ]
            },
            {
                "test": /\.(png|jpg|gif|svg)$/,
                "use": {
                    "loader": "file-loader",
                    "options": {
                        "name": "[name].[ext]",
                        "outputPath": "img/"
                    }
                }
            },
            {
                "test": /\.js$/,
                "include": [
                    path.resolve(__dirname, "./src")
                ],
                "loader": "babel-loader"
            }
        ]
    },
    "plugins": [
        new MiniCssExtract({filename: "app.css"})
    ]
};
