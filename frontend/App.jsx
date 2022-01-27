import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"

import ReactHlsPlayer from "react-hls-player"

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./styles.css";

const App = () => {
  const [key, setKey] = useState(1);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    console.log("SET UP")
    setInterval(() => {
      window.location.reload()
    }, 1000*60*10)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const liveStreamPromise =  new Promise((resolve, reject) => {
        videoRef.current.onloadeddata = (event) => {
          console.log("EVENT", event, event.eventPhase, videoRef.current, videoRef.current.readyState )
          resolve([videoRef, event]);
        };
      });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, liveStreamPromise])
        .then(values => {
          videoRef.current.onloadeddata = () => {}
          console.log(values)
          detectFrame(videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [key])

  const detectFrame = (video, model) => {
    if(video.readyState == 4){
      model.detect(video).then(predictions => {
        renderPredictions(predictions);
        requestAnimationFrame(() => {
          detectFrame(video, model);
        });
      }).catch((e) => {
        console.log(e)
      });
    }
    else{
      console.log( "UNREADY FRAME", key, video.readyState )
      setKey(key + 1)
    }
  };

  const renderPredictions = predictions => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      console.log("PREDICTION", prediction)
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };
  
  return (
    <div>
      {/* <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={videoRef}
          width="600"
          height="500"
      /> */}
      <ReactHlsPlayer
        src={"http://localhost:8080/livestream/feed/1/video.m3u8"}
        autoPlay={true}
        controls={true}
        muted
        width="100%"
        height="auto"
        playerRef={videoRef}
        style={{zIndex: 1}}
      />
      <canvas
          className="size"
          ref={canvasRef}
          width="100%"
          height="auto"
          style={{zIndex: 2}}
      />
    </div>
  );
  
}

ReactDOM.render(<App />,
	document.getElementById("root"),
)