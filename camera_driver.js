var util = require('util');
var url = require('url');
var spawn = require('child_process').spawn;
var Device = require('zetta-device');

var STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

var VIEWER_BASE_URL = 'http://video-viewer.herokuapp.com';

var Camera = module.exports = function() {
  Device.call(this);

  this.frameRate = 30;
  this.width = 640;
  this.height = 480;
  this.cameraId = 0;
  
  if (/^win/.test(process.platform)) {
    this._videoInputDevice = 'vfwcap';
  } else if(process.platform === 'darwin') {
    this._videoInputDevice = 'avfoundation';
  } else {
    this._videoInputDevice = 'v4l2';
  }  

  this._ffmpeg = null;
};
util.inherits(Camera, Device);

Camera.prototype.init = function(config) {
  config
    .state('ready')
    .type('camera')
    .name('Camera')
    .when('recording', { allow: ['stop'] })
    .when('ready', { allow: ['start', 'set-framerate', 'set-video-size', 'set-camera']})
    .map('stop', this.stop)
    .map('start', this.start)
    .map('set-framerate', this.setFrameRate, [{ type: 'number', name: 'framerate'}])
    .map('set-video-size', this.setVideoSize, [{ type: 'number', name: 'width', value: this.width}, { type: 'number', name: 'height', value: this.height}])
    .map('set-camera', this.setCamera, [{ type: 'number', name: 'cameraId'}])
    .stream('video', this.streamVideo, { binary: true });
  
  // setup url;
  this._generateUrl();
};

Camera.prototype.streamVideo = function(stream) {
  this._videoStream = stream;
};

Camera.prototype.start = function(cb) {
  var self = this;
  var args = ['-v', '1',
              '-f', this._videoInputDevice,
              '-i', ((this._videoInputDevice === 'v4l2') ? '/dev/video' + this.cameraId : this.cameraId),
              '-s', (this.width + 'x' + this.height),
              '-f', 'mpeg1video',
              '-b', '800k',
              '-r', this.frameRate,
              'pipe:1'];
    
  console.log('Spawning FFMPEG: ffmpeg', args.map(function(x){ return '"'+x+'"'}).join(' '));

  this._ffmpeg = spawn('ffmpeg', args);
  this._ffmpeg.stdout.on('data', function (data) {
    self._videoStream.write(data);
  });

  this._ffmpeg.stderr.on('data', function (data) {
    console.error('ffmpeg error: ', data.toString());
  });

  this._ffmpeg.on('close', function (code) {
    self.state = 'ready';
  });

  this.state = 'recording';
  cb();
};

Camera.prototype.stop = function(cb) {
  this._ffmpeg.kill('SIGTERM');  
  cb();
};

Camera.prototype.setFrameRate = function(fps, cb) {
  fps = Number(fps);
  if (fps > 0 && fps <= 60) {
    this.frameRate = fps;
  }
  cb();
};

Camera.prototype.setVideoSize = function(width, height, cb) {
  if (width > 0 && height > 0) {
    this.width = width;
    this.height = height;
  }
  cb();
};

Camera.prototype.setCamera = function(id, cb) {
  if (id > 0) {
    this.cameraId = id;
  }
  cb();
};

Camera.prototype._generateUrl = function() {
  var u = url.parse(VIEWER_BASE_URL, true);
  u.query.stream = 'ws://some-stream';
  u.query.width = this.width;
  u.query.height = this.height;
  this.url = url.format(u);
  return this.url;
};



