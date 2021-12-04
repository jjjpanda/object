const cocoSsd = require('@tensorflow-models/coco-ssd');
const ObjectDetector = require('./ObjectDetector');

module.exports = (inputs) => {
    console.log("LOADING MODEL")
    const model = cocoSsd.load().then(model => {
        console.log("MODEL LOADED, STARTING LOOP")
        let streams = inputs.map((input) => {
            const detector = new ObjectDetector(input, model)
            detector.on("data", (data) => {
                console.log(data)
            })
            return detector
        })
    })
}