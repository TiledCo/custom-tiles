const config = require('./config');
const open = require('open');

open('http://' + config.host);
// open('javascript:setTimeout(function(){window.location.href="http://' + config.host + '"},1000)');
