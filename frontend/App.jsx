import React from "react"
import ReactDOM from "react-dom"
import Object from "./Object"

const App = () => {
  let urls = []
  try{
    urls = JSON.parse(process.env.object_CAMERA_URLS)
  } catch(e){ }

  let feeds = urls.map((url) => {
    return <Object url={url} />
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