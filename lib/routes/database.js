const express = require('express');
const webhookAlert = require('../util/webhookAlert');
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.database_USER,
    host: process.env.database_HOST,
    database: process.env.database_NAME,
    password: process.env.database_PASSWORD,
    port: process.env.database_PORT,
})

const roundTo = (val, sig) => Math.round(val * 10**sig) / 10**sig

const queryGen = (type, score) => pool.query(`INSERT INTO objects_detected(type, confidence) VALUES('${type}', ${roundTo(score, 6)});`)

let app = express.Router();

app.use(express.urlencoded({ extended: false }))
app.use(express.json({limit: "50mb"}))

const sendImageMiddleware = (req, res, next) => {
    const {dataUrl} = req.body
    var buffer = Buffer.from(dataUrl.split(",")[1], "base64")

    webhookAlert.sendImage(process.env.object_alertUrl, buffer)

    next()
}

const sendMessageMiddlware = (req, res, next) => {
    const {predictions} = req.body
    for(const prediction of predictions){
        webhookAlert.sendMessage(process.env.object_alertUrl, `detected ${prediction.class} with confidence ${roundTo(prediction.score, 2)*100}%`)
    }
    next()
}

const sendToDatabase = (req, res, next) => {
    const {predictions} = req.body
    Promise.all(predictions.map(prediction => queryGen(prediction.class, prediction.score))).then(values => {
        next()
    }).catch(e => {
        res.send("failed one or more database adds")
    })
}

app.post("/", sendToDatabase, sendMessageMiddlware, sendImageMiddleware, (req, res) => {
    res.send("OK")
})

module.exports = app