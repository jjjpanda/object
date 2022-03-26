#!/usr/bin/env node
const prepareDatabase = require('../lib/prepareDatabase.js')
const object = require('../lib/live.js')
const puppet = require('../lib/puppet.js')
prepareDatabase(() => {
    object.start(() => {
        console.log("object started")
        if(process.env.object_headless_ON === "true"){
            puppet()
        }
    })
})

//const object = require('../lib/legacy/index.js').object
//object(...process.argv.slice(2))