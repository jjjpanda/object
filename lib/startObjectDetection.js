const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const FFMPEG = require('./FFMPEG');
const webhookAlert = require('./webhookAlert')

module.exports = (inputs) => {
    console.log("LOADING MODEL")
    const model = cocoSsd.load().then(model => {
        console.log("MODEL LOADED, STARTING LOOP")
        let streams = inputs.map(({name, inputUrl, fps, alertUrl}) => {
            const stream = new FFMPEG({inputUrl, fps})
            stream.on('data', (data) => {
                const imgTensor = tf.node.decodeImage(data, 3);
                model.detect(imgTensor).then(results => {
                    for(const result of results){
                        if(result.score > 0.8 && alertUrl != undefined){
                            webhookAlert(alertUrl, `FROM: ${name} | OBJECT: ${result.class} | CONF: ${Math.round(result.score * 100)/100}`)
                        }
                    }
                }).catch(e => console.log("ERROR CAUGHT ", e));
            });
            return stream
        })
    })
}