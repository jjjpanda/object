var path       = require("path")
var express    = require("express")

var app = express()

app.use("/feed", express.static(path.join("/run/shm/", "feed")))
app.use("/", express.static(path.join(__dirname, "/"), {
    index: "live.html"
}))

app.listen(8080, () => {})