import React, { useEffect, useRef, useState } from "react"

import ReactHlsPlayer from "react-hls-player"

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const Object = (props) => {
  const [key, setKey] = useState(1);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    console.log("SET UP")
    setInterval(() => {
      window.location.reload()
    }, 1000*60*10)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
     /*  const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        }); */
      const liveStreamPromise =  new Promise((resolve) => {
        if(videoRef && "current" in videoRef){
          videoRef.current.onloadeddata = (event) => {
            console.log("EVENT", event, event.eventPhase, videoRef.current, videoRef.current.readyState )
            resolve([videoRef, event]);
          };
        }
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

  const extractFrameImage = (video) => {
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL();
  }

  const detectFrame = (video, model) => {
    if(video.readyState == 4){
      model.detect(video).then(predictions => {
        //console.log(extractFrameImage(video))
        
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
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 10, 10)
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

  if(!props.url){
    throw new Error(`NO URL > PROVIDED: ${props.url}`)
  }
  
  return (
    <div style={{position: 'relative'}}>
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
        src={props.url}
        autoPlay={true}
        controls={true}
        muted
        width="1920px"
        height="1080px"
        playerRef={videoRef}
        style={{position: "absolute", top: 0, left: 0, zIndex: 1, objectFit: "fill"}}
      />
      <canvas
          className="size"
          ref={canvasRef}
          width="1920px"
          height="1080px"
          style={{position: "absolute", top: 0, left: 0, zIndex: 2}}
      />
    </div>
  );
}

export default Object