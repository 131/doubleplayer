(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

window.DoublePlayer = require('./');
window.BlendHelper = require('./helper');

},{"./":3,"./helper":4}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var shaderFs = '\n\nprecision mediump float;\nuniform sampler2D sm;\nvarying vec2 tx;\nuniform int  mode;\nuniform vec3 shaderBlend;\nuniform float shaderOpacity;\nuniform int blendPosition;\n\nfloat blendAdd(float base, float blend) {\n\treturn min(base+blend,1.0);\n}\n\nvec3 blendAdd(vec3 base, vec3 blend) {\n\treturn min(base+blend,vec3(1.0));\n}\n\nvec3 blendAdd(vec3 base, vec3 blend, float opacity) {\n\treturn (blendAdd(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendAverage(vec3 base, vec3 blend) {\n\treturn (base+blend)/2.0;\n}\n\nvec3 blendAverage(vec3 base, vec3 blend, float opacity) {\n\treturn (blendAverage(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendColorBurn(float base, float blend) {\n\treturn (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend) {\n\treturn vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendColorDodge(float base, float blend) {\n\treturn (blend==1.0)?blend:min(base/(1.0-blend),1.0);\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend) {\n\treturn vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendDarken(float base, float blend) {\n\treturn min(blend,base);\n}\n\nvec3 blendDarken(vec3 base, vec3 blend) {\n\treturn vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));\n}\n\nvec3 blendDarken(vec3 base, vec3 blend, float opacity) {\n\treturn (blendDarken(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendDifference(vec3 base, vec3 blend) {\n\treturn abs(base-blend);\n}\n\nvec3 blendDifference(vec3 base, vec3 blend, float opacity) {\n\treturn (blendDifference(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendExclusion(vec3 base, vec3 blend) {\n\treturn base+blend-2.0*base*blend;\n}\n\nvec3 blendExclusion(vec3 base, vec3 blend, float opacity) {\n\treturn (blendExclusion(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendReflect(float base, float blend) {\n\treturn (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);\n}\n\nvec3 blendReflect(vec3 base, vec3 blend) {\n\treturn vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));\n}\n\nvec3 blendReflect(vec3 base, vec3 blend, float opacity) {\n\treturn (blendReflect(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendGlow(vec3 base, vec3 blend) {\n\treturn blendReflect(blend,base);\n}\n\nvec3 blendGlow(vec3 base, vec3 blend, float opacity) {\n\treturn (blendGlow(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendOverlay(float base, float blend) {\n\treturn base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend) {\n\treturn vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend, float opacity) {\n\treturn (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendHardLight(vec3 base, vec3 blend) {\n\treturn blendOverlay(blend,base);\n}\n\nvec3 blendHardLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendVividLight(float base, float blend) {\n\treturn (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend) {\n\treturn vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendHardMix(float base, float blend) {\n\treturn (blendVividLight(base,blend)<0.5)?0.0:1.0;\n}\n\nvec3 blendHardMix(vec3 base, vec3 blend) {\n\treturn vec3(blendHardMix(base.r,blend.r),blendHardMix(base.g,blend.g),blendHardMix(base.b,blend.b));\n}\n\nvec3 blendHardMix(vec3 base, vec3 blend, float opacity) {\n\treturn (blendHardMix(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLighten(float base, float blend) {\n\treturn max(blend,base);\n}\n\nvec3 blendLighten(vec3 base, vec3 blend) {\n\treturn vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));\n}\n\nvec3 blendLighten(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLighten(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLinearBurn(float base, float blend) {\n\t// Note : Same implementation as BlendSubtractf\n\treturn max(base+blend-1.0,0.0);\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendSubtract\n\treturn max(base+blend-vec3(1.0),vec3(0.0));\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLinearDodge(float base, float blend) {\n\t// Note : Same implementation as BlendAddf\n\treturn min(base+blend,1.0);\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendAdd\n\treturn min(base+blend,vec3(1.0));\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLinearLight(float base, float blend) {\n\treturn blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend) {\n\treturn vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendMultiply(vec3 base, vec3 blend) {\n\treturn base*blend;\n}\n\nvec3 blendMultiply(vec3 base, vec3 blend, float opacity) {\n\treturn (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendNegation(vec3 base, vec3 blend) {\n\treturn vec3(1.0)-abs(vec3(1.0)-base-blend);\n}\n\nvec3 blendNegation(vec3 base, vec3 blend, float opacity) {\n\treturn (blendNegation(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendNormal(vec3 base, vec3 blend) {\n\treturn blend;\n}\n\nvec3 blendNormal(vec3 base, vec3 blend, float opacity) {\n\treturn (blendNormal(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendPhoenix(vec3 base, vec3 blend) {\n\treturn min(base,blend)-max(base,blend)+vec3(1.0);\n}\n\nvec3 blendPhoenix(vec3 base, vec3 blend, float opacity) {\n\treturn (blendPhoenix(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendPinLight(float base, float blend) {\n\treturn (blend<0.5)?blendDarken(base,(2.0*blend)):blendLighten(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendPinLight(vec3 base, vec3 blend) {\n\treturn vec3(blendPinLight(base.r,blend.r),blendPinLight(base.g,blend.g),blendPinLight(base.b,blend.b));\n}\n\nvec3 blendPinLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendPinLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendScreen(float base, float blend) {\n\treturn 1.0-((1.0-base)*(1.0-blend));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend) {\n\treturn vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend, float opacity) {\n\treturn (blendScreen(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendSoftLight(float base, float blend) {\n\treturn (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend) {\n\treturn vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendSubtract(float base, float blend) {\n\treturn max(base+blend-1.0,0.0);\n}\n\nvec3 blendSubtract(vec3 base, vec3 blend) {\n\treturn max(base+blend-vec3(1.0),vec3(0.0));\n}\n\nvec3 blendSubtract(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSubtract(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat HueToRGB(float f1, float f2, float hue)\n{\n\tif (hue < 0.0)\n\t\thue += 1.0;\n\telse if (hue > 1.0)\n\t\thue -= 1.0;\n\tfloat res;\n\tif ((6.0 * hue) < 1.0)\n\t\tres = f1 + (f2 - f1) * 6.0 * hue;\n\telse if ((2.0 * hue) < 1.0)\n\t\tres = f2;\n\telse if ((3.0 * hue) < 2.0)\n\t\tres = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;\n\telse\n\t\tres = f1;\n\treturn res;\n}\n\nvec3 HSLToRGB(vec3 hsl)\n{\n\tvec3 rgb;\n\t\n\tif (hsl.y == 0.0)\n\t\trgb = vec3(hsl.z); // Luminance\n\telse\n\t{\n\t\tfloat f2;\n\t\t\n\t\tif (hsl.z < 0.5)\n\t\t\tf2 = hsl.z * (1.0 + hsl.y);\n\t\telse\n\t\t\tf2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);\n\t\t\t\n\t\tfloat f1 = 2.0 * hsl.z - f2;\n\t\t\n\t\trgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));\n\t\trgb.g = HueToRGB(f1, f2, hsl.x);\n\t\trgb.b= HueToRGB(f1, f2, hsl.x - (1.0/3.0));\n\t}\n\t\n\treturn rgb;\n}\n\nvec3 RGBToHSL(vec3 color)\n{\n\tvec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)\n\t\n\tfloat fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB\n\tfloat fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB\n\tfloat delta = fmax - fmin;             //Delta RGB value\n\n\thsl.z = (fmax + fmin) / 2.0; // Luminance\n\n\tif (delta == 0.0)\t\t//This is a gray, no chroma...\n\t{\n\t\thsl.x = 0.0;\t// Hue\n\t\thsl.y = 0.0;\t// Saturation\n\t}\n\telse                                    //Chromatic data...\n\t{\n\t\tif (hsl.z < 0.5)\n\t\t\thsl.y = delta / (fmax + fmin); // Saturation\n\t\telse\n\t\t\thsl.y = delta / (2.0 - fmax - fmin); // Saturation\n\t\t\n\t\tfloat deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;\n\t\tfloat deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;\n\t\tfloat deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;\n\n\t\tif (color.r == fmax )\n\t\t\thsl.x = deltaB - deltaG; // Hue\n\t\telse if (color.g == fmax)\n\t\t\thsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue\n\t\telse if (color.b == fmax)\n\t\t\thsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue\n\n\t\tif (hsl.x < 0.0)\n\t\t\thsl.x += 1.0; // Hue\n\t\telse if (hsl.x > 1.0)\n\t\t\thsl.x -= 1.0; // Hue\n\t}\n\n\treturn hsl;\n}\n\n// Hue Blend mode creates the result color by combining the luminance and saturation of the base color with the hue of the blend color.\nvec3 BlendHue(vec3 base, vec3 blend)\n{\n\tvec3 baseHSL = RGBToHSL(base);\n\treturn HSLToRGB(vec3(RGBToHSL(blend).r, baseHSL.g, baseHSL.b));\n}\n\nvec3 BlendHue(vec3 base, vec3 blend, float opacity) {\n\treturn (BlendHue(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Saturation Blend mode creates the result color by combining the luminance and hue of the base color with the saturation of the blend color.\nvec3 BlendSaturation(vec3 base, vec3 blend)\n{\n\tvec3 baseHSL = RGBToHSL(base);\n\treturn HSLToRGB(vec3(baseHSL.r, RGBToHSL(blend).g, baseHSL.b));\n}\n\nvec3 BlendSaturation(vec3 base, vec3 blend, float opacity) {\n\treturn (BlendSaturation(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Color Mode keeps the brightness of the base color and applies both the hue and saturation of the blend color.\nvec3 BlendColor(vec3 base, vec3 blend)\n{\n\tvec3 blendHSL = RGBToHSL(blend);\n\treturn HSLToRGB(vec3(blendHSL.r, blendHSL.g, RGBToHSL(base).b));\n}\n\nvec3 BlendColor(vec3 base, vec3 blend, float opacity) {\n\treturn (BlendColor(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Luminosity Blend mode creates the result color by combining the hue and saturation of the base color with the luminance of the blend color.\nvec3 BlendLuminosity(vec3 base, vec3 blend)\n{\n\tvec3 baseHSL = RGBToHSL(base);\n\treturn HSLToRGB(vec3(baseHSL.r, baseHSL.g, RGBToHSL(blend).b));\n}\n\nvec3 BlendLuminosity(vec3 base, vec3 blend, float opacity) {\n\treturn (BlendLuminosity(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendFunc(int mode, vec3 base, vec3 blend, float opacity) {\n    vec3 returnedValue = base;\n    if(mode == 1) {\n        returnedValue = blendAdd(base, blend, opacity);\n\t} if(mode == 2) {\n      returnedValue = blendAverage(base, blend, opacity);\n    } if(mode == 3) {\n        returnedValue = blendColorBurn(base, blend, opacity);\n    } if(mode == 4) {\n        returnedValue = blendColorDodge(base, blend, opacity);\n    } if(mode == 5) {\n        returnedValue = blendDarken(base, blend, opacity);\n    } if(mode == 6) {\n        returnedValue = blendDifference(base, blend, opacity);\n    } if(mode == 7) {\n        returnedValue = blendExclusion(base, blend, opacity);\n    } if(mode == 8) {\n        returnedValue = blendGlow(base, blend, opacity);\n    } if(mode == 9) {\n        returnedValue = blendHardLight(base, blend, opacity);\n    } if(mode == 10) {\n        returnedValue = blendHardMix(base, blend, opacity);\n    } if(mode == 11) {\n        returnedValue = blendLighten(base, blend, opacity);\n    } if(mode == 12) {\n        returnedValue = blendLinearBurn(base, blend, opacity);\n    } if(mode == 13) {\n        returnedValue = blendLinearDodge(base, blend, opacity);\n    } if(mode == 14) {\n        returnedValue = blendLinearLight(base, blend, opacity);\n    } if(mode == 15) {\n        returnedValue = blendMultiply(base, blend, opacity);\n    } if(mode == 16) {\n        returnedValue = blendNegation(base, blend, opacity);\n    } if(mode == 17) {\n        returnedValue = blendNormal(base, blend, opacity);\n    } if(mode == 18) {\n        returnedValue = blendOverlay(base, blend, opacity);\n    }  if(mode == 19) {\n        returnedValue = blendPhoenix(base, blend, opacity);\n    }  if(mode == 20) {\n        returnedValue = blendPinLight(base, blend, opacity);\n    }  if(mode == 21) {\n        returnedValue = blendReflect(base, blend, opacity);\n    }  if(mode == 22) {\n        returnedValue = blendScreen(base, blend, opacity);\n    } if(mode == 23) {\n        returnedValue = blendSoftLight(base, blend, opacity);\n    } if(mode == 24) {\n        returnedValue = blendSubtract(base, blend, opacity);\n    } if(mode == 25) {\n        returnedValue = blendVividLight(base, blend, opacity);\n    } if(mode == 26) {\n        returnedValue = BlendHue(base, blend, opacity);\n    } if(mode == 27) {\n        returnedValue = BlendSaturation(base, blend, opacity);\n    } if(mode == 28) {\n        returnedValue = BlendColor(base, blend, opacity);\n    } if(mode == 29) {\n        returnedValue = BlendLuminosity(base, blend, opacity);\n    }\n\treturn returnedValue;\n}\n\nvoid main(void) {\n    vec4 test = texture2D(sm,tx);\n    vec3 color = blendFunc(mode, test.rgb, shaderBlend, shaderOpacity);\n\n    if(blendPosition == 0) {\n      gl_FragColor = test;\n    } if(blendPosition == 3) {\n      gl_FragColor = vec4(color, 1.0);\n    } if(blendPosition == 2) {\n      if((0.5 - tx.x) < 0.0) {\n        gl_FragColor = vec4(color, 1.0);;\n      } else {\n          gl_FragColor = test;\n      }\n    } if(blendPosition == 1) {\n      if((0.5 - tx.x) > 0.0) {\n        gl_FragColor = vec4(color, 1.0);;\n      } else {\n          gl_FragColor = test;\n      }\n    }\n}\n';

var shaderVs = '\n  attribute vec2 vx;\n  varying   vec2 tx;\n  uniform float xFactor;\n  uniform float imgFac;\n\n\n  void main(void) {\n    float vxx   = vx.x * ( 1.0 - xFactor) + xFactor;\n    gl_Position = vec4((vx.x * 2.0* xFactor - 1.0) * imgFac + (1.0 - imgFac) * (vxx *2.0 - 1.0)  , 1.0 - vx.y * 2.0, 0, 1);\n    tx          = vec2((vx.x*xFactor/2.0)*imgFac + (1.0-imgFac)*(vxx / 2.0 + 0.5) , vx.y);\n  }\n';

var $n = require('udom/element/create');
var onRemove = require('udom/element/onRemove');
var EventEmitter = require('eventemitter-co');
var requestAnimationFrame = require('udom/window/requestAnimationFrame');

var DoubleMedia = function (_EventEmitter) {
  _inherits(DoubleMedia, _EventEmitter);

  function DoubleMedia(media, container, blendColor, blendOpacity, blendMode, blendPosition) {
    _classCallCheck(this, DoubleMedia);

    var _this = _possibleConstructorReturn(this, (DoubleMedia.__proto__ || Object.getPrototypeOf(DoubleMedia)).call(this));

    var media_type = media.type,
        media_url = media.url;


    _this.container = container;
    _this.container.innerHTML = "";

    console.log('Media src is : ', media_url);

    if (media_type == "video") {

      var video = $n('video', { loop: true, autoplay: true, src: '' });

      video.addEventListener("loadedmetadata", function () {
        if (video.ready) {
          console.log('META DATA ALREADY LOADED !');
          return;
        }
        console.log("Loadedd metadata");

        video.ready = true;
        _this.media_ready(video, video.videoWidth, video.videoHeight);
      });

      //leave this to next tick
      requestAnimationFrame(function () {
        video.src = media_url + "#" + Math.random();
        //alert(video.src);
        video.play();
      });
    }

    _this.blendColor = blendColor || [1, 1, 1];
    _this.blendOpacity = blendOpacity || 0;
    _this.blendMode = blendMode || 0;
    _this.blendPosition = blendPosition || 0;

    if (media_type == "image") {
      var img = $n('img', { src: media_url + "#" + Math.random(), crossOrigin: 'IVS' });

      img.addEventListener("load", function () {
        console.log("Loadedd metadata");
        _this.media_ready(img, img.naturalWidth, img.naturalHeight);
      });
    }

    return _this;
  }

  _createClass(DoubleMedia, [{
    key: 'pause',
    value: function pause() {
      this.media_dom[this.media_dom.paused ? "play" : "pause"]();
    }
  }, {
    key: 'media_ready',
    value: function media_ready(dom, width, height) {
      this.emit("mediaLoaded");
      this.media_dom = dom;

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
  }, {
    key: 'initShaders',
    value: function initShaders(gl) {

      var fragmentShader = this.getShader(gl, shaderFs, gl.FRAGMENT_SHADER);
      var vertexShader = this.getShader(gl, shaderVs, gl.VERTEX_SHADER);

      this.mediaShaderProgram = gl.createProgram();
      gl.attachShader(this.mediaShaderProgram, vertexShader);
      gl.attachShader(this.mediaShaderProgram, fragmentShader);
      gl.linkProgram(this.mediaShaderProgram);

      if (!gl.getProgramParameter(this.mediaShaderProgram, gl.LINK_STATUS)) throw "Unable to initialize the shader program: " + gl.getProgramInfoLog(this.mediaShaderProgram);

      var vertShader = this.getShader(gl, 'void main(void){gl_FragColor=vec4(1,1,1,1);}', gl.FRAGMENT_SHADER);
      var fragShader = this.getShader(gl, 'attribute vec3 c;void main(void){gl_Position=vec4(c, 1.0);}', gl.VERTEX_SHADER);

      this.vertShader = gl.createProgram();

      gl.attachShader(this.vertShader, vertShader);
      gl.attachShader(this.vertShader, fragShader);
      gl.linkProgram(this.vertShader);

      if (!gl.getProgramParameter(this.vertShader, gl.LINK_STATUS)) throw "Unable to initialize the shader vertShader: " + gl.getProgramInfoLog(this.vertShader);
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
      this.vx = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vx);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);

      this.ix = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ix);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

      this.vertexBuf = gl.createBuffer();

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

      var canvas = $n('canvas', { width: this.media_width / 2, height: this.media_height });
      canvas.style.width = canvas.style.height = '100%';
      this.container.appendChild(canvas);

      this.delimiter = 0.5;
      var x = 0;
      var y = 0;
      var handelMouseMove = function handelMouseMove(e) {
        x = e.clientX / document.body.offsetWidth;
        y = e.clientY / document.body.offsetHeight;
        _this2.delimiter = x;
        _this2.emit("cursor", x, y);
      };

      var handelTouchMove = function handelTouchMove(e) {
        x = e.touches[0].clientX / document.body.offsetWidth;
        y = e.touches[0].clientY / document.body.offsetHeight;
        _this2.delimiter = x;
        _this2.emit("cursor", x, y);
      };

      document.addEventListener('mousemove', handelMouseMove, false);
      document.addEventListener('touchmove', handelTouchMove, false);

      onRemove(canvas, function () {
        console.log("Cleaning up everything");
        var gl = _this2.gl;
        document.removeEventListener('mousemove', handelMouseMove);
        document.removeEventListener('touchmove', handelTouchMove);
        gl.deleteTexture(_this2.tex);
        gl.deleteBuffer(_this2.vx);
        gl.deleteBuffer(_this2.ix);
        gl.deleteBuffer(_this2.vertexBuf);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        _this2.media_dom = null;
        //a.deleteProgram
        gl = null;
        if (_this2.requestId) {
          window.cancelAnimationFrame(_this2.requestId);
          _this2.requestId = undefined;
        }
      });

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
      this.requestId = requestAnimationFrame(this.timerCallback);
    }
  }, {
    key: 'computeFrame',
    value: function computeFrame() {
      var gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.mediaShaderProgram);

      this.vx_ptr = gl.getAttribLocation(this.mediaShaderProgram, "vx");
      gl.enableVertexAttribArray(this.vx_ptr);
      gl.uniform1i(gl.getUniformLocation(this.mediaShaderProgram, "sm"), 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.media_dom);

      var half = this.media_width / 2;
      var x = Math.max(1, Math.min(half - 1, half * this.delimiter));

      var xPos = x / this.media_width * 2;

      var xUniform = gl.getUniformLocation(this.mediaShaderProgram, "xFactor");
      gl.uniform1f(xUniform, xPos);

      var xUniform = gl.getUniformLocation(this.mediaShaderProgram, "imgFac");
      gl.uniform1f(xUniform, 0);

      var blend = gl.getUniformLocation(this.mediaShaderProgram, "shaderBlend");
      gl.uniform3fv(blend, this.blendColor);

      var opacity = gl.getUniformLocation(this.mediaShaderProgram, "shaderOpacity");
      gl.uniform1f(opacity, this.blendOpacity);

      var mode = gl.getUniformLocation(this.mediaShaderProgram, "mode");
      gl.uniform1i(mode, this.blendMode);

      var blendPosition = gl.getUniformLocation(this.mediaShaderProgram, "blendPosition");
      gl.uniform1i(blendPosition, this.blendPosition);

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
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-length + x, 1, 0.0, -length + x, -1, 0.0, length + x, -1, 0.0, length + x, -1, 0.0, -length + x, 1, 0.0, length + x, 1, 0.0]), gl.STATIC_DRAW);

      var coord = gl.getAttribLocation(this.vertShader, "c");
      gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(coord);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }]);

  return DoubleMedia;
}(EventEmitter);

;

module.exports = DoubleMedia;

},{"eventemitter-co":8,"udom/element/create":27,"udom/element/onRemove":28,"udom/window/requestAnimationFrame":29}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DoubleMedia = require('./doublemedia');
var EventEmitter = require('eventemitter-co');
var mod = function mod(a, b) {
  return (a % b + b) % b;
};

var DoublePlayer = function (_EventEmitter) {
  _inherits(DoublePlayer, _EventEmitter);

  function DoublePlayer(elements, container) {
    _classCallCheck(this, DoublePlayer);

    var _this = _possibleConstructorReturn(this, (DoublePlayer.__proto__ || Object.getPrototypeOf(DoublePlayer)).call(this));

    _this.index = 0;
    _this.elements = elements;
    _this.container = container;
    return _this;
  }

  _createClass(DoublePlayer, [{
    key: 'switch',
    value: function _switch(delta) {
      this.index += delta;
      this.play(mod(this.index, this.elements.length));
    }
  }, {
    key: 'play',
    value: function play(id) {
      this.index = id;
      var media = this.elements[this.index];
      this.emit("mediaLoading", media);
      this.container.innerHTML = "";
      this.doublemedia = new DoubleMedia(media, this.container);
      //this is bubble time
      this.doublemedia.on("mediaLoaded", this.emit.bind(this, "mediaLoaded", media));
      this.doublemedia.on("cursor", this.emit.bind(this, "cursor"));
    }
  }, {
    key: 'setBlendMode',
    value: function setBlendMode(blendColor, blendOpacity, blendMode, blendPosition) {
      if (!this.doublemedia) return;

      this.doublemedia.blendColor = blendColor;
      this.doublemedia.blendOpacity = blendOpacity;
      this.doublemedia.blendMode = blendMode;
      this.doublemedia.blendPosition = blendPosition;
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.doublemedia.pause();
    }
  }]);

  return DoublePlayer;
}(EventEmitter);

module.exports = DoublePlayer;

},{"./doublemedia":2,"eventemitter-co":8}],4:[function(require,module,exports){
'use strict';

module.exports = function (doublePlayer) {

  if (!doublePlayer) return;

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
  }

  var div = document.createElement("div");
  var blendColor = document.createElement("input");
  blendColor.type = "color";
  blendColor.value = "#ffffff";

  var blendOpacity = document.createElement("input");
  blendOpacity.type = "number";
  blendOpacity.min = "number";
  blendOpacity.max = "number";
  blendOpacity.step = "0.05";
  blendOpacity.value = "0";

  var BLEND_MODES = ['add', 'Average', 'ColorBurn', 'ColorDodge', 'Darken', 'Difference', 'Exclusion', 'Glow', 'HardLight', 'HardMix', 'Lighten', 'LinearBurn', 'LinearDodge', 'LinearLight', 'Multiply', 'Negation', 'Normal', 'Overlay', 'Phoenix', 'PinLight', 'Reflect', 'Screen', 'SoftLight', 'Subtract', 'VividLight', 'Hue', 'Saturation', 'Color', 'Luminosity'];
  var blendMode = document.createElement("select");
  BLEND_MODES.forEach(function (mode, index) {
    var b = document.createElement("option");
    b.value = index;
    b.innerHTML = mode;
    blendMode.appendChild(b);
  });

  var blendPosition = document.createElement("select");
  [0, 1, 2, 3].forEach(function (mode, index) {
    var b = document.createElement("option");
    b.value = index;
    b.innerHTML = mode;
    blendPosition.appendChild(b);
  });

  div.appendChild(blendColor);
  div.appendChild(blendOpacity);
  div.appendChild(blendMode);
  div.appendChild(blendPosition);

  var blendChange = function blendChange() {
    doublePlayer.setBlendMode(hexToRgb(blendColor.value), blendOpacity.value, blendMode.value, blendPosition.value);
  };

  div.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
  blendColor.addEventListener("change", blendChange);
  blendOpacity.addEventListener("change", blendChange);
  blendMode.addEventListener("change", blendChange);
  blendPosition.addEventListener("change", blendChange);

  return div;
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = function (env, methods) {
  if (typeof methods == 'string') methods = [methods];

  for (var i = 0; i < methods.length; i++) {
    if (!env[methods[i]]) continue;
    env[methods[i]] = env[methods[i]].bind(env);
  }

  return env;
};

},{}],6:[function(require,module,exports){
'use strict';

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1);

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new _Promise(function (resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, ' + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new _Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return _Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj) {
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);else results[key] = obj[key];
  }
  return _Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

},{"es6-promise":7}],7:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.4+314e4831
 */

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.ES6Promise = factory();
})(undefined, function () {
  'use strict';

  function objectOrFunction(x) {
    var type = typeof x === 'undefined' ? 'undefined' : _typeof(x);
    return x !== null && (type === 'object' || type === 'function');
  }

  function isFunction(x) {
    return typeof x === 'function';
  }

  var _isArray = void 0;
  if (Array.isArray) {
    _isArray = Array.isArray;
  } else {
    _isArray = function _isArray(x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  }

  var isArray = _isArray;

  var len = 0;
  var vertxNext = void 0;
  var customSchedulerFn = void 0;

  var asap = function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      // If len is 2, that means that we need to schedule an async flush.
      // If additional callbacks are queued before the queue is flushed, they
      // will be processed by this flush that we are scheduling.
      if (customSchedulerFn) {
        customSchedulerFn(flush);
      } else {
        scheduleFlush();
      }
    }
  };

  function setScheduler(scheduleFn) {
    customSchedulerFn = scheduleFn;
  }

  function setAsap(asapFn) {
    asap = asapFn;
  }

  var browserWindow = typeof window !== 'undefined' ? window : undefined;
  var browserGlobal = browserWindow || {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  // test for web worker but not in IE10
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

  // node
  function useNextTick() {
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // see https://github.com/cujojs/when/issues/410 for details
    return function () {
      return process.nextTick(flush);
    };
  }

  // vertx
  function useVertxTimer() {
    if (typeof vertxNext !== 'undefined') {
      return function () {
        vertxNext(flush);
      };
    }

    return useSetTimeout();
  }

  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }

  // web worker
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function () {
      return channel.port2.postMessage(0);
    };
  }

  function useSetTimeout() {
    // Store setTimeout reference so es6-promise will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    var globalSetTimeout = setTimeout;
    return function () {
      return globalSetTimeout(flush, 1);
    };
  }

  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];

      callback(arg);

      queue[i] = undefined;
      queue[i + 1] = undefined;
    }

    len = 0;
  }

  function attemptVertx() {
    try {
      var vertx = Function('return this')().require('vertx');
      vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return useVertxTimer();
    } catch (e) {
      return useSetTimeout();
    }
  }

  var scheduleFlush = void 0;
  // Decide what async method to use to triggering processing of queued callbacks:
  if (isNode) {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush = attemptVertx();
  } else {
    scheduleFlush = useSetTimeout();
  }

  function then(onFulfillment, onRejection) {
    var parent = this;

    var child = new this.constructor(noop);

    if (child[PROMISE_ID] === undefined) {
      makePromise(child);
    }

    var _state = parent._state;

    if (_state) {
      var callback = arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    } else {
      subscribe(parent, child, onFulfillment, onRejection);
    }

    return child;
  }

  /**
    `Promise.resolve` returns a promise that will become resolved with the
    passed `value`. It is shorthand for the following:
  
    ```javascript
    let promise = new Promise(function(resolve, reject){
      resolve(1);
    });
  
    promise.then(function(value){
      // value === 1
    });
    ```
  
    Instead of writing the above, your code now simply becomes the following:
  
    ```javascript
    let promise = Promise.resolve(1);
  
    promise.then(function(value){
      // value === 1
    });
    ```
  
    @method resolve
    @static
    @param {Any} value value that the returned promise will be resolved with
    Useful for tooling.
    @return {Promise} a promise that will become fulfilled with the given
    `value`
  */
  function resolve$1(object) {
    /*jshint validthis:true */
    var Constructor = this;

    if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
      return object;
    }

    var promise = new Constructor(noop);
    resolve(promise, object);
    return promise;
  }

  var PROMISE_ID = Math.random().toString(36).substring(2);

  function noop() {}

  var PENDING = void 0;
  var FULFILLED = 1;
  var REJECTED = 2;

  var TRY_CATCH_ERROR = { error: null };

  function selfFulfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }

  function cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
  }

  function getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      TRY_CATCH_ERROR.error = error;
      return TRY_CATCH_ERROR;
    }
  }

  function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
    try {
      then$$1.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }

  function handleForeignThenable(promise, thenable, then$$1) {
    asap(function (promise) {
      var sealed = false;
      var error = tryThen(then$$1, thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          resolve(promise, value);
        } else {
          fulfill(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;

        reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));

      if (!sealed && error) {
        sealed = true;
        reject(promise, error);
      }
    }, promise);
  }

  function handleOwnThenable(promise, thenable) {
    if (thenable._state === FULFILLED) {
      fulfill(promise, thenable._result);
    } else if (thenable._state === REJECTED) {
      reject(promise, thenable._result);
    } else {
      subscribe(thenable, undefined, function (value) {
        return resolve(promise, value);
      }, function (reason) {
        return reject(promise, reason);
      });
    }
  }

  function handleMaybeThenable(promise, maybeThenable, then$$1) {
    if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
      handleOwnThenable(promise, maybeThenable);
    } else {
      if (then$$1 === TRY_CATCH_ERROR) {
        reject(promise, TRY_CATCH_ERROR.error);
        TRY_CATCH_ERROR.error = null;
      } else if (then$$1 === undefined) {
        fulfill(promise, maybeThenable);
      } else if (isFunction(then$$1)) {
        handleForeignThenable(promise, maybeThenable, then$$1);
      } else {
        fulfill(promise, maybeThenable);
      }
    }
  }

  function resolve(promise, value) {
    if (promise === value) {
      reject(promise, selfFulfillment());
    } else if (objectOrFunction(value)) {
      handleMaybeThenable(promise, value, getThen(value));
    } else {
      fulfill(promise, value);
    }
  }

  function publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }

    publish(promise);
  }

  function fulfill(promise, value) {
    if (promise._state !== PENDING) {
      return;
    }

    promise._result = value;
    promise._state = FULFILLED;

    if (promise._subscribers.length !== 0) {
      asap(publish, promise);
    }
  }

  function reject(promise, reason) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._state = REJECTED;
    promise._result = reason;

    asap(publishRejection, promise);
  }

  function subscribe(parent, child, onFulfillment, onRejection) {
    var _subscribers = parent._subscribers;
    var length = _subscribers.length;

    parent._onerror = null;

    _subscribers[length] = child;
    _subscribers[length + FULFILLED] = onFulfillment;
    _subscribers[length + REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      asap(publish, parent);
    }
  }

  function publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;

    if (subscribers.length === 0) {
      return;
    }

    var child = void 0,
        callback = void 0,
        detail = promise._result;

    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];

      if (child) {
        invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }

    promise._subscribers.length = 0;
  }

  function tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      TRY_CATCH_ERROR.error = e;
      return TRY_CATCH_ERROR;
    }
  }

  function invokeCallback(settled, promise, callback, detail) {
    var hasCallback = isFunction(callback),
        value = void 0,
        error = void 0,
        succeeded = void 0,
        failed = void 0;

    if (hasCallback) {
      value = tryCatch(callback, detail);

      if (value === TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value.error = null;
      } else {
        succeeded = true;
      }

      if (promise === value) {
        reject(promise, cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }

    if (promise._state !== PENDING) {
      // noop
    } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
  }

  function initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        resolve(promise, value);
      }, function rejectPromise(reason) {
        reject(promise, reason);
      });
    } catch (e) {
      reject(promise, e);
    }
  }

  var id = 0;
  function nextId() {
    return id++;
  }

  function makePromise(promise) {
    promise[PROMISE_ID] = id++;
    promise._state = undefined;
    promise._result = undefined;
    promise._subscribers = [];
  }

  function validationError() {
    return new Error('Array Methods must be provided an Array');
  }

  var Enumerator = function () {
    function Enumerator(Constructor, input) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(noop);

      if (!this.promise[PROMISE_ID]) {
        makePromise(this.promise);
      }

      if (isArray(input)) {
        this.length = input.length;
        this._remaining = input.length;

        this._result = new Array(this.length);

        if (this.length === 0) {
          fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate(input);
          if (this._remaining === 0) {
            fulfill(this.promise, this._result);
          }
        }
      } else {
        reject(this.promise, validationError());
      }
    }

    Enumerator.prototype._enumerate = function _enumerate(input) {
      for (var i = 0; this._state === PENDING && i < input.length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
      var c = this._instanceConstructor;
      var resolve$$1 = c.resolve;

      if (resolve$$1 === resolve$1) {
        var _then = getThen(entry);

        if (_then === then && entry._state !== PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof _then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === Promise$1) {
          var promise = new c(noop);
          handleMaybeThenable(promise, entry, _then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function (resolve$$1) {
            return resolve$$1(entry);
          }), i);
        }
      } else {
        this._willSettleAt(resolve$$1(entry), i);
      }
    };

    Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
      var promise = this.promise;

      if (promise._state === PENDING) {
        this._remaining--;

        if (state === REJECTED) {
          reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        fulfill(promise, this._result);
      }
    };

    Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
      var enumerator = this;

      subscribe(promise, undefined, function (value) {
        return enumerator._settledAt(FULFILLED, i, value);
      }, function (reason) {
        return enumerator._settledAt(REJECTED, i, reason);
      });
    };

    return Enumerator;
  }();

  /**
    `Promise.all` accepts an array of promises, and returns a new promise which
    is fulfilled with an array of fulfillment values for the passed promises, or
    rejected with the reason of the first passed promise to be rejected. It casts all
    elements of the passed iterable to promises as it runs this algorithm.
  
    Example:
  
    ```javascript
    let promise1 = resolve(1);
    let promise2 = resolve(2);
    let promise3 = resolve(3);
    let promises = [ promise1, promise2, promise3 ];
  
    Promise.all(promises).then(function(array){
      // The array here would be [ 1, 2, 3 ];
    });
    ```
  
    If any of the `promises` given to `all` are rejected, the first promise
    that is rejected will be given as an argument to the returned promises's
    rejection handler. For example:
  
    Example:
  
    ```javascript
    let promise1 = resolve(1);
    let promise2 = reject(new Error("2"));
    let promise3 = reject(new Error("3"));
    let promises = [ promise1, promise2, promise3 ];
  
    Promise.all(promises).then(function(array){
      // Code here never runs because there are rejected promises!
    }, function(error) {
      // error.message === "2"
    });
    ```
  
    @method all
    @static
    @param {Array} entries array of promises
    @param {String} label optional string for labeling the promise.
    Useful for tooling.
    @return {Promise} promise that is fulfilled when all `promises` have been
    fulfilled, or rejected if any of them become rejected.
    @static
  */
  function all(entries) {
    return new Enumerator(this, entries).promise;
  }

  /**
    `Promise.race` returns a new promise which is settled in the same way as the
    first passed promise to settle.
  
    Example:
  
    ```javascript
    let promise1 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 1');
      }, 200);
    });
  
    let promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 2');
      }, 100);
    });
  
    Promise.race([promise1, promise2]).then(function(result){
      // result === 'promise 2' because it was resolved before promise1
      // was resolved.
    });
    ```
  
    `Promise.race` is deterministic in that only the state of the first
    settled promise matters. For example, even if other promises given to the
    `promises` array argument are resolved, but the first settled promise has
    become rejected before the other promises became fulfilled, the returned
    promise will become rejected:
  
    ```javascript
    let promise1 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 1');
      }, 200);
    });
  
    let promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        reject(new Error('promise 2'));
      }, 100);
    });
  
    Promise.race([promise1, promise2]).then(function(result){
      // Code here never runs
    }, function(reason){
      // reason.message === 'promise 2' because promise 2 became rejected before
      // promise 1 became fulfilled
    });
    ```
  
    An example real-world use case is implementing timeouts:
  
    ```javascript
    Promise.race([ajax('foo.json'), timeout(5000)])
    ```
  
    @method race
    @static
    @param {Array} promises array of promises to observe
    Useful for tooling.
    @return {Promise} a promise which settles in the same way as the first passed
    promise to settle.
  */
  function race(entries) {
    /*jshint validthis:true */
    var Constructor = this;

    if (!isArray(entries)) {
      return new Constructor(function (_, reject) {
        return reject(new TypeError('You must pass an array to race.'));
      });
    } else {
      return new Constructor(function (resolve, reject) {
        var length = entries.length;
        for (var i = 0; i < length; i++) {
          Constructor.resolve(entries[i]).then(resolve, reject);
        }
      });
    }
  }

  /**
    `Promise.reject` returns a promise rejected with the passed `reason`.
    It is shorthand for the following:
  
    ```javascript
    let promise = new Promise(function(resolve, reject){
      reject(new Error('WHOOPS'));
    });
  
    promise.then(function(value){
      // Code here doesn't run because the promise is rejected!
    }, function(reason){
      // reason.message === 'WHOOPS'
    });
    ```
  
    Instead of writing the above, your code now simply becomes the following:
  
    ```javascript
    let promise = Promise.reject(new Error('WHOOPS'));
  
    promise.then(function(value){
      // Code here doesn't run because the promise is rejected!
    }, function(reason){
      // reason.message === 'WHOOPS'
    });
    ```
  
    @method reject
    @static
    @param {Any} reason value that the returned promise will be rejected with.
    Useful for tooling.
    @return {Promise} a promise rejected with the given `reason`.
  */
  function reject$1(reason) {
    /*jshint validthis:true */
    var Constructor = this;
    var promise = new Constructor(noop);
    reject(promise, reason);
    return promise;
  }

  function needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  /**
    Promise objects represent the eventual result of an asynchronous operation. The
    primary way of interacting with a promise is through its `then` method, which
    registers callbacks to receive either a promise's eventual value or the reason
    why the promise cannot be fulfilled.
  
    Terminology
    -----------
  
    - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
    - `thenable` is an object or function that defines a `then` method.
    - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
    - `exception` is a value that is thrown using the throw statement.
    - `reason` is a value that indicates why a promise was rejected.
    - `settled` the final resting state of a promise, fulfilled or rejected.
  
    A promise can be in one of three states: pending, fulfilled, or rejected.
  
    Promises that are fulfilled have a fulfillment value and are in the fulfilled
    state.  Promises that are rejected have a rejection reason and are in the
    rejected state.  A fulfillment value is never a thenable.
  
    Promises can also be said to *resolve* a value.  If this value is also a
    promise, then the original promise's settled state will match the value's
    settled state.  So a promise that *resolves* a promise that rejects will
    itself reject, and a promise that *resolves* a promise that fulfills will
    itself fulfill.
  
  
    Basic Usage:
    ------------
  
    ```js
    let promise = new Promise(function(resolve, reject) {
      // on success
      resolve(value);
  
      // on failure
      reject(reason);
    });
  
    promise.then(function(value) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
  
    Advanced Usage:
    ---------------
  
    Promises shine when abstracting away asynchronous interactions such as
    `XMLHttpRequest`s.
  
    ```js
    function getJSON(url) {
      return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
  
        xhr.open('GET', url);
        xhr.onreadystatechange = handler;
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
  
        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              resolve(this.response);
            } else {
              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
            }
          }
        };
      });
    }
  
    getJSON('/posts.json').then(function(json) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
  
    Unlike callbacks, promises are great composable primitives.
  
    ```js
    Promise.all([
      getJSON('/posts'),
      getJSON('/comments')
    ]).then(function(values){
      values[0] // => postsJSON
      values[1] // => commentsJSON
  
      return values;
    });
    ```
  
    @class Promise
    @param {Function} resolver
    Useful for tooling.
    @constructor
  */

  var Promise$1 = function () {
    function Promise(resolver) {
      this[PROMISE_ID] = nextId();
      this._result = this._state = undefined;
      this._subscribers = [];

      if (noop !== resolver) {
        typeof resolver !== 'function' && needsResolver();
        this instanceof Promise ? initializePromise(this, resolver) : needsNew();
      }
    }

    /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
     ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
     Chaining
    --------
     The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
     ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
     findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
     ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
     Assimilation
    ------------
     Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
     ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
     If the assimliated promise rejects, then the downstream promise will also reject.
     ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
     Simple Example
    --------------
     Synchronous Example
     ```javascript
    let result;
     try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
     Errback Example
     ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
     Promise Example;
     ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
     Advanced Example
    --------------
     Synchronous Example
     ```javascript
    let author, books;
     try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
     Errback Example
     ```js
     function foundBooks(books) {
     }
     function failure(reason) {
     }
     findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
     Promise Example;
     ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
     @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
    */

    /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
    ```js
    function findAuthor(){
    throw new Error('couldn't find that author');
    }
    // synchronous
    try {
    findAuthor();
    } catch(reason) {
    // something went wrong
    }
    // async with promises
    findAuthor().catch(function(reason){
    // something went wrong
    });
    ```
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
    */

    Promise.prototype.catch = function _catch(onRejection) {
      return this.then(null, onRejection);
    };

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves
    
      Synchronous example:
    
      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }
    
      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```
    
      Asynchronous example:
    
      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```
    
      @method finally
      @param {Function} callback
      @return {Promise}
    */

    Promise.prototype.finally = function _finally(callback) {
      var promise = this;
      var constructor = promise.constructor;

      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    };

    return Promise;
  }();

  Promise$1.prototype.then = then;
  Promise$1.all = all;
  Promise$1.race = race;
  Promise$1.resolve = resolve$1;
  Promise$1.reject = reject$1;
  Promise$1._setScheduler = setScheduler;
  Promise$1._setAsap = setAsap;
  Promise$1._asap = asap;

  /*global self*/
  function polyfill() {
    var local = void 0;

    if (typeof global !== 'undefined') {
      local = global;
    } else if (typeof self !== 'undefined') {
      local = self;
    } else {
      try {
        local = Function('return this')();
      } catch (e) {
        throw new Error('polyfill failed because global object is unavailable in this environment');
      }
    }

    var P = local.Promise;

    if (P) {
      var promiseToString = null;
      try {
        promiseToString = Object.prototype.toString.call(P.resolve());
      } catch (e) {
        // silently ignored
      }

      if (promiseToString === '[object Promise]' && !P.cast) {
        return;
      }
    }

    local.Promise = Promise$1;
  }

  // Strange compat..
  Promise$1.polyfill = polyfill;
  Promise$1.Promise = Promise$1;

  return Promise$1;
});



},{}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var bindthem = require('bindthem');
var co = require('co');

var forIn = require('mout/object/forIn');
var guid = require('mout/random/guid');

var EventEmitter = function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);

    bindthem(this, ['on', 'off', 'once', 'emit', 'addEvent', 'addListener', 'removeListener', 'removeAllListeners', 'fireEvent']);

    this.callbacks = {};
  }

  _createClass(EventEmitter, [{
    key: 'emit',
    value: function emit(event /*, payload*/) /**
                                              * @interactive_runner hide
                                              */{
      if (!this.callbacks[event]) return _Promise.resolve();

      var chain = [];
      var args = Array.prototype.slice.call(arguments, 1);

      forIn(this.callbacks[event], function (callback) {
        var p = co.apply(callback.ctx, [callback.callback].concat(args));
        chain.push(p);
      });

      return _Promise.all(chain);
    }
  }, {
    key: 'on',
    value: function on(event, callback, ctx) /**
                                             * @interactive_runner hide
                                             */{
      if (typeof callback != "function") return console.log("you try to register a non function in ", event);
      if (!this.callbacks[event]) this.callbacks[event] = {};
      this.callbacks[event][guid()] = { callback: callback, ctx: ctx };
    }
  }, {
    key: 'once',
    value: function once(event, callback, ctx) /**
                                               * @interactive_runner hide
                                               */{
      var self = this;
      var once = function once() {
        self.off(event, once);
        self.off(event, callback);
      };

      this.on(event, callback, ctx);
      this.on(event, once);
    }
  }, {
    key: 'off',
    value: function off(event, callback) /**
                                         * @interactive_runner hide
                                         */{
      if (!event) this.callbacks = {};else if (!callback) this.callbacks[event] = {};else {
        forIn(this.callbacks[event] || {}, function (v, k) {
          if (v.callback == callback) delete this.callbacks[event][k];
        }, this);
      }
    }
  }]);

  return EventEmitter;
}();

EventEmitter.prototype.addEvent = EventEmitter.prototype.on;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.off;
EventEmitter.prototype.fireEvent = EventEmitter.prototype.emit;

module.exports = EventEmitter;

},{"bindthem":5,"co":6,"es6-promise":7,"mout/object/forIn":16,"mout/random/guid":19}],9:[function(require,module,exports){
"use strict";

/**
 * Array.indexOf
 */
function indexOf(arr, item, fromIndex) {
    fromIndex = fromIndex || 0;
    if (arr == null) {
        return -1;
    }

    var len = arr.length,
        i = fromIndex < 0 ? len + fromIndex : fromIndex;
    while (i < len) {
        // we iterate over sparse items since there is no way to make it
        // work properly on IE 7-8. see #64
        if (arr[i] === item) {
            return i;
        }

        i++;
    }

    return -1;
}

module.exports = indexOf;

},{}],10:[function(require,module,exports){
'use strict';

var indexOf = require('./indexOf');

/**
 * Remove all instances of an item from array.
 */
function removeAll(arr, item) {
    var idx = indexOf(arr, item);
    while (idx !== -1) {
        arr.splice(idx, 1);
        idx = indexOf(arr, item, idx);
    }
}

module.exports = removeAll;

},{"./indexOf":9}],11:[function(require,module,exports){
'use strict';

var isKind = require('./isKind');
/**
 */
var isArray = Array.isArray || function (val) {
    return isKind(val, 'Array');
};
module.exports = isArray;

},{"./isKind":12}],12:[function(require,module,exports){
'use strict';

var kindOf = require('./kindOf');
/**
 * Check if value is from a specific "kind".
 */
function isKind(val, kind) {
    return kindOf(val) === kind;
}
module.exports = isKind;

},{"./kindOf":13}],13:[function(require,module,exports){
"use strict";

/**
 * Gets the "kind" of value. (e.g. "String", "Number", etc)
 */
function kindOf(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
}
module.exports = kindOf;

},{}],14:[function(require,module,exports){
"use strict";

/**
 * @constant Maximum 32-bit signed integer value. (2^31 - 1)
 */

module.exports = 2147483647;

},{}],15:[function(require,module,exports){
"use strict";

/**
 * @constant Minimum 32-bit signed integer value (-2^31).
 */

module.exports = -2147483648;

},{}],16:[function(require,module,exports){
'use strict';

var hasOwn = require('./hasOwn');

var _hasDontEnumBug, _dontEnums;

function checkDontEnum() {
    _dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];

    _hasDontEnumBug = true;

    for (var key in { 'toString': null }) {
        _hasDontEnumBug = false;
    }
}

/**
 * Similar to Array/forEach but works over object properties and fixes Don't
 * Enum bug on IE.
 * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
 */
function forIn(obj, fn, thisObj) {
    var key,
        i = 0;
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
            if ((key !== 'constructor' || !isProto && hasOwn(obj, key)) && obj[key] !== Object.prototype[key]) {
                if (exec(fn, obj, key, thisObj) === false) {
                    break;
                }
            }
        }
    }
}

function exec(fn, obj, key, thisObj) {
    return fn.call(thisObj, obj[key], key, obj);
}

module.exports = forIn;

},{"./hasOwn":17}],17:[function(require,module,exports){
"use strict";

/**
 * Safer Object.hasOwnProperty
 */
function hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = hasOwn;

},{}],18:[function(require,module,exports){
'use strict';

var randInt = require('./randInt');
var isArray = require('../lang/isArray');

/**
 * Returns a random element from the supplied arguments
 * or from the array (if single argument is an array).
 */
function choice(items) {
    var target = arguments.length === 1 && isArray(items) ? items : arguments;
    return target[randInt(0, target.length - 1)];
}

module.exports = choice;

},{"../lang/isArray":11,"./randInt":22}],19:[function(require,module,exports){
'use strict';

var randHex = require('./randHex');
var choice = require('./choice');

/**
 * Returns pseudo-random guid (UUID v4)
 * IMPORTANT: it's not totally "safe" since randHex/choice uses Math.random
 * by default and sequences can be predicted in some cases. See the
 * "random/random" documentation for more info about it and how to replace
 * the default PRNG.
 */
function guid() {
  return randHex(8) + '-' + randHex(4) + '-' +
  // v4 UUID always contain "4" at this position to specify it was
  // randomly generated
  '4' + randHex(3) + '-' +
  // v4 UUID always contain chars [a,b,8,9] at this position
  choice(8, 9, 'a', 'b') + randHex(3) + '-' + randHex(12);
}
module.exports = guid;

},{"./choice":18,"./randHex":21}],20:[function(require,module,exports){
'use strict';

var random = require('./random');
var MIN_INT = require('../number/MIN_INT');
var MAX_INT = require('../number/MAX_INT');

/**
 * Returns random number inside range
 */
function rand(min, max) {
    min = min == null ? MIN_INT : min;
    max = max == null ? MAX_INT : max;
    return min + (max - min) * random();
}

module.exports = rand;

},{"../number/MAX_INT":14,"../number/MIN_INT":15,"./random":23}],21:[function(require,module,exports){
'use strict';

var choice = require('./choice');

var _chars = '0123456789abcdef'.split('');

/**
 * Returns a random hexadecimal string
 */
function randHex(size) {
    size = size && size > 0 ? size : 6;
    var str = '';
    while (size--) {
        str += choice(_chars);
    }
    return str;
}

module.exports = randHex;

},{"./choice":18}],22:[function(require,module,exports){
'use strict';

var MIN_INT = require('../number/MIN_INT');
var MAX_INT = require('../number/MAX_INT');
var rand = require('./rand');

/**
 * Gets random integer inside range or snap to min/max values.
 */
function randInt(min, max) {
    min = min == null ? MIN_INT : ~~min;
    max = max == null ? MAX_INT : ~~max;
    // can't be max + 0.5 otherwise it will round up if `rand`
    // returns `max` causing it to overflow range.
    // -0.5 and + 0.49 are required to avoid bias caused by rounding
    return Math.round(rand(min - 0.5, max + 0.499999999999));
}

module.exports = randInt;

},{"../number/MAX_INT":14,"../number/MIN_INT":15,"./rand":20}],23:[function(require,module,exports){
"use strict";

/**
 * Just a wrapper to Math.random. No methods inside mout/random should call
 * Math.random() directly so we can inject the pseudo-random number
 * generator if needed (ie. in case we need a seeded random or a better
 * algorithm than the native one)
 */
function random() {
    return random.get();
}

// we expose the method so it can be swapped if needed
random.get = Math.random;

module.exports = random;

},{}],24:[function(require,module,exports){
"use strict";

var _global = Function('return this')();

/*istanbul ignore next*/
module.exports = _global.setImmediate || _global.setTimeout;

},{}],25:[function(require,module,exports){
"use strict";

var setImmediate = require('../async/setImmediate');

module.exports = function (fn, bind) {
  var args = [].slice.call(arguments, 2);

  return function () {
    args.push.apply(args, arguments);
    setImmediate(function () {
      if (fn) return fn.apply(bind, args);
    });
  };
};

},{"../async/setImmediate":24}],26:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = (typeof module === "undefined" ? "undefined" : _typeof(module)) === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function (arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value instanceof AwaitArgument) {
          return _Promise.resolve(value.arg).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return _Promise.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if ((typeof process === "undefined" ? "undefined" : _typeof(process)) === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new _Promise(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
      // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
      // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

    return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = arg;
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }
        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function reset(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
}(
// Among the various tricks for obtaining a reference to the global
// object, this seems to be the most reliable technique that does not
// use indirect eval (which violates Content Security Policy).
(typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" ? global : (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" ? window : (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" ? self : undefined);

},{"es6-promise":7}],27:[function(require,module,exports){
"use strict";

var forIn = require('mout/object/forIn');

module.exports = function (tagname, attrs) {
  var foo = document.createElement(tagname);
  forIn(attrs || {}, function (value, attrname) {
    foo[attrname] = value;
  });

  return foo;
};

},{"mout/object/forIn":16}],28:[function(require,module,exports){
"use strict";

var removeAll = require('mout/array/removeAll');
var detach = require('nyks/function/detach');

var checkDom = [];

var scanRemoved = function scanRemoved() {
  if (!checkDom.length) return;

  checkDom.slice().forEach(function (check) {
    if (document.documentElement.contains(check.dom)) return;

    removeAll(checkDom, check);
    detach(check.cb).call();
  });
};

var observer = new MutationObserver(scanRemoved);

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

module.exports = function (dom, cb) {
  checkDom.push({ dom: dom, cb: cb });
};

},{"mout/array/removeAll":10,"nyks/function/detach":25}],29:[function(require,module,exports){
"use strict";

module.exports = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}();

},{}]},{},[26,1]);
