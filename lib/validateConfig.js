module.exports = (unvalidatedConfig) => {
    if(!(unvalidatedConfig instanceof Array) || unvalidatedConfig.length == 0){
        return false
    }
    else{
        for( const unvalidatedConfigObj of unvalidatedConfig ){
            const {inputUrl} = unvalidatedConfigObj
            if(inputUrl == undefined){
                return false
            }
        }
        return true
    }
}