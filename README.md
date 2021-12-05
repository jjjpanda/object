# object
object detection and webhook alerts using tensorflow-js coco-ssd of ip cameras

## Quick Start

1. Set up object.config.js file
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

Keep it simple and use the included executables in the [dist](dist) folder. Add the executable to your path system variable for ease of use. And then just... run it. For example, on Windows:
```
> object-win.exe
```

You can also specify the location of the config file:
```
> object-win.exe C:\Users\user\object.config.js
> object-win.exe ../../object.config.js
```

Or you could use the npm bin command... 
```
> npm install --include=dev
> npx object 
```