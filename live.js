var path       = require("path")
var express    = require("express")

var app = express()

app.use("/feed", express.static(path.join("/run/shm/", "feed")))
app.use("/legacy", express.static(path.join(__dirname, "/"), {
    index: "live.html"
}))
app.use("/", express.static(path.join(__dirname, "dist"), {
    index: "app.html"
}))

app.listen(9090, () => {})