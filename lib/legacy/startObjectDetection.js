const cocoSsd = require('@tensorflow-models/coco-ssd');
const ObjectDetector = require('./ObjectDetector');
const {sendMessage, sendImage} = require('../util/webhookAlert');

module.exports = (inputs) => {
    console.log("LOADING MODEL")
    const model = cocoSsd.load().then(model => {
        console.log("MODEL LOADED, STARTING LOOP")
        let streams = inputs.map((input) => {
            const {name, alertUrl} = input
            const detector = new ObjectDetector(input, model)
            /* detector.on("object", (data) => {
                console.log(data)
            })
            detector.on("change", (diff) => {
                console.log(diff)
            }) */
            detector.on('message', (confidence, type) => {
                if(alertUrl != undefined){
                    sendMessage(alertUrl, `FROM: ${name} | OBJECT: ${type} | CONF: ${Math.round(confidence * 1000)/1000}`)
                }
            })
            detector.on('image', (buffer) => {
                if(alertUrl != undefined && buffer.length > 0){
                    sendImage(alertUrl, buffer)
                }
            })
            return detector
        })
    })
}