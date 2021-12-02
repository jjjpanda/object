const path = require('path')
const Buffer = require('buffer').Buffer
const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const FFMPEG = require('./FFMPEG');

module.exports = ({url}) => {
    const stream = new FFMPEG({url})

    console.log("LOADING MODEL")
    const model = cocoSsd.load().then(model => {
        console.log("MODEL LOADED, STARTING LOOP")
        var pipeStream = function(data) {
            //console.log('data', data.toString('base64'));
            //fs.writeFile("./bruh.jpg", data, () => {})
            try{
                const imgTensor = tf.node.decodeImage(data, 3);
                model.detect(imgTensor).then(results => {
                    console.log(results)
                    for(const result of results){
                        if(result.score > 0.1){
                            console.log(`OBJECT: ${result.class} | CONF: ${Math.round(result.score * 100)/100}`)
                        }
                    }
                });
            }
            catch(e){
                console.log("ERROR CAUGHT ", e)
            }
        };
        stream.on('data', pipeStream);
    })
}