var zetta = require('zetta');
var AutoScout = require('zetta-auto-scout');
var Camera = require('../camera_driver');

zetta()
  .use(Camera)
  .listen(3000);
