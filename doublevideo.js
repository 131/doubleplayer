
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
    float vxx   = vx.x * ( 1.0 - xFactor) + xFactor;
    gl_Position = vec4((vx.x*2.0*xFactor-1.0)*imgFac + (1.0-imgFac)*(vxx*2.0-1.0)  , 1.0-vx.y*2.0, 0 , 1);
    tx          = vec2((vx.x*xFactor/2.0)*imgFac + (1.0-imgFac)*(vxx / 2.0 + 0.5) , vx.y);
  }
`;

var $n          = require('udom/element/create');
var requestAnimationFrame = require('udom/window/requestAnimationFrame');

class DoubleVideo {


  constructor(video_url, container) {

    var video = $n('video', {loop:true, autoplay:true});
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


    video.addEventListener("loadedmetadata", () => {

        if(ready){
          console.log('META DATA ALREADY LOADED !');
          return;
        }

        console.log("Loadedd metadata");

        ready = true;

        //video.play();
       this.video  = video;
       this.video.id = "Myvideo";
       this.video_width = video.videoWidth;
       this.video_height = video.videoHeight;

       var canvas = this.prepareCanvas();
       var gl = this.initWebGL(canvas);
       this.initShaders(gl);
       this.initBuffers(gl);
       this.gl = gl;
       this.timerCallback();
    });

    this.timerCallback = this.timerCallback.bind(this);

 //leave this to next tick
    requestAnimationFrame(function(){
      video.src = video_url + "#" + Math.random();
      //alert(video.src);
      video.play();
    });
  }

  initShaders(gl) {

    var fragmentShader = this.getShader(gl, shaderFs, gl.FRAGMENT_SHADER);
    var vertexShader = this.getShader(gl, shaderVs, gl.VERTEX_SHADER);


    this.videoShaderProgram = gl.createProgram();
    gl.attachShader(this.videoShaderProgram, vertexShader);
    gl.attachShader(this.videoShaderProgram, fragmentShader);
    gl.linkProgram(this.videoShaderProgram);


    if (!gl.getProgramParameter(this.videoShaderProgram, gl.LINK_STATUS))
      throw ("Unable to initialize the shader program: " + gl.getProgramInfoLog(  this.videoShaderProgram ));


    const vertShader = this.getShader(gl, 'void main(void){gl_FragColor=vec4(1,1,1,1);}', gl.FRAGMENT_SHADER);
    const fragShader = this.getShader(gl, 'attribute vec3 c;void main(void){gl_Position=vec4(c, 1.0);}', gl.VERTEX_SHADER);

    this.vertShader = gl.createProgram();

    gl.attachShader(this.vertShader, vertShader);
    gl.attachShader(this.vertShader, fragShader);
    gl.linkProgram(this.vertShader);
    
    if (!gl.getProgramParameter(this.vertShader, gl.LINK_STATUS)) throw "Unable to initialize the shader vertShader: " + gl.getProgramInfoLog(this.vertShader);
  }


  getShader(gl, theSource, type) {

    var shader = gl.createShader(type);

    gl.shaderSource(shader, theSource);


    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


  initBuffers(gl) {
    this.vx = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 1,1, 0,1]), gl.STATIC_DRAW);

    this.ix = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3]), gl.STATIC_DRAW);

    this.vertexBuf = gl.createBuffer();

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }


  initWebGL(canvas){
    var gl = canvas.getContext("experimental-webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    return gl;
  }

  prepareCanvas() {

    var canvas = $n('canvas', {width:this.video_width / 2, height:this.video_height});
    canvas.style.width = canvas.style.height = '100%';
    this.container.appendChild(canvas);

    this.delimiter = 0.5;
    var x = 0;
    var y = 0;
    var handelMouseMove = (e) => {
      x = e.clientX / document.body.offsetWidth;
      y = e.clientY / document.body.offsetHeight;
      this.delimiter = x
    }

    var handelTouchMove = (e) => {
      x = e.touches[0].clientX / document.body.offsetWidth;
      y = e.touches[0].clientY / document.body.offsetHeight;
      this.delimiter = x
    }

    document.addEventListener('mousemove', handelMouseMove, false);
    document.addEventListener('touchmove', handelTouchMove, false);

    
    this.releaseCanva = () => {
      var gl = this.gl;
      document.removeEventListener('mousemove', handelMouseMove);
      document.removeEventListener('touchmove', handelTouchMove);
      gl.deleteTexture(this.tex);
      gl.deleteBuffer(this.vx);
      gl.deleteBuffer(this.ix);
      gl.deleteBuffer(this.vertexBuf);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.video = null;
      //a.deleteProgram
      gl = null;
      if (this.requestId) {
        window.cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
     }
    }

    this.uTimeout = Math.random();
    window.globalTimeout = this.uTimeout;
    return canvas;
  }

  stop() {
    if(this.releaseCanva)
      this.releaseCanva();
  }


  timerCallback() {

    if(this.uTimeout != window.globalTimeout) {
      console.log("//kthxby");
      return;
    }

    this.computeFrame();
    this.requestId  = requestAnimationFrame(this.timerCallback);
  }

  computeFrame() {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.videoShaderProgram);

    this.vx_ptr = gl.getAttribLocation(this.videoShaderProgram, "vx");
    gl.enableVertexAttribArray(this.vx_ptr);
    gl.uniform1i(gl.getUniformLocation(this.videoShaderProgram, "sm"), 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video);
   

    var half = (this.video_width /2);
    var x = Math.max( 1, Math.min(half -1,   half * this.delimiter));

    var xPos = x/this.video_width*2;

    var xUniform = gl.getUniformLocation(this.videoShaderProgram, "xFactor");
    gl.uniform1f(xUniform, xPos);

    var xUniform = gl.getUniformLocation(this.videoShaderProgram, "imgFac");
    gl.uniform1f(xUniform, 0);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
    gl.vertexAttribPointer(this.vx_ptr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


    var xUniform = gl.getUniformLocation(this.videoShaderProgram, "xFactor");
    gl.uniform1f(xUniform, xPos);

    var xUniform = gl.getUniformLocation(this.videoShaderProgram, "imgFac");
    gl.uniform1f(xUniform, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
    gl.vertexAttribPointer(this.vx_ptr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(this.vertShader);

    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);

    var x = 2 * xPos - 1;
    var length = 0.01;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -length + x ,1,0.0,  -length + x,-1,0.0,  length + x,-1,0.0 , length + x,-1,0.0,  -length + x,1,0.0,  length + x,1,0.0 ]), gl.STATIC_DRAW);

    const coord = gl.getAttribLocation(this.vertShader, "c");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

  }
};





module.exports = DoubleVideo;
