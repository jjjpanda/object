const axios = require('axios')

module.exports = (url, content) => {
    if(content && content != ""){
        return axios.post(url, {
            content
        }).catch(err => {
            console.log(`webhook message failed`)
        })
    }
    else return undefined
}