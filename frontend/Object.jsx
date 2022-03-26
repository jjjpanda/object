import React, { useEffect, useRef, useState } from "react"

import ReactHlsPlayer from "react-hls-player"

import * as cocoSsd from "@tensorflow-models/coco-ssd";
//import cocoSsd from "./mockCocoSsd.js"
import "@tensorflow/tfjs";
import axios from "axios";
import { similarToAny } from "./PredictionTools";

const Object = (props) => {
  const [key, setKey] = useState(1);
  const [cachedModel, setCachedModel] = useState(undefined);
  const [pulsar, setPulsar] = useState(undefined);

  const videoRef = useRef();
  const canvasRef = useRef();

  const loadModel = () => cachedModel != undefined ? new Promise(resolve => {
    console.log("COCOSSD SETUP COMPLETE")
    resolve(cachedModel)
  }) : cocoSsd.load();

  const generateWebCamPromise = () => navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? navigator.mediaDevices
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
        }) : null;

  const generateLiveStreamPromise = () => new Promise((resolve, reject) => {
    console.log("SETTING UP LIVESTREAM")
    if(videoRef && "current" in videoRef){
      videoRef.current.onloadeddata = (event) => {
        console.log("LIVESTREAM SETUP COMPLETE", event.eventPhase, videoRef.current, videoRef.current.readyState )
        videoRef.current.onloadeddata = () => {}
        resolve(event);
      };
    }
  });

  useEffect(() => {
    console.log("SET UP")
    clearInterval(pulsar);
    setTimeout(() => {
      window.location.reload()
    }, 1000*60*10)
    Promise.all([loadModel(), props.url == "webcam" ? generateWebCamPromise() : generateLiveStreamPromise() ])
      .then(values => {
        console.log("SET UP COMPLETE")
        setPulsar(setInterval(() => {
          axios.post("/object/status/up")
        }, 1000 * 60 * 0.5))
        console.log(values)
        setCachedModel(values[0])
        detectFrame(videoRef.current, values[0]);
      })
      .catch(error => {
        axios.post("/object/status/down")
        console.error(error);
      });
  }, [key])

  const detectFrame = (video, model, lastSentAt=new Date()) => {
    if(video.readyState == 4){
      model.detect(video).then(predictions => {
        const newDate = analyzePredictions(video, predictions, lastSentAt)
        
        requestAnimationFrame(() => {
          detectFrame(video, model, newDate);
        });
      }).catch((e) => {
        axios.post("/object/status/down")
        console.log(e)
      });
    }
    else{
      console.log( "UNREADY FRAME", key, video.readyState )
      setKey(key + 1)
    }
  };

  const analyzePredictions_legacy = (vid, preds, prevPreds) => {
    if(preds.length > 0){
      const peopleAndNonRepeatingFilteredPred = []
      let similarIndexes = []
      const d = new Date()

      for(let pred of preds){
        let indexOfPrevSimilar = similarToAny(prevPreds, pred)
        if(pred.class == "person" && pred.score >= process.env.object_minimumConfidence && indexOfPrevSimilar == -1){
          peopleAndNonRepeatingFilteredPred.push(pred)
        }
        pred.timestamp = new Date()
        pred.score *= 0.95
        if(indexOfPrevSimilar != -1 && pred.score >= process.env.object_minimumConfidence){
          similarIndexes.push(indexOfPrevSimilar)
        }
      }

      if(peopleAndNonRepeatingFilteredPred.length > 0){
        console.log(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`, "PREDICTIONS", [...preds], "PREV", [...prevPreds], "FILTER", [...peopleAndNonRepeatingFilteredPred], "SIMILAR", [...similarIndexes])
      }

      similarIndexes = new Set(similarIndexes)
      let i = 0
      for(let prevPred of prevPreds){
        if(!similarIndexes.has(i)){
          prevPred.timestamp=new Date()
          prevPred.score *= 0.95
          if(prevPred.score >= process.env.object_minimumConfidence){
            preds.push(prevPred)
          }
        }
        i++
      }
      
      if(peopleAndNonRepeatingFilteredPred.length > 0) {
        const dataUrl = extractFrameImage(vid, preds)
        axios.post("/object/database", {
          camera: props.camera,
          cameraNumber: props.cameraNumber,
          dataUrl,
          predictions: peopleAndNonRepeatingFilteredPred
        })
      }
    }
    
    renderPredictions(canvasRef.current, preds);
  }

  const analyzePredictions = (vid, preds, lastSentAt) => {
    let filteredPred = []
    const d = new Date()
    if(preds.length > 0 && d - lastSentAt > 2500){
      for(let pred of preds){
        if(pred.class == "person" && pred.score >= process.env.object_minimumConfidence){
          filteredPred.push(pred)
        }
      }
    }
    renderPredictions(canvasRef.current, preds);
    if(filteredPred.length > 0) {
      console.log("PREDS", preds, d - lastSentAt, "FILTERS", filteredPred)
      const dataUrl = extractFrameImage(vid, preds)
      axios.post("/object/database", {
        camera: props.camera,
        cameraNumber: props.cameraNumber,
        dataUrl,
        predictions: filteredPred
      })
      return d;
    }
    return lastSentAt
  }

  const extractFrameImage = (v, p) => {
    const canvas = document.createElement("canvas")
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
    renderPredictions(canvas, p, false)

    return canvas.toDataURL("image/jpeg", 0.1);
  }

  const renderPredictions = (canvas, predictions, clear=true) => {
    const ctx = canvas.getContext("2d");
    if(clear) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 10, 10)
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
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
    <div style={{position: 'relative', width: "800px", height: "450px"}}>
      {props.url == "webcam" ? <video
        className="size"
        autoPlay
        playsInline
        muted
        ref={videoRef}
        width="600"
        height="500"
      /> : <ReactHlsPlayer
        key={key}
        src={props.url}
        autoPlay={true}
        controls={true}
        muted
        width="800px"
        height="450px"
        playerRef={videoRef}
        style={{position: "absolute", top: 0, left: 0, zIndex: 1, objectFit: "fill"}}
      />}
      <canvas
          className="size"
          ref={canvasRef}
          width="800px"
          height="450px"
          style={{position: "absolute", top: 0, left: 0, zIndex: 2}}
      />
    </div>
  );
}

export default Object