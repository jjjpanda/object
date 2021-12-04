const cocoSsd = require('@tensorflow-models/coco-ssd');
const ObjectDetector = require('./ObjectDetector');
const {sendMessage, sendImage} = require('./webhookAlert');

module.exports = (inputs) => {
    console.log("LOADING MODEL")
    const model = cocoSsd.load().then(model => {
        console.log("MODEL LOADED, STARTING LOOP")
        let streams = inputs.map((input) => {
            const {name, alertUrl} = input
            const detector = new ObjectDetector(input, model)
            detector.on("data", (data) => {
                console.log(data)
            })
            detector.on('message', (score, {type, confidence}, buffer) => {
                if(alertUrl != undefined && score > 0.8){
                    sendMessage(alertUrl, `FROM: ${name} | OBJECT: ${type} | CONF: ${confidence}`)
                    sendImage(alertUrl, buffer)
                }
            })
            return detector
        })
    })
}