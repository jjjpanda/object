const similarToAny = (previousPredictions, singlePrediction) => {
    let i = 0
    for(const previousPrediction of previousPredictions){
        const sameThing = previousPrediction.class == singlePrediction.class
        const samePlace = samePosition(previousPrediction.bbox, singlePrediction.bbox)
        const sameTime = timestampWithin(previousPrediction, 5*60*1000)
        if( sameThing && sameTime /**&& samePlace */ ){
            return i
        } else {
            console.log({
                previousPrediction,
                singlePrediction,
                samePlace,
                sameTime,
                sameThing
            })
            i++
        }
    }
    return -1
}

const samePosition = (previousBoundingBox, currentBoundingBox, sizeTolerance=0.25, positionTolerance=0.25) => {
    const previousBoxArea = boxArea(previousBoundingBox)
    const currentBoxArea = boxArea(currentBoundingBox)
    
    const areaIsSimilar = isSimilar(previousBoxArea, currentBoxArea, sizeTolerance)
    const xIsSimilar = isSimilar(previousBoundingBox.x, currentBoundingBox.x, positionTolerance)
    const yIsSimilar = isSimilar(previousBoundingBox.y, currentBoundingBox.y, positionTolerance)

    return ( areaIsSimilar && xIsSimilar && yIsSimilar ) 
}

const timestampWithin = ({timestamp}, millis) => {
    return timestamp && new Date() - timestamp <= millis;
}

const boxArea = ({width, height}) => {
    return width*height
}

const isSimilar = (o1, o2, tolerance) => {
    return Math.abs(o1 - o2)/o1 < tolerance
}

export { similarToAny }
