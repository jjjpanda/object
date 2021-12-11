# object
object detection and webhook alerts using tensorflow-js coco-ssd of ip cameras

## Quick Start

1. Set up your .env files

|Variable Name|Description|Default|
|:-|:-|-:|
|name                        |name of input| none|
|inputUrl                    |url of RTSP/HTTP stream| none|
|alertUrl                    |webhook url| none|
|fps                         |how many frames to check... per second| 1|
|minimumObjectConfidence     |minimum confidence to warrant a message to webhook about an object, range 0-1| 0.8|
|pixelThreshold              |threshold to detect changed pixels, range 0-1| 0.1|
|pixelChangePercentTolerance |minimum pixel percentage change to warrant object detection to set off, range 0-1| 0.01|
|sizeTolerance               |size change tolerance to identify change in detected object, range 0-1| 0.1|
|positionTolerance           |position change tolerance to identify change in detected object, range 0-1| 0.1|
|probabilityOfExistenceDecay |how much the probability of existence should decay per second, range 0-1| 0.9|
|differenceImagePath         |absolute file path to an image that will display Jimp/pixelchange difference and will be continuously overridden, absolute file path to an image that will display Jimp/pixelchange difference and will be continuously overridden| none|

You can make multiple .env files and label them like so:
```
> ls
frontdoor.env backdoor.env sidedoor.env garage.env
```

You can use the env.example as guide for .env

2. Start object

Keep it simple and use the included executables in the [dist](dist) folder. Add the executable to your path system variable for ease of use. And then just... run it. For example, on Windows (*kinda the only tested option currently*):
```
> object-win.exe
```
**By default object will use the current working directory if not arguments are given.**

Or you can specify the location(s) of the .env file(s):
```
> object-win.exe C:\Absolute\Path\frontdoor.env
> object-win.exe ./relative/path/frontdoor.env ./backdoor.env ./sidedoor.env
```

Or use folders to reference multiple .env files. Note that object will not recursively traverse folders searching for .env's. For example, if you run:
```
> object-win.exe ./folder
```

The files that will be recognized are labeled as ✔️.
All other files and folders will not be recognized.

```
folder
│   note.txt ❌
│   code.js ❌    
|   video.mp4 ❌
|   env.txt ❌
|   env ❌
|   frontdoor.env ✔️
|   backdoor.env ✔️
|   .env ✔️
|
└───subfolder
|   |   garage.env ❌
│   │
│   └───subsubfolder
|       |   .env ❌
│       │   ...
```

But, you can list multiple folders:
```
> object-win.exe ./folder ./folder/subfolder/subsubfolder 
```

And that would recognize even more .env's:

```
folder
│   note.txt ❌
│   code.js ❌    
|   video.mp4 ❌
|   env.txt ❌
|   env ❌
|   frontdoor.env ✔️
|   backdoor.env ✔️
|   .env ✔️
|
└───subfolder
|   |   garage.env ❌
│   │
│   └───subsubfolder
|       |   .env ✔️
│       │   ...
```

Happy object detecting!

---