var spawn = require('child_process').spawn;

var ffmpeg = spawn('ffmpeg', ['-v', '0', '-f', 'avfoundation', '-i', '0', '-s', '640x480', '-f', 'mpeg1video', '-b', '800k', '-r', '30', 'pipe:1']);

ffmpeg.stdout.on('data', function (data) {
});

ffmpeg.stderr.on('data', function (data) {
  console.error('ffmpeg error: ', data)
});

ffmpeg.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

