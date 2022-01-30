var path       = require("path")
require('dotenv').config({
    path: path.join(process.cwd(), ".env")
})
var express    = require("express")

console.log("ENV:", path.join(process.cwd(), ".env"))

var app = express()

app.use("/object", require('./routes/object.js'))

module.exports = {
    app,
    start: (callback) => {
        if("object_PORT" in process.env){
            return app.listen(process.env.object_PORT, callback)
        }
        else{
            console.log("FAILED > NO PORT")
        }
    }
}
