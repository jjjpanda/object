#!/usr/bin/env node
const object = require('../lib/live.js')
object.start(() => {
    console.log("OBJECT STARTED")
})

//const object = require('../lib/legacy/index.js').object
//object(...process.argv.slice(2))