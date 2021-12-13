const fs = require('fs')
const path = require('path')
const dotenv = require("dotenv")
const validateConfig = require('./validateConfig.js')
const startObjectDetection = require('./startObjectDetection.js')

require('@tensorflow/tfjs-node').setBackend('tensorflow');

const recursiveEnvCheck = (args, currentDepth, maxDepth) => {
    if(currentDepth > maxDepth){
        return []
    }
    else{
        let envFiles = []
        for(const arg of args){
            try{
                const stats = fs.statSync(arg)
                if(stats.isFile() && (path.extname(arg) == ".env" || path.basename(arg) == ".env")){
                    envFiles.push(arg)
                }
                else if(stats.isDirectory()){
                    const directory = fs.readdirSync(arg).map(file => path.join(arg, file))
                    envFiles = envFiles.concat(recursiveEnvCheck(directory, currentDepth+1, maxDepth))
                }
            }
            catch(err){
                console.log(`${arg} is invalid file or folder path to .env or multiple .env's`)
                return
            }
        }
        return envFiles
    }
}

const generateConfigArray = (envFiles) => {
    let configArray = []
    for(const envFile of envFiles){
        console.log(`FOUND ENV FILE`, envFile)
        try{
            const {
                name, inputUrl, fps,
                pixelThreshold, pixelChangePercentTolerance,
                sizeTolerance, positionTolerance,
                probabilityOfExistenceDecay, differenceImagePath, alertUrl
            } = dotenv.parse(fs.readFileSync(envFile))
            configArray.push({
                name, inputUrl, alertUrl, fps: parseFloat(fps),
                pixelThreshold: parseFloat(pixelThreshold), pixelChangePercentTolerance: parseFloat(pixelChangePercentTolerance),
                sizeTolerance: parseFloat(sizeTolerance), positionTolerance: parseFloat(positionTolerance),
                probabilityOfExistenceDecay: parseFloat(probabilityOfExistenceDecay), differenceImagePath
            })
        } catch(e){
            console.log(`ERROR PARSING`, envFile)
        }
    }
    return configArray
}

exports.object = (...args) => {
    let envFiles = recursiveEnvCheck(args.length == 0 ? [process.cwd()] : args, 0, 1)
    
    let config = generateConfigArray(envFiles)

    if(validateConfig(config)){
        startObjectDetection(config)
        console.log(`object started`)
    }
    else{
        console.log(`object not started`)
        return 
    }
}

exports.ObjectDetector = require('./ObjectDetector')

exports.FFMPEG = require('./FFMPEG')