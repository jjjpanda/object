const spawn = require('child_process').spawn
const EventEmitter = require('events').EventEmitter
const Buffer = require('buffer').Buffer
const Jimp = require('jimp')
module.exports = class FFMPEG extends EventEmitter {
    constructor(options){
        super()
        const {inputUrl, fps, differenceImagePath} = options
        this.input =inputUrl ?inputUrl : "__nothing__"
        this.fps = fps ? fps : 1
        this.differenceImagePath = differenceImagePath
        this.arguments = FFMPEG.generateArgs(this.input, this.fps);
        this.ghost = Buffer.from('')
        this.buff = Buffer.from('');
        this.on('newListener', this.newListener.bind(this));
        this.on('removeListener', this.removeListener.bind(this));
    }

    differentThanGhost() {
        const previous = this.ghost
        const current = this.buff
        if(current.length > 0 && previous.length > 0){
            Promise.all([
                new Jimp.read(previous),
                new Jimp.read(current)
            ]).then(([image1, image2]) => {
                const diff = Jimp.diff(image1, image2, 0.15)
                if(this.differenceImagePath) {
                    diff.image.writeAsync(this.differenceImagePath).catch(e => console.log('error writing difference image'))
                }
                if(diff.percent > 0.04){
                    this.emit('data', diff.percent, current)
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }

    newListener(event) {
        if (event === 'data' && this.listeners(event).length === 0) {
            var self = this;
            this.child = spawn("ffmpeg", self.arguments);
            this.child.stdout.on('data', function(data){
                if (data.length >1) {
                    self.buff = Buffer.concat([self.buff, data]);
                    let offset      = data[data.length-2].toString(16);
                    let offset2     = data[data.length-1].toString(16);
                    if(offset == "ff" && offset2 == "d9") {
                        self.differentThanGhost()
                        self.ghost = Buffer.from(self.buff)
                        self.buff = Buffer.from('');
                    }
                }
            });
            this.child.stderr.on('data', (data) => {throw new Error(data)});
            this.emit('start');
            this.child.on('error', (err) => {
                if (err.code === 'ENOENT') {
                    throw new Error('ffmpeg executable wasn\'t found');
                } else {
                    throw err;
                }
            });
        }
    }
    
    removeListener(event) {
        if (event === 'data' && this.listeners(event).length === 0) {
            this.child.kill();
            delete this.child;
            this.emit('stop');
        }
    }

    static generateArgs(input, fps) {
        return [
            '-loglevel', 'quiet',
            '-i', input,
            '-r', fps.toString(),
            '-vf', 'scale=1920:1080',
            '-f', 'image2',
            '-update', '1',
            '-'
        ];
    };
}

