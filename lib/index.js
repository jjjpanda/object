const fs = require('fs')
const path = require('path')
const validateConfig = require('./validateConfig.js')
const startObjectDetection = require('./startObjectDetection.js')

exports.object = (configPath=path.join(process.cwd(), "object.config.js")) => {
    if(path.basename(configPath) !== "object.config.js"){
        console.log(`path does not lead to object.config.js`)
        return
    }
    fs.stat(configPath, (err) => {
        if(err){
            console.log(`no object.config.js found`)
            return
        }
        else{
            const config = require(path.resolve(configPath))
            if(validateConfig(config)){
                startObjectDetection(config)
                console.log(`object started`)
            }
            else{
                console.log(`object not started`)
                return 
            }
        }
    })
}

exports.ObjectDetector = require('./ObjectDetector')

exports.FFMPEG = require('./FFMPEG')