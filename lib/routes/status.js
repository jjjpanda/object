const express = require('express')

let app = express.Router();

let statusGood = false

let statusInterval;
let setStatusInterval = () => {
    statusInterval = setInterval(() => {
        console.log("switching to status down")
        statusGood = false
    }, 1000 * 60)
}
setStatusInterval()

const middleware = (type) => (req, res) => {
    console.log(`switching to status ${type}`)

    clearInterval(statusInterval)
    setStatusInterval()

    statusGood = type == "up"
    res.send("got it")
}

app.get("/", (req, res) => {
    if(statusGood){
        res.send({})
    }
    else{
        res.status(204).send({})
    }
})

app.post("/up", middleware("up"))
app.post("/down", middleware("down"))

module.exports = app