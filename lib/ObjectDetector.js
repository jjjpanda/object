const tf = require('@tensorflow/tfjs-node');
const EventEmitter = require('events').EventEmitter
const FFMPEG = require('./FFMPEG');
const webhookAlert = require('./webhookAlert');

module.exports = class ObjectDetector extends EventEmitter{
    constructor(options, model){
        super()
        const {name, alertUrl} = options
        this.name = name
        this.model = model
        this.alertUrl = alertUrl
        const stream = new FFMPEG(options)
        stream.on('data', (percentDifference, data) => {
            console.log(percentDifference)
            const imgTensor = tf.node.decodeImage(data, 3);
            this.model.detect(imgTensor).then(results => {
                this.emit('data', results)
                for(const result of results){
                    if(result.score > 0.8 && alertUrl != undefined){
                        webhookAlert(this.alertUrl, `FROM: ${this.name} | OBJECT: ${result.class} | CONF: ${Math.round(result.score * 100)/100}`)
                    }
                }
            }).catch(e => console.log("ERROR CAUGHT ", e));
        });
    }
}