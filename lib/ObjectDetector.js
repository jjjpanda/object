const tf = require('@tensorflow/tfjs-node');
const EventEmitter = require('events').EventEmitter
const FFMPEG = require('./FFMPEG');
const Jimp = require('jimp')

module.exports = class ObjectDetector extends EventEmitter{
    constructor(options, model){
        super()
        const {sizeTolerance, positionTolerance, probabilityOfExistenceDecay, minimumObjectConfidence} = options
        this.model = model
        this.ghostResults = []
        this.positionChecking = {
            sizeTolerance: sizeTolerance ? sizeTolerance : 0.1,
            positionTolerance: positionTolerance ? positionTolerance : 0.1
        }
        this.minimumObjectConfidence = minimumObjectConfidence ? minimumObjectConfidence : 0.8
        this.probabilityOfExistenceDecay = probabilityOfExistenceDecay ? probabilityOfExistenceDecay : 0.9
        this.stream = new FFMPEG(options)
        this.stream.on('change', (differencePercentage) => this.emit('change', differencePercentage))
        this.stream.on('data', (data, image) => {
            const imgTensor = tf.node.decodeImage(data, 3);
            this.model.detect(imgTensor).then(results => {
                if(results.length > 0 || this.addToGhostResults(results)) {
                    this.emit('object', results)
                    let imageWithBoundingBoxes = image
                    Promise.all(results.map((result) => {
                        if(result.score > this.minimumObjectConfidence){
                            this.emit('message', result.score, result.class)
                        }
                        return this.generateObjectDetectionImagePromise(result)
                    })).then(arrayOfBoxes => {
                        if(arrayOfBoxes.length == 0){
                            throw new Error('nothing identified')
                        }
                        let maxScore = 0
                        for(const {score, box, x, y} of arrayOfBoxes){
                            maxScore = Math.max(maxScore, score)
                            imageWithBoundingBoxes = imageWithBoundingBoxes.composite(box, x, y)
                        }
                        return {image: imageWithBoundingBoxes, score: maxScore}
                    }).then(({image, score}) => {
                        if(score > this.minimumObjectConfidence) return image.getBufferAsync(Jimp.MIME_JPEG)
                        else return Buffer.from('')
                    }).then(buffer => {
                        this.emit('image', buffer)
                    }).catch(e => {
                        console.log(e)
                    })
                }
                else{
                    this.emit('object', results.length > 0 ? "objects detected but nothing changed from last time" : "no objects detected")
                }
            }).catch(e => console.log("ERROR CAUGHT ", e));
        });
        setInterval(this.decayGhost.bind(this), 1000)
    }

    generateObjectDetectionImagePromise(result) {
        return new Promise((resolve, reject) => {
            const [x, y, width, height] = result.bbox
            Jimp.loadFont(Jimp.FONT_SANS_16_WHITE, (err, font) => {
                if(err) return reject(err)
                else new Jimp(width, height, "#FF0000AA", (err, image) => {
                    const borderSize = ObjectDetector.boundingBoxBorderWidth
                    const sizeTooSmall = width - 2*borderSize <= 0 || height - 2*borderSize <= 0
                    if(sizeTooSmall){
                        reject(`size too small for ${result}`)
                    }
                    else{
                        const border = image.mask(new Jimp(width - 2*borderSize, height - 2*borderSize, "#00000000"), borderSize, borderSize)
                                            .print(font, 0, 0, result.class);
                        if(!err) resolve({box: border, x, y, score: result.score})
                        else reject(`failed to create box for ${result}`)
                    }
                })
            })
        })
    }

    addToGhostResults(results) {
        if(this.ghostResults.length == 0){
            this.ghostResults=results
            return true
        }
        let tempGhostCheckList = [...this.ghostResults]
        let anyResultsAdded = false
        for(const result of results){
            for(let i = 0; i < tempGhostCheckList.length; i++){
                if(tempGhostCheckList[i].class == result.class && ObjectDetector.samePosition(tempGhostCheckList[i].bbox, result.bbox)){
                    console.log(tempGhostCheckList[i].class, "found to be in same position")
                    this.ghostResults[i] = result
                    tempGhostCheckList.splice(i, 1)
                    i++
                }
                else{
                    this.ghostResults.push(result)
                    anyResultsAdded = true
                }
            }
        }
        return anyResultsAdded
    }

    decayGhost(){
        this.ghostResults = this.ghostResults.map(result => {
            result.score *= this.probabilityOfExistenceDecay
            if(result.score < 0.1){
                return undefined
            }
            return result
        }).filter(result => result)
    }

    static boundingBoxBorderWidth = 16

    static samePosition(previousBoundingBox, currentBoundingBox) {
        const previousBoxArea = ObjectDetector.boxArea(previousBoundingBox)
        const currentBoxArea = ObjectDetector.boxArea(currentBoundingBox)
        
        const areaIsSimilar = ObjectDetector.isSimilar(previousBoxArea, currentBoxArea, this.positionChecking.sizeTolerance)
        const xIsSimilar = ObjectDetector.isSimilar(previousBoundingBox.x, currentBoundingBox.x, this.positionChecking.positionTolerance)
        const yIsSimilar = ObjectDetector.isSimilar(previousBoundingBox.y, currentBoundingBox.y, this.positionChecking.positionTolerance)

        return ( areaIsSimilar && xIsSimilar && yIsSimilar ) 
    }

    static boxArea({width, height}) {
        return width*height
    }

    static isSimilar(o1, o2, tolerance) {
        return Math.abs(o1 - o2)/o1 < tolerance
    }
}