const similarToAny = (previousPredictions, singlePrediction) => {
    let similar = false;
    for(const previousPrediction of previousPredictions){
        if(samePosition(previousPrediction.bbox, singlePrediction.bbox)){
            similar = true
            break
        } 
    }
    return similar
}

const samePosition = (previousBoundingBox, currentBoundingBox, sizeTolerance=0.1, positionTolerance=0.1) => {
    const previousBoxArea = boxArea(previousBoundingBox)
    const currentBoxArea = boxArea(currentBoundingBox)
    
    const areaIsSimilar = isSimilar(previousBoxArea, currentBoxArea, sizeTolerance)
    const xIsSimilar = isSimilar(previousBoundingBox.x, currentBoundingBox.x, positionTolerance)
    const yIsSimilar = isSimilar(previousBoundingBox.y, currentBoundingBox.y, positionTolerance)

    return ( areaIsSimilar && xIsSimilar && yIsSimilar ) 
}

const boxArea = ({width, height}) => {
    return width*height
}

const isSimilar = (o1, o2, tolerance) => {
    return Math.abs(o1 - o2)/o1 < tolerance
}

export { similarToAny }
