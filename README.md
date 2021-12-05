# object
object detection and webhook alerts using tensorflow-js coco-ssd of ip cameras

## Quick Start

1. Set up config
```
module.exports = [
    ...
    {
        name: "name of input",
        inputUrl: "url of RTSP/HTTP stream",
        fps: 1 //how many frames to check... per second (defaults to 1),
        differenceImagePath: "diff.jpg" //absolute file path to an image that will display Jimp/pixelchange and will be continuously overridden,
        alertUrl: 'webhook url'
    }
    ...
]
```

2. Start object

Keep it simple and use the included executables in the [dist](dist) folder. For example, on Windows:
```
> object-win.exe
```

Or you could use the npm bin command... 
```
> npm install --include=dev
> npx object 
```