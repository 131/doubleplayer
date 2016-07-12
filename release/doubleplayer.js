(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Class = require('uclass');
var DoubleVideo = require('./doublevideo');

var DoublePlayer = {
  start: function start(video_url, container) {
    return new DoubleVideo(video_url, container);
  }
};

module.exports = DoublePlayer;

},{"./doublevideo":2,"uclass":15}],2:[function(require,module,exports){

"use strict";

var shaderFs = '\nprecision mediump float;\nuniform sampler2D sm;\nvarying vec2 tx;\n\nvoid main(void) {\n  gl_FragColor=texture2D(sm,tx);\n}\n';

var shaderVs = '\nattribute vec2 vx;\nvarying vec2 tx;\nuniform float xFactor;\nuniform float imgFac;\n\n\nvoid main(void) {\n  float vxx = vx.x * ( 1.0 - xFactor) + xFactor;\n  gl_Position=vec4((vx.x*2.0*xFactor-1.0)*imgFac + (1.0-imgFac)*(vxx*2.0-1.0)  , 1.0-vx.y*2.0, 0 , 1);\n  tx=vec2((vx.x*xFactor/2.0)*imgFac + (1.0-imgFac)*(vxx / 2.0 + 0.5) , vx.y);\n}\n';

var Class = require('uclass');
var $n = require('udom/element/create');
var requestAnimationFrame = require('udom/window/requestAnimationFrame');
var errcnt = 0;
var videoready = true;

var DoubleVideo = new Class({
    Binds: ['prepareCanvas', 'timerCallback', 'computeFrame', 'initWebGL', 'initBuffers', 'initShaders'],

    container: null,
    interval: null,

    initialize: function initialize(video_url, container) {

        var self = this,
            video = $n('video', { loop: true, autoplay: true });
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

            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");

            if (ready) {
                console.log('META DATA ALREADY LOADED !');
                return;
            }

            console.log("Loadedd metadata");

            ready = true;

            //video.play();
            self.video = video;
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
        requestAnimationFrame(function () {
            video.src = video_url + "#" + Math.random();
            //alert(video.src);
            video.play();
        });
    },

    initShaders: function initShaders() {
        var self = this;
        var gl = self.gl;

        var fragmentShader = this.getShader(gl, shaderFs, gl.FRAGMENT_SHADER);
        var vertexShader = this.getShader(gl, shaderVs, gl.VERTEX_SHADER);

        self.shaderProgram = gl.createProgram();
        gl.attachShader(self.shaderProgram, vertexShader);
        gl.attachShader(self.shaderProgram, fragmentShader);
        gl.linkProgram(self.shaderProgram);

        if (!gl.getProgramParameter(self.shaderProgram, gl.LINK_STATUS)) {
            alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(self.shaderProgram));
        }

        gl.useProgram(self.shaderProgram);

        self.vx_ptr = gl.getAttribLocation(self.shaderProgram, "vx");
        gl.enableVertexAttribArray(self.vx_ptr);
        gl.uniform1i(gl.getUniformLocation(self.shaderProgram, "sm"), 0);
    },

    getShader: function getShader(gl, theSource, type) {

        var shader = gl.createShader(type);

        gl.shaderSource(shader, theSource);

        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    },

    initBuffers: function initBuffers() {

        // Create a buffer for the square's vertices.
        var gl = this.gl;

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
    },

    initWebGL: function initWebGL() {
        var self = this;
        self.gl = null;

        try {
            self.gl = self.canvas.getContext("experimental-webgl");
        } catch (e) {}
        // If we don't have a GL context, give up now
        if (!self.gl) {
            return alert("Unable to initialize WebGL. Your browser may not support it.");
        }

        if (self.gl) {
            self.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
            self.gl.clearDepth(1.0); // Clear everything
            self.gl.enable(self.gl.DEPTH_TEST); // Enable depth testing
            self.gl.depthFunc(self.gl.LEQUAL); // Near things obscure far thingsablished.
        }
    },

    prepareCanvas: function prepareCanvas() {
        var self = this;
        self.canvas = $n('canvas', { width: self.video_width / 2, height: self.video_height });

        self.canvas.style.width = self.canvas.style.height = '100%';

        self.container.appendChild(self.canvas);

        self.delimiter = 0.5;
        self.canvas.addEventListener('mousemove', function (e) {
            var x = e.clientX;
            x = x / self.container.offsetWidth;
            self.delimiter = x;
        }, false);

        self.canvas.addEventListener('touchstart', function (e) {
            //  nothing
        });

        self.canvas.addEventListener('touchmove', function (e) {
            var x = e.touches[0].clientX;
            x = x / self.container.offsetWidth;

            self.delimiter = x;
        }, false);

        self.uTimeout = Math.random();
        window.globalTimeout = self.uTimeout;
    },

    timerCallback: function timerCallback() {
        var self = this;

        if (self.uTimeout != window.globalTimeout) {
            console.log("//kthxby");
            return;
        }

        self.computeFrame();
        requestAnimationFrame(self.timerCallback);
    },

    computeFrame: function computeFrame() {
        var self = this;
        var gl = self.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, self.tex);

        try {
            // upload the video frame
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video);
        } catch (e) {
            // log only the first few errors
            errcnt++;
            if (errcnt < 10) console.log(e, "color:red;");else if (errcnt == 10) console.log("...", "color:red;");
        }

        var half = self.video_width / 2;
        var x = Math.max(1, Math.min(half - 1, half * self.delimiter));

        var xPos = x / self.video_width * 2;

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

},{"uclass":15,"udom/element/create":16,"udom/window/requestAnimationFrame":17}],3:[function(require,module,exports){
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');
var mixIn = require('../object/mixIn');

    /**
     * Clone native types.
     */
    function clone(val){
        switch (kindOf(val)) {
            case 'Object':
                return cloneObject(val);
            case 'Array':
                return cloneArray(val);
            case 'RegExp':
                return cloneRegExp(val);
            case 'Date':
                return cloneDate(val);
            default:
                return val;
        }
    }

    function cloneObject(source) {
        if (isPlainObject(source)) {
            return mixIn({}, source);
        } else {
            return source;
        }
    }

    function cloneRegExp(r) {
        var flags = '';
        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignoreCase ? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(+date);
    }

    function cloneArray(arr) {
        return arr.slice();
    }

    module.exports = clone;



},{"../object/mixIn":14,"./isPlainObject":8,"./kindOf":9}],4:[function(require,module,exports){
var mixIn = require('../object/mixIn');

    /**
     * Create Object using prototypal inheritance and setting custom properties.
     * - Mix between Douglas Crockford Prototypal Inheritance <http://javascript.crockford.com/prototypal.html> and the EcmaScript 5 `Object.create()` method.
     * @param {object} parent    Parent Object.
     * @param {object} [props] Object properties.
     * @return {object} Created object.
     */
    function createObject(parent, props){
        function F(){}
        F.prototype = parent;
        return mixIn(new F(), props);

    }
    module.exports = createObject;



},{"../object/mixIn":14}],5:[function(require,module,exports){
var clone = require('./clone');
var forOwn = require('../object/forOwn');
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');

    /**
     * Recursively clone native types.
     */
    function deepClone(val, instanceClone) {
        switch ( kindOf(val) ) {
            case 'Object':
                return cloneObject(val, instanceClone);
            case 'Array':
                return cloneArray(val, instanceClone);
            default:
                return clone(val);
        }
    }

    function cloneObject(source, instanceClone) {
        if (isPlainObject(source)) {
            var out = {};
            forOwn(source, function(val, key) {
                this[key] = deepClone(val, instanceClone);
            }, out);
            return out;
        } else if (instanceClone) {
            return instanceClone(source);
        } else {
            return source;
        }
    }

    function cloneArray(arr, instanceClone) {
        var out = [],
            i = -1,
            n = arr.length,
            val;
        while (++i < n) {
            out[i] = deepClone(arr[i], instanceClone);
        }
        return out;
    }

    module.exports = deepClone;




},{"../object/forOwn":11,"./clone":3,"./isPlainObject":8,"./kindOf":9}],6:[function(require,module,exports){
var kindOf = require('./kindOf');
    /**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    module.exports = isKind;


},{"./kindOf":9}],7:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    module.exports = isObject;


},{"./isKind":6}],8:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value && typeof value === 'object' &&
            value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],9:[function(require,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],10:[function(require,module,exports){
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



},{"./hasOwn":12}],11:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":10,"./hasOwn":12}],12:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],13:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var deepClone = require('../lang/deepClone');
var isObject = require('../lang/isObject');

    /**
     * Deep merge objects.
     */
    function merge() {
        var i = 1,
            key, val, obj, target;

        // make sure we don't modify source element and it's properties
        // objects are passed by reference
        target = deepClone( arguments[0] );

        while (obj = arguments[i++]) {
            for (key in obj) {
                if ( ! hasOwn(obj, key) ) {
                    continue;
                }

                val = obj[key];

                if ( isObject(val) && isObject(target[key]) ){
                    // inception, deep merge objects
                    target[key] = merge(target[key], val);
                } else {
                    // make sure arrays, regexp, date, objects are cloned
                    target[key] = deepClone(val);
                }

            }
        }

        return target;
    }

    module.exports = merge;



},{"../lang/deepClone":5,"../lang/isObject":7,"./hasOwn":12}],14:[function(require,module,exports){
var forOwn = require('./forOwn');

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    module.exports = mixIn;


},{"./forOwn":11}],15:[function(require,module,exports){
"use strict";

var hasOwn = require("mout/object/hasOwn");
var create = require("mout/lang/createObject");
var merge  = require("mout/object/merge");
var kindOf = require("mout/lang/kindOf");
var mixIn  = require("mout/object/mixIn");


//from http://javascript.crockford.com/prototypal.html

var verbs = /^Implements|Extends|Binds$/

var implement = function(obj){
  for(var key in obj) {
    if(key.match(verbs)) continue;
    if((typeof obj[key] == 'function') && obj[key].$static)
      this[key] = obj[key];
    else
      this.prototype[key] = obj[key];
  }
  return this;
}



var uClass = function(proto){

  if(kindOf(proto) === "Function") proto = {initialize: proto};

  var superprime = proto.Extends;

  var constructor = (hasOwn(proto, "initialize")) ? proto.initialize : superprime ? superprime : function(){};



  var out = function() {
    var self = this;
      //autobinding takes place here
    if(proto.Binds) proto.Binds.forEach(function(f){
      var original = self[f];
      if(original)
        self[f] = mixIn(self[f].bind(self), original);
    });

      //clone non function/static properties to current instance
    for(var key in out.prototype) {
      var v = out.prototype[key], t = kindOf(v);

      if(key.match(verbs) || t === "Function") continue;
      if(t == "Object")
        self[key] = merge({}, self[key]); //create(null, self[key]);
      else if(t == "Array")
        self[key] = v.slice(); //clone ??
      else
        self[key] = v;
    }

    if(proto.Implements)
      proto.Implements.forEach(function(Mixin){
        Mixin.call(self);
      });




    constructor.apply(this, arguments);
  }

  out.implement = implement;


  if (superprime) {
    // inherit from superprime
      var superproto = superprime.prototype;
      if(superproto.Binds)
        proto.Binds = (proto.Binds || []).concat(superproto.Binds);

      if(superproto.Implements)
        proto.Implements = (proto.Implements || []).concat(superproto.Implements);

      var cproto = out.prototype = create(superproto);
      // setting constructor.parent to superprime.prototype
      // because it's the shortest possible absolute reference
      out.parent = superproto;
      cproto.constructor = out

  }


 if(proto.Implements) {
    if (kindOf(proto.Implements) !== "Array")
      proto.Implements = [proto.Implements];
    proto.Implements.forEach(function(Mixin){
      out.implement(Mixin.prototype);
    });
  }

  out.implement(proto);
  if(proto.Binds)
     out.prototype.Binds = proto.Binds;
  if(proto.Implements)
     out.prototype.Implements = proto.Implements;

  return out;
};



module.exports = uClass;
},{"mout/lang/createObject":4,"mout/lang/kindOf":9,"mout/object/hasOwn":12,"mout/object/merge":13,"mout/object/mixIn":14}],16:[function(require,module,exports){
"use strict";

var forIn = require('mout/object/forIn');


module.exports = function(tagname, attrs){
  var foo = document.createElement(tagname);
  forIn(attrs || {} , function(value, attrname) {
    foo[attrname] = value;
  });

  return foo;
}
},{"mout/object/forIn":10}],17:[function(require,module,exports){
"use strict";

module.exports = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

},{}],18:[function(require,module,exports){
'use strict';

window.DoublePlayer = require('..');

},{"..":1}]},{},[18]);
