#!/usr/bin/env node
const prepareDatabase = require('../lib/prepareDatabase.js')
const object = require('../lib/live.js')
prepareDatabase(() => {
    object.start(() => {
        console.log("OBJECT STARTED")
    })
})

//const object = require('../lib/legacy/index.js').object
//object(...process.argv.slice(2))