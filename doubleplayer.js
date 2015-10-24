"use strict";

var Class       = require('uclass');
var DoubleVideo = require('./doublevideo');


var DoublePlayer = {
  start : function(video_url, container) {
    return new DoubleVideo(video_url, container);
  }
};




module.exports = DoublePlayer;
