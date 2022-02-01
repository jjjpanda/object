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

const queryGen = (camera, type, score) => pool.query(`INSERT INTO objects_detected(camera, type, confidence) VALUES(${camera}, '${type}', ${roundTo(score, 6)});`)

let app = express.Router();

app.use(express.urlencoded({ extended: false }))
app.use(express.json({limit: "50mb"}))

const sendImageMiddleware = (req, res, next) => {
    const {dataUrl, cameraNumber} = req.body
    var buffer = Buffer.from(dataUrl.split(",")[1], "base64")

    const url = JSON.parse(process.env.object_alertUrls)[cameraNumber-1]
    webhookAlert.sendImage(url, buffer)

    next()
}

const sendMessageMiddlware = (req, res, next) => {
    const {predictions, camera, cameraNumber} = req.body
    for(const prediction of predictions){
        const url = JSON.parse(process.env.object_alertUrls)[cameraNumber-1]
        webhookAlert.sendMessage(url, `detected ${prediction.class} in ${camera} with confidence ${roundTo(prediction.score, 2)*100}%`)
    }
    next()
}

const sendToDatabase = (req, res, next) => {
    const {predictions, cameraNumber} = req.body
    Promise.all(predictions.map(prediction => queryGen(cameraNumber, prediction.class, prediction.score))).then(values => {
        next()
    }).catch(e => {
        res.send("failed one or more database adds")
    })
}

app.post("/", sendToDatabase, sendMessageMiddlware, sendImageMiddleware, (req, res) => {
    res.send("OK")
})

module.exports = app