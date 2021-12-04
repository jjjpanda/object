const tf = require('@tensorflow/tfjs-node');
const EventEmitter = require('events').EventEmitter
const FFMPEG = require('./FFMPEG');

const Jimp = require('jimp')
module.exports = class ObjectDetector extends EventEmitter{
    constructor(options, model){
        super()
        this.model = model
        const stream = new FFMPEG(options)
        stream.on('data', (percentDifference, data) => {
            console.log(percentDifference)
            const imgTensor = tf.node.decodeImage(data, 3);
            this.model.detect(imgTensor).then(results => {
                this.emit('data', results)
                for(const result of results){
                    this.emit(
                        'message', 
                        result.score, 
                        {type: result.class, confidence: Math.round(result.score * 1000)/1000},
                        data
                    )
                }
            }).catch(e => console.log("ERROR CAUGHT ", e));
        });
    }
}