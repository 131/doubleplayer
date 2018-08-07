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

const $n          = require('udom/element/create');
const onRemove          = require('udom/element/onRemove');
const EventEmitter = require('eventemitter-co');
const requestAnimationFrame = require('udom/window/requestAnimationFrame');

class DoubleMedia extends EventEmitter {


  constructor(media, container) {
    super();
    let {type: media_type, url: media_url}  = media;

    this.container = container;
    this.container.innerHTML = "";

    console.log('Media src is : ', media_url);

    if(media_type == "video") {

      var video = $n('video', {loop:true, autoplay:true, src : ''});

      video.addEventListener("loadedmetadata", () => {
        if(video.ready){
          console.log('META DATA ALREADY LOADED !');
          return;
        }
        console.log("Loadedd metadata");

        video.ready = true;
        this.media_ready(video, video.videoWidth, video.videoHeight);
      });

      //leave this to next tick
      requestAnimationFrame(function(){
        video.src = media_url + "#" + Math.random();
        //alert(video.src);
        video.play();
      });
    }


    if(media_type == "image") {
      var img = $n('img', {src:media_url + "#" + Math.random(), crossOrigin : 'IVS'});

      img.addEventListener("load", () => {
        console.log("Loadedd metadata");
        this.media_ready(img, img.naturalWidth, img.naturalHeight);
      });

    }
    
  }

  pause() {
    this.media_dom[this.media_dom.paused?"play":"pause"]();

  }

  media_ready(dom, width, height) {
    this.emit("mediaLoaded");
    this.media_dom  = dom;

    this.media_width = width;
    this.media_height = height;

    var canvas = this.prepareCanvas();
    var gl = this.initWebGL(canvas);
    this.initShaders(gl);
    this.initBuffers(gl);
    this.gl = gl;

    this.timerCallback = this.timerCallback.bind(this);
    this.timerCallback();
  }

  initShaders(gl) {

    var fragmentShader = this.getShader(gl, shaderFs, gl.FRAGMENT_SHADER);
    var vertexShader = this.getShader(gl, shaderVs, gl.VERTEX_SHADER);


    this.mediaShaderProgram = gl.createProgram();
    gl.attachShader(this.mediaShaderProgram, vertexShader);
    gl.attachShader(this.mediaShaderProgram, fragmentShader);
    gl.linkProgram(this.mediaShaderProgram);


    if (!gl.getProgramParameter(this.mediaShaderProgram, gl.LINK_STATUS))
      throw ("Unable to initialize the shader program: " + gl.getProgramInfoLog(  this.mediaShaderProgram ));


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

    var canvas = $n('canvas', {width:this.media_width / 2, height:this.media_height});
    canvas.style.width = canvas.style.height = '100%';
    this.container.appendChild(canvas);


    this.delimiter = 0.5;
    var x = 0;
    var y = 0;
    var handelMouseMove = (e) => {
      x = e.clientX / document.body.offsetWidth;
      y = e.clientY / document.body.offsetHeight;
      this.delimiter = x;
      this.emit("cursor", x, y);
    }

    var handelTouchMove = (e) => {
      x = e.touches[0].clientX / document.body.offsetWidth;
      y = e.touches[0].clientY / document.body.offsetHeight;
      this.delimiter = x
      this.emit("cursor", x, y);
    }

    document.addEventListener('mousemove', handelMouseMove, false);
    document.addEventListener('touchmove', handelTouchMove, false);

    onRemove(canvas,  () => {
      console.log("Cleaning up everything");
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
      this.media_dom = null;
      //a.deleteProgram
      gl = null;
      if (this.requestId) {
        window.cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
     }
    });

    this.uTimeout = Math.random();
    window.globalTimeout = this.uTimeout;
    return canvas;
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
    gl.useProgram(this.mediaShaderProgram);

    this.vx_ptr = gl.getAttribLocation(this.mediaShaderProgram, "vx");
    gl.enableVertexAttribArray(this.vx_ptr);
    gl.uniform1i(gl.getUniformLocation(this.mediaShaderProgram, "sm"), 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.media_dom);
   

    var half = (this.media_width /2);
    var x = Math.max( 1, Math.min(half -1,   half * this.delimiter));

    var xPos = x/this.media_width*2;

    var xUniform = gl.getUniformLocation(this.mediaShaderProgram, "xFactor");
    gl.uniform1f(xUniform, xPos);

    var xUniform = gl.getUniformLocation(this.mediaShaderProgram, "imgFac");
    gl.uniform1f(xUniform, 0);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
    gl.vertexAttribPointer(this.vx_ptr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


    var xUniform = gl.getUniformLocation(this.mediaShaderProgram, "xFactor");
    gl.uniform1f(xUniform, xPos);

    var xUniform = gl.getUniformLocation(this.mediaShaderProgram, "imgFac");
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





module.exports = DoubleMedia;

