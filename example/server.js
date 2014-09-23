var zetta = require('zetta');
var AutoScout = require('zetta-auto-scout');
var Camera = require('../camera_driver');

zetta()
  .use(Camera)
  .link('http://adams-test2.herokuapp.com')
  .listen(3000);
