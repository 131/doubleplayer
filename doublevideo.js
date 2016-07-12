
"use strict";

var shaderFs = `
precision mediump float;
uniform sampler2D sm;
varying vec2 tx;

void main(void) {
  gl_FragColor=texture2D(sm,tx);
}
`;

var shaderVs = `
attribute vec2 vx;
varying vec2 tx;
uniform float xFactor;
uniform float imgFac;


void main(void) {
  float vxx = vx.x * ( 1.0 - xFactor) + xFactor;
  gl_Position=vec4((vx.x*2.0*xFactor-1.0)*imgFac + (1.0-imgFac)*(vxx*2.0-1.0)  , 1.0-vx.y*2.0, 0 , 1);
  tx=vec2((vx.x*xFactor/2.0)*imgFac + (1.0-imgFac)*(vxx / 2.0 + 0.5) , vx.y);
}
`;


var Class       = require('uclass');
var $n          = require('udom/element/create');
var requestAnimationFrame = require('udom/window/requestAnimationFrame');
var errcnt = 0;
var videoready = true;

var DoubleVideo = new Class({
  Binds : ['prepareCanvas', 'timerCallback', 'computeFrame' , 'initWebGL' , 'initBuffers' , 'initShaders'],

  container:null,
  interval:null,

  initialize:function(video_url, container){

    var self = this, video = $n('video', {loop:true, autoplay:true});
    console.log('Video src is : ', video_url);

    this.container = container;
    var videos = container.getElementsByTagName('video');

      //pause current video (if any) before looping
    if (videos.length > 0){
      videos[0].pause();
      videos[0].src = '';
    }
    video.src = '';

    this.container.innerHTML = "";


    var ready = false;


    video.addEventListener("loadedmetadata", function(){

        video.setAttribute("playsinline", "");
    		video.setAttribute("webkit-playsinline", "");

        if(ready){
          console.log('META DATA ALREADY LOADED !');
          return;
        }

        console.log("Loadedd metadata");

        ready = true;

        //video.play();
       self.video  = video;
       self.video.id = "Myvideo";
       self.video_width = video.videoWidth;
       self.video_height = video.videoHeight;

       self.prepareCanvas();
       self.initWebGL();
       self.initShaders();
       self.initBuffers();
       self.timerCallback();


    });


 //leave this to next tick
    requestAnimationFrame(function(){
      video.src = video_url + "#" + Math.random();
      //alert(video.src);
      video.play();
    });
  },

  initShaders : function () {
    var self = this;
    var gl =  self.gl;


    var fragmentShader = this.getShader(gl, shaderFs, gl.FRAGMENT_SHADER);
    var vertexShader = this.getShader(gl, shaderVs, gl.VERTEX_SHADER);


    self.shaderProgram = gl.createProgram();
    gl.attachShader(self.shaderProgram, vertexShader);
    gl.attachShader(self.shaderProgram, fragmentShader);
    gl.linkProgram(self.shaderProgram);


    if (!gl.getProgramParameter(self.shaderProgram, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(  self.shaderProgram ));
    }

    gl.useProgram(self.shaderProgram);


    self.vx_ptr = gl.getAttribLocation(self.shaderProgram, "vx");
    gl.enableVertexAttribArray(self.vx_ptr);
    gl.uniform1i(gl.getUniformLocation(self.shaderProgram, "sm"), 0);

  },


  getShader :function(gl, theSource, type) {

    var shader = gl.createShader(type);

    gl.shaderSource(shader, theSource);


    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  },


  initBuffers: function() {

    // Create a buffer for the square's vertices.
    var gl =  this.gl;

    this.vx = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 1,1, 0,1]), gl.STATIC_DRAW);

    this.ix = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3]), gl.STATIC_DRAW);


  	this.tex = gl.createTexture();
  	gl.bindTexture(gl.TEXTURE_2D, this.tex);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  },


  initWebGL: function(){
    var self = this;
    self.gl = null;

    try {
      self.gl = self.canvas.getContext("experimental-webgl");
    }
    catch(e) {
    }
    // If we don't have a GL context, give up now
    if (!self.gl) {
      return alert("Unable to initialize WebGL. Your browser may not support it.");
    }


    if (self.gl) {
      self.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      self.gl.clearDepth(1.0);                 // Clear everything
      self.gl.enable(self.gl.DEPTH_TEST);           // Enable depth testing
      self.gl.depthFunc(self.gl.LEQUAL);            // Near things obscure far thingsablished.


    }
  },

  prepareCanvas: function() {
    var self = this;
    self.canvas = $n('canvas', {width:self.video_width / 2, height:self.video_height});

    self.canvas.style.width = self.canvas.style.height = '100%';

    self.container.appendChild(self.canvas);

    self.delimiter = 0.5;
    self.canvas.addEventListener('mousemove', function(e){
      var x = e.clientX;
      x =  x / self.container.offsetWidth;
      self.delimiter = x
    }, false);

    self.canvas.addEventListener('touchstart', function(e) {
      //  nothing
    });

    self.canvas.addEventListener('touchmove', function(e){
      var x = e.touches[0].clientX;
      x = x / self.container.offsetWidth;

      self.delimiter = x

    }, false);


    self.uTimeout = Math.random();
    window.globalTimeout = self.uTimeout;
  },


  timerCallback: function() {
    var self = this;

    if(self.uTimeout != window.globalTimeout) {
      console.log("//kthxby");
      return;
    }

    self.computeFrame();
    requestAnimationFrame(self.timerCallback);
  },

  computeFrame: function() {
    var self = this;
    var gl = self.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, self.tex);


      try
      {
        // upload the video frame
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video);
      }
      catch(e)
      {
        // log only the first few errors
        errcnt++;
        if (errcnt < 10)
          console.log(e, "color:red;");
        else if (errcnt == 10)
          console.log("...", "color:red;");
      }


    var half = (self.video_width /2);
    var x = Math.max( 1, Math.min(half -1,   half * self.delimiter));

    var xPos = x/self.video_width*2;

    var xUniform = gl.getUniformLocation(self.shaderProgram, "xFactor");
    gl.uniform1f(xUniform, xPos);

    var xUniform = gl.getUniformLocation(self.shaderProgram, "imgFac");
    gl.uniform1f(xUniform, 0);


    gl.bindBuffer(gl.ARRAY_BUFFER, self.vx);
    gl.vertexAttribPointer(self.vx_ptr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


    var xUniform = gl.getUniformLocation(self.shaderProgram, "xFactor");
    gl.uniform1f(xUniform, xPos);

    var xUniform = gl.getUniformLocation(self.shaderProgram, "imgFac");
    gl.uniform1f(xUniform, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, self.vx);
    gl.vertexAttribPointer(self.vx_ptr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);







    //var frame1 = self.canvas_buffer.getImageData(0, 0, x, self.video_height);
    //var frame2 = self.canvas_buffer.getImageData(half + x , 0, half - x, self.video_height);

    //self.canvas_ctx.putImageData(frame1, 0, 0);
    //self.canvas_ctx.putImageData(frame2, x, 0);
  //  self.canvas_ctx.fillRect (x, 0, 2, self.video_height);

  }

});



module.exports = DoubleVideo;
