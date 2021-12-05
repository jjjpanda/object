module.exports = (unvalidatedConfig) => {
    if(!(unvalidatedConfig instanceof Array) || unvalidatedConfig.length == 0){
        return false
    }
    else{
        for( const unvalidatedConfigObj of unvalidatedConfig ){
            const {
                name, inputUrl, 
                minimumObjectConfidence, 
                pixelThreshold, 
                pixelChangePercentTolerance, 
                sizeTolerance, 
                positionTolerance, 
                probabilityOfExistenceDecay
            } = unvalidatedConfigObj

            const rangeRequirementsNotMet = !checkRanges({
                minimumObjectConfidence, 
                pixelThreshold, 
                pixelChangePercentTolerance, 
                sizeTolerance, 
                positionTolerance, 
                probabilityOfExistenceDecay
            })

            if(name == undefined || inputUrl == undefined || rangeRequirementsNotMet){
                return false
            }
        }
        return true
    }
}

const checkRanges = (config) => {
    const entries = Object.entries(config)
    for(const [key, value] of entries){
        if(value != undefined && (0 > value || value > 1)){
            console.log(key, "not within range 0-1")
            return false
        }
    }
    return true
}