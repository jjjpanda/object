const express = require('express')

let app = express.Router();

app.get("/", (req, res) => {
    res.send("BRUH")
})

app.post("/", (req, res) => {
    res.send("BRUH")
})

module.exports = app