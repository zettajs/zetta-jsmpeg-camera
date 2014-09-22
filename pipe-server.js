var spawn = require('child_process').spawn;

var STREAM_SECRET = process.argv[2],
	STREAM_PORT = process.argv[3] || 8082,
	WEBSOCKET_PORT = process.argv[4] || 8084,
	STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

var width = 640;
var height = 480;

// Websocket Server
var socketServer = new (require('ws').Server)({port: WEBSOCKET_PORT});
socketServer.on('connection', function(socket) {
  // Send magic bytes and video size to the newly connected socket
  // struct { char magic[4]; unsigned short width, height;}
  var streamHeader = new Buffer(8);
  streamHeader.write(STREAM_MAGIC_BYTES);
  streamHeader.writeUInt16BE(width, 4);
  streamHeader.writeUInt16BE(height, 6);
  socket.send(streamHeader, {binary:true});

  console.log( 'New WebSocket Connection ('+socketServer.clients.length+' total)' );
  
  socket.on('close', function(code, message){
    console.log( 'Disconnected WebSocket ('+socketServer.clients.length+' total)' );
  });
});

socketServer.broadcast = function(data, opts) {
  for( var i in this.clients ) {
    if (this.clients[i].readyState == 1) {
      this.clients[i].send(data, opts);
    }
    else {
      console.log( 'Error: Client ('+i+') not connected.' );
    }
  }
};



var ffmpeg = spawn('ffmpeg', ['-v', '0', '-f', 'avfoundation', '-i', '0', '-s', '640x480', '-f', 'mpeg1video', '-b', '800k', '-r', '30', 'pipe:1']);

ffmpeg.stdout.on('data', function (data) {
  socketServer.broadcast(data, {binary: true});
});

ffmpeg.stderr.on('data', function (data) {
  console.error('ffmpeg error: ', data)
});

ffmpeg.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
