const spawn = require('child_process').spawn
const EventEmitter = require('events').EventEmitter
const Buffer = require('buffer').Buffer

module.exports = class FFMPEG extends EventEmitter {
    constructor(options){
        super()
        const {inputUrl, fps} = options
        this.input =inputUrl ?inputUrl : "__nothing__"
        this.fps = fps ? fps : 1
        this.arguments = [];
        this.buff = Buffer.from('');
        this.on('newListener', this.newListener.bind(this));
        this.on('removeListener', this.removeListener.bind(this));
    }

    _args() {
        return this.arguments.concat([
            '-loglevel', 'quiet',
            '-i', this.input,
            '-r', this.fps.toString(),
            '-f', 'image2',
            '-update', '1',
            '-'
        ]);
    };

    newListener(event) {
        if (event === 'data' && this.listeners(event).length === 0) {
            var self = this;
            this.child = spawn("ffmpeg", this._args());
            this.child.stdout.on('data', function(data){
            if (data.length >1) {
                self.buff = Buffer.concat([self.buff, data]);
                let offset      = data[data.length-2].toString(16);
                let offset2     = data[data.length-1].toString(16);
                if(offset == "ff" && offset2 == "d9") {
                    self.emit('data', self.buff);
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
}

