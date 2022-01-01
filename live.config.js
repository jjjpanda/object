require("dotenv").config({path: "../Chimera/.env"})
const path = require("path")

let cameraIndex = 1
const cameraURL = (i) => process.env[`livestream_CAMERA_URL_${i}`]
const cameraKey = (i) => `livestream_CAMERA_URL_${i}`

let config = {apps: []}

cameraIndex = 1
while(cameraKey(cameraIndex) in process.env){
    config.apps.push({
        script: `mkdirp /run/shm/feed/${cameraIndex} && ffmpeg -rtsp_transport tcp -i "${cameraURL(cameraIndex)}" -fflags flush_packets -max_delay 1 -c:v copy -b:v 128k -f dash -window_size 4 -extra_window_size 0 -min_seg_duration 200 -remove_at_exit 1 ${path.join("/run/shm/", "feed", cameraIndex.toString(), "video.mpd")}`,
        name: `live_stream_cam_${cameraIndex}_dash`,
        log: `./log/livestream.${cameraIndex}_dash.log`,
        log_date_format:"YYYY-MM-DD HH:mm:ss",
    })
    cameraIndex++
}

module.exports = config