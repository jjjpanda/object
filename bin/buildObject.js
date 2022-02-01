const path = require("path")
require('dotenv').config({
    path: path.join(process.cwd(), ".env")
})
const webpack = require('webpack')

webpack(require(path.resolve(process.cwd(), "../webpack.config.js")), (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log("OBJECT BUILD FAILED")
        process.exit(1)
    }
    console.log("OBJECT BUILD DONE")
    process.exit(0)
})