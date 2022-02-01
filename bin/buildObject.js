#!/usr/bin/env node
const path = require("path")
require('dotenv').config({
    path: path.join(process.cwd(), ".env")
})
const webpack = require('webpack')

console.log("CONFIG", path.resolve(__dirname, "../webpack.config.js"))

webpack(require(path.resolve(__dirname, "../webpack.config.js")), (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log("OBJECT BUILD FAILED", stats.toString())
        process.exit(1)
    }
    console.log("OBJECT BUILD DONE", stats.toString())
    process.exit(0)
})