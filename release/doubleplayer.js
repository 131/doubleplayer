(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var DoubleVideo = require('./doublevideo');

var DoublePlayer = {
  start: function start(video_url, container) {
    return new DoubleVideo(video_url, container);
  }
};

module.exports = DoublePlayer;

},{"./doublevideo":2}],2:[function(require,module,exports){

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var shaderFs = '\n  precision mediump float;\n  uniform sampler2D sm;\n  varying vec2 tx;\n\n  void main(void) {\n    gl_FragColor=texture2D(sm,tx);\n  }\n';

var shaderVs = '\n  attribute vec2 vx;\n  varying vec2 tx;\n  uniform float xFactor;\n  uniform float imgFac;\n\n\n  void main(void) {\n    float vxx   = vx.x * ( 1.0 - xFactor) + xFactor;\n    gl_Position = vec4((vx.x*2.0*xFactor-1.0)*imgFac + (1.0-imgFac)*(vxx*2.0-1.0)  , 1.0-vx.y*2.0, 0 , 1);\n    tx          = vec2((vx.x*xFactor/2.0)*imgFac + (1.0-imgFac)*(vxx / 2.0 + 0.5) , vx.y);\n  }\n';

var $n = require('udom/element/create');
var requestAnimationFrame = require('udom/window/requestAnimationFrame');

var DoubleVideo = function () {
  function DoubleVideo(video_url, container) {
    var _this = this;

    _classCallCheck(this, DoubleVideo);

    var video = $n('video', { loop: true, autoplay: true });
    console.log('Video src is : ', video_url);

    this.container = container;
    var videos = container.getElementsByTagName('video');

    //pause current video (if any) before looping
    if (videos.length > 0) {
      videos[0].pause();
      videos[0].src = '';
    }
    video.src = '';

    this.container.innerHTML = "";

    var ready = false;

    video.addEventListener("loadedmetadata", function () {

      if (ready) {
        console.log('META DATA ALREADY LOADED !');
        return;
      }

      console.log("Loadedd metadata");

      ready = true;

      //video.play();
      _this.video = video;
      _this.video.id = "Myvideo";
      _this.video_width = video.videoWidth;
      _this.video_height = video.videoHeight;

      var canvas = _this.prepareCanvas();
      var gl = _this.initWebGL(canvas);
      _this.initShaders(gl);
      _this.initBuffers(gl);
      _this.gl = gl;
      _this.timerCallback();
    });

    this.timerCallback = this.timerCallback.bind(this);

    //leave this to next tick
    requestAnimationFrame(function () {
      video.src = video_url + "#" + Math.random();
      //alert(video.src);
      video.play();
    });
  }

  _createClass(DoubleVideo, [{
    key: 'initShaders',
    value: function initShaders(gl) {

      var fragmentShader = this.getShader(gl, shaderFs, gl.FRAGMENT_SHADER);
      var vertexShader = this.getShader(gl, shaderVs, gl.VERTEX_SHADER);

      this.shaderProgram = gl.createProgram();
      gl.attachShader(this.shaderProgram, vertexShader);
      gl.attachShader(this.shaderProgram, fragmentShader);
      gl.linkProgram(this.shaderProgram);

      if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) throw "Unable to initialize the shader program: " + gl.getProgramInfoLog(this.shaderProgram);

      gl.useProgram(this.shaderProgram);

      this.vx_ptr = gl.getAttribLocation(this.shaderProgram, "vx");
      gl.enableVertexAttribArray(this.vx_ptr);
      gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "sm"), 0);
    }
  }, {
    key: 'getShader',
    value: function getShader(gl, theSource, type) {

      var shader = gl.createShader(type);

      gl.shaderSource(shader, theSource);

      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
      }

      return shader;
    }
  }, {
    key: 'initBuffers',
    value: function initBuffers(gl) {

      // Create a buffer for the square's vertices.
      this.vx = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);

      this.ix = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

      this.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  }, {
    key: 'initWebGL',
    value: function initWebGL(canvas) {
      var gl = canvas.getContext("experimental-webgl");

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      return gl;
    }
  }, {
    key: 'prepareCanvas',
    value: function prepareCanvas() {
      var _this2 = this;

      var canvas = $n('canvas', { width: this.video_width / 2, height: this.video_height });

      canvas.style.width = canvas.style.height = '100%';

      this.container.appendChild(canvas);

      this.delimiter = 0.5;
      canvas.addEventListener('mousemove', function (e) {
        var x = e.clientX;
        x = x / _this2.container.offsetWidth;
        _this2.delimiter = x;
      }, false);

      canvas.addEventListener('touchstart', function (e) {
        //  nothing
      });

      canvas.addEventListener('touchmove', function (e) {
        var x = e.touches[0].clientX;
        x = x / _this2.container.offsetWidth;

        _this2.delimiter = x;
      }, false);

      this.uTimeout = Math.random();
      window.globalTimeout = this.uTimeout;
      return canvas;
    }
  }, {
    key: 'timerCallback',
    value: function timerCallback() {

      if (this.uTimeout != window.globalTimeout) {
        console.log("//kthxby");
        return;
      }

      this.computeFrame();
      requestAnimationFrame(this.timerCallback);
    }
  }, {
    key: 'computeFrame',
    value: function computeFrame() {
      var gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video);

      var half = this.video_width / 2;
      var x = Math.max(1, Math.min(half - 1, half * this.delimiter));

      var xPos = x / this.video_width * 2;

      var xUniform = gl.getUniformLocation(this.shaderProgram, "xFactor");
      gl.uniform1f(xUniform, xPos);

      var xUniform = gl.getUniformLocation(this.shaderProgram, "imgFac");
      gl.uniform1f(xUniform, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
      gl.vertexAttribPointer(this.vx_ptr, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      var xUniform = gl.getUniformLocation(this.shaderProgram, "xFactor");
      gl.uniform1f(xUniform, xPos);

      var xUniform = gl.getUniformLocation(this.shaderProgram, "imgFac");
      gl.uniform1f(xUniform, 1);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
      gl.vertexAttribPointer(this.vx_ptr, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }]);

  return DoubleVideo;
}();

;

module.exports = DoubleVideo;

},{"udom/element/create":3,"udom/window/requestAnimationFrame":6}],3:[function(require,module,exports){
"use strict";

var forIn = require('mout/object/forIn');


module.exports = function(tagname, attrs){
  var foo = document.createElement(tagname);
  forIn(attrs || {} , function(value, attrname) {
    foo[attrname] = value;
  });

  return foo;
}
},{"mout/object/forIn":4}],4:[function(require,module,exports){
var hasOwn = require('./hasOwn');

    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }


        if (_hasDontEnumBug) {
            var ctor = obj.constructor,
                isProto = !!ctor && obj === ctor.prototype;

            while (key = _dontEnums[i++]) {
                // For constructor, if it is a prototype object the constructor
                // is always non-enumerable unless defined otherwise (and
                // enumerated above).  For non-prototype objects, it will have
                // to be defined on this object, since it cannot be defined on
                // any prototype objects.
                //
                // For other [[DontEnum]] properties, check if the value is
                // different than Object prototype value.
                if (
                    (key !== 'constructor' ||
                        (!isProto && hasOwn(obj, key))) &&
                    obj[key] !== Object.prototype[key]
                ) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{"./hasOwn":5}],5:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],6:[function(require,module,exports){
"use strict";

module.exports = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

},{}],7:[function(require,module,exports){
'use strict';

window.DoublePlayer = require('..');

},{"..":1}]},{},[7]);
