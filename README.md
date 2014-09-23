# Video Streaming through Zetta with jsmpeg and ffmpeg

Example of streaming mpeg1 video data through [Zetta's](http://zettajs.org) binary streams using [ffmpeg](https://www.ffmpeg.org/)
to capture the video from the servers connected camera. Uses [jsmpeg](https://github.com/phoboslab/jsmpeg) on the browsers
side to render the websocket video stream to a html5 canvas.

## Installation

1. Install the npm module to your Zetta server.

    `npm install zetta-jsmpeg-camera`

2. Install ffmpeg, https://www.ffmpeg.org/download.html


## Usage

```js

var zetta = require('zetta');
var Camera = require('zetta-jsmpeg-camera');

zetta()
  .use(Camera)
  .listen(3000, function() {

  });

```

1. Start your Zetta server, you should see a camera be discovered. Go to the [Zetta Browser](browser.zettajs.io)
and input http://localhost:3000/ in the url for the Zetta browser.

2. Locate the camera device and navigate to the api response, find the link titled
`video`. Copy the `href` property on it, should look something like `ws://localhost:3000/servers/d6b9dc4e-ca67-498e-b04e-99abaec0746c/events?topic=camera%2Fa7c5d8f9-e9bd-4dc8-b097-eb0c43e4b029%2Fvideo`.

3. Call the start transition on the camera.

4. Navigate to http://video-viewer.herokuapp.com, and input that in the `Websocket URL` box and submit. You should
see yourself on video.


## Code for browser app

http://github.com/AdamMagaluk/jsmpeg-video-viewer
