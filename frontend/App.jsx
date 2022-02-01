import React from "react"
import ReactDOM from "react-dom"
import Object from "./Object"

const App = () => {
  let urls = []
  let cameras = []
  try{
    urls = JSON.parse(process.env.object_CAMERA_URLS)
    cameras = JSON.parse(process.env.cameras)
  } catch(e){ }

  let feeds = urls.map((url, index) => {
    return <Object url={url} camera={cameras[index]} cameraNumber={index+1} />
  })

  return (
    <div>
      {feeds}
    </div>
  )
}

ReactDOM.render(<App />,
	document.getElementById("root"),
)