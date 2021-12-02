const fs = require('fs')
const path = require('path')
const chalk = require('chalk');
const validateConfig = require('./validateConfig.js')
const startObjectDetection = require('./startObjectDetection.js')

exports.object = (configPath=path.join(process.cwd(), "object.config.js")) => {
    if(path.basename(configPath) !== "object.config.js"){
        console.log(`path does ${chalk.bold("not")} lead to ${chalk.underline("object.config.js")}`)
        return
    }
    fs.stat(configPath, (err) => {
        if(err){
            console.log(`no ${chalk.underline("object.config.js")} found`)
            return
        }
        else{
            const config = require(path.resolve(configPath))
            if(validateConfig(config)){
                startObjectDetection(config)
                console.log(`object ${chalk.bold("started")}`)
            }
            else{
                console.log(`${chalk.red("object", chalk.bold("not"), "started")}`)
                return 
            }
        }
    })
}