const tf = require('@tensorflow/tfjs-node');
const EventEmitter = require('events').EventEmitter
const FFMPEG = require('./FFMPEG');
const Jimp = require('jimp')

const borderWidth = 16
module.exports = class ObjectDetector extends EventEmitter{
    constructor(options, model){
        super()
        this.model = model
        const stream = new FFMPEG(options)
        stream.on('change', (differencePercentage) => this.emit('change', differencePercentage))
        stream.on('data', (data, image) => {
            const imgTensor = tf.node.decodeImage(data, 3);
            this.model.detect(imgTensor).then(results => {
                if(results.length > 0) this.emit('object', results)
                let imageWithBoundingBoxes = image
                Promise.all(results.map((result) => {
                    this.emit('message', result.score, result.class)
                    return new Promise((resolve, reject) => {
                        const [x, y, width, height] = result.bbox
                        Jimp.loadFont(Jimp.FONT_SANS_16_WHITE, (err, font) => {
                            if(err) return reject(err)
                            else new Jimp(width, height, "#FF0000AA", (err, image) => {
                                const border = image.mask(new Jimp(width - 2*borderWidth, height - 2*borderWidth, "#00000000"), borderWidth, borderWidth)
                                                    .print(font, 0, 0, result.class);
                                if(!err) resolve({box: border, x, y})
                                else reject(`failed to create box for ${result}`)
                            })
                        })
                    })
                })).then(arrayOfBoxes => {
                    if(arrayOfBoxes.length == 0){
                        throw new Error('nothing identified')
                    }
                    for(const {box, x, y} of arrayOfBoxes){
                        imageWithBoundingBoxes = imageWithBoundingBoxes.composite(box, x, y)
                    }
                    return imageWithBoundingBoxes
                }).then(image => {
                    return image.getBufferAsync(Jimp.MIME_JPEG)
                }).then(buffer => {
                    this.emit('image', 1, buffer)
                }).catch(e => {
                    console.log(e)
                })

            }).catch(e => console.log("ERROR CAUGHT ", e));
        });
    }
}