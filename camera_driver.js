var util = require('util');
var spawn = require('child_process').spawn;
var Device = require('zetta-device');

var Camera = module.exports = function() {
  Device.call(this);
  this._ffmpeg = null;
};
util.inherits(Camera, Device);

Camera.prototype.init = function(config) {
  config
    .state('ready')
    .type('camera')
    .name('Camera')
    .when('recording', { allow: ['stop']})
    .when('ready', { allow: ['start']})
    .map('stop', this.stop)
    .map('start', this.start)
    .stream('video', this.streamVideo, { binary: true });
};


Camera.prototype.streamVideo = function(stream) {
  this._videoStream = stream;
};

Camera.prototype.start = function(cb) {
  var self = this;
  var args = ['-v', '0', '-f', 'avfoundation', '-i', '0', '-s', '640x480', '-f', 'mpeg1video', '-b', '800k', '-r', '30', 'pipe:1'];
  this._ffmpeg = spawn('ffmpeg', args);
  
  this._ffmpeg.stdout.on('data', function (data) {
    self._videoStream.write(data);
  });

  this._ffmpeg.stderr.on('data', function (data) {
    console.error('ffmpeg error: ', data);
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


