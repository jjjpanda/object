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

        //leave blank if you want
        alertUrl: 'webhook url',

        //how many frames to check... per second (defaults to 1)
        fps: 1, 

        //minimum confidence to warrant a message to webhook about an object, range 0-1 (defaults to 0.8)
        minimumObjectConfidence: 0.8,

        //threshold to detect changed pixels, range 0-1 (defaults to 0.1)
        pixelThreshold: 0.1, 

        //minimum pixel percentage change to warrant object detection to set off, range 0-1 (defaults to 0.01)
        pixelChangePercentTolerance: 0.01, 

        //size change tolerance to identify change in detected object (defaults to 0.1)
        sizeTolerance: 0.1,

        //position change tolerance to identify change in detected object (defaults to 0.1)
        positionTolerance: 0.1,

        //how much the probability of existence should decay per second, range 0-1 (defaults to 0.9)
        probabilityOfExistenceDecay: 0.9,

        //absolute file path to an image that will display Jimp/pixelchange difference and will be continuously overridden
        //leave blank if you don't want a difference image
        differenceImagePath: "diff.jpg", 
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