var path       = require("path")
const express = require('express')

let app = express.Router();

app.use("/database", require("./database.js"))
app.use("/status", require('./status.js'));
app.use("/", express.static(path.join(__dirname, "../../dist"), {
    index: "app.html"
}))

module.exports = app