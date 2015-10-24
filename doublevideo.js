"use strict";

var Class       = require('uclass');


var $n = function(v, r) {
  var e = document.createElement(v);
  for(var i in r) e[i] = r[i];
  return e;
}


var DoubleVideo = new Class({
  Binds : ['prepareCanvas', 'timerCallback', 'computeFrame'],

  container:null,
  interval:null,

  initialize:function(video_url, container){

    var self = this, video = $n('video');//, {loop:true}
    console.log('Video src is : ', video_url);
    
    this.container = $(container);
    var videos = container[0].getElementsByTagName('video');
    
    if (videos[0]){
      videos[0].pause();
      videos[0].src = '';
    }
    video.src = '';
  
    this.container.empty();


    var ready = false;


    video.addEventListener("loadedmetadata", function(){
        if(ready){
          console.log('META DATA ALREADY LOADED !');
          return;
        }

        console.log("Loadedd metadata");

        ready = true;

        //video.play();
       self.video  = video;
       self.video.id = "Myvideo";
       //DoublePlayer.video.preload="auto";
       self.video_width = video.videoWidth;
       self.video_height = video.videoHeight;
       self.prepareCanvas();
    });
    
    video.addEventListener("error", function(error) {
      var errorLast = "An error occurred playing ";
      console.error('ERROR : ', error);

      /*video.pause();
     video.src = '';*/
                           
      
     
    }, true);



 //leave this to next tick
    requestAnimationFrame(function(){
      video.src = video_url + "#" + Math.random();
      //alert(video.src);
      video.play();
    });
  },

  prepareCanvas: function() {
    var self = this;

    self.video.addEventListener('ended', function(){
      console.log("LOOOPING");
      self.video.pause();
      self.video.currentTime=0;
      self.video.play();
     
    }, false);


    var tmp = $n('canvas', {width:self.video_width, height:self.video_height});
    self.canvas_buffer = tmp.getContext("2d");

    self.canvas = $n('canvas', {width:self.video_width / 2, height:self.video_height});
  

    $(self.canvas).css( { width : '100%', height:'100%'});

    self.container.append(self.canvas);

    self.canvas_ctx = self.canvas.getContext("2d");

    self.delimiter = 0.5;
    self.canvas.addEventListener('mousemove', function(e){
      var x = e.clientX; 
      x =  x / self.container.width();
      self.delimiter = x
    }, false);

    self.canvas.addEventListener('touchmove', function(e){
      var x = e.touches[0].clientX; 
      x = x / self.container.width();
      self.delimiter = x

    }, false);


    self.uTimeout = Math.random();
    window.globalTimeout = self.uTimeout;
    self.timerCallback();
  },


  timerCallback: function() {
    var self = this;

    if(self.uTimeout != window.globalTimeout) {
      console.log("//kthxby");
      return; 
    }

    self.computeFrame();

    return requestAnimationFrame(function () {
        self.timerCallback();
      });
  },

  computeFrame: function() {
    var self = this;

    self.canvas_buffer.drawImage(self.video, 0, 0, self.video_width, self.video_height);
    var half = (self.video_width /2),
        x = Math.max( 1, Math.min(half -1,   half * self.delimiter));


    var frame1 = self.canvas_buffer.getImageData(0, 0, x, self.video_height);
    var frame2 = self.canvas_buffer.getImageData(half + x , 0, half - x, self.video_height);

    self.canvas_ctx.putImageData(frame1, 0, 0);
    self.canvas_ctx.putImageData(frame2, x, 0);
    self.canvas_ctx.fillRect (x, 0, 2, self.video_height);
    self.canvas_ctx.fillStyle = "rgba(255,255,255, 1)";
    self.video.play();

    return;
  }
});



module.exports = DoubleVideo;
