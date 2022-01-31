const axios = require('axios')
const FormData = require('form-data')

module.exports = {
    sendMessage: (url, content) => {
        if(content && content != ""){
            return axios.post(url, {
                content
            }).catch(err => {
                console.log(`webhook send message failed`)
            })
        }
        else return undefined
    },

    sendImage: (url, buffer) => {
        if(buffer instanceof Buffer && buffer.length > 0){
            var formData = new FormData();
            formData.append("file1", buffer, {
                filename: "detect.jpg"
            })
            /* formData.append("payload_json", JSON.stringify({embeds:[
                {
                    title: "Object Detected", 
                    image:{url:"attachment://detect.jpg"}
                } 
            ]})) */
            return axios.post(url, formData, {
                headers: formData.getHeaders()
            }).catch(err => {
                console.log('webhook send image failed', err.message)
            })
        }
        else return undefined
    }
}