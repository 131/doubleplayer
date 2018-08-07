"use strict";

var DoubleVideo = require('./doublevideo');


var DoublePlayer = {
  start : function(video_url, container) {
    if(DoublePlayer.player)
      DoublePlayer.player.stop();
    DoublePlayer.player = new DoubleVideo(video_url, container);
  }
};




module.exports = DoublePlayer;
