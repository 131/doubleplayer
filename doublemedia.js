"use strict";

var shaderFs = `

precision mediump float;
uniform sampler2D sm;
varying vec2 tx;
uniform int  mode;
uniform vec3 shaderBlend;
uniform float shaderOpacity;
uniform int blendPosition;

float blendAdd(float base, float blend) {
	return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
	return min(base+blend,vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
	return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendAverage(vec3 base, vec3 blend) {
	return (base+blend)/2.0;
}

vec3 blendAverage(vec3 base, vec3 blend, float opacity) {
	return (blendAverage(base, blend) * opacity + base * (1.0 - opacity));
}

float blendColorBurn(float base, float blend) {
	return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
	return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
	return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
}

float blendColorDodge(float base, float blend) {
	return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
	return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
	return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
}

float blendDarken(float base, float blend) {
	return min(blend,base);
}

vec3 blendDarken(vec3 base, vec3 blend) {
	return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}

vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
	return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendDifference(vec3 base, vec3 blend) {
	return abs(base-blend);
}

vec3 blendDifference(vec3 base, vec3 blend, float opacity) {
	return (blendDifference(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendExclusion(vec3 base, vec3 blend) {
	return base+blend-2.0*base*blend;
}

vec3 blendExclusion(vec3 base, vec3 blend, float opacity) {
	return (blendExclusion(base, blend) * opacity + base * (1.0 - opacity));
}

float blendReflect(float base, float blend) {
	return (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);
}

vec3 blendReflect(vec3 base, vec3 blend) {
	return vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));
}

vec3 blendReflect(vec3 base, vec3 blend, float opacity) {
	return (blendReflect(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendGlow(vec3 base, vec3 blend) {
	return blendReflect(blend,base);
}

vec3 blendGlow(vec3 base, vec3 blend, float opacity) {
	return (blendGlow(base, blend) * opacity + base * (1.0 - opacity));
}

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendHardLight(vec3 base, vec3 blend) {
	return blendOverlay(blend,base);
}

vec3 blendHardLight(vec3 base, vec3 blend, float opacity) {
	return (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));
}

float blendVividLight(float base, float blend) {
	return (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));
}

vec3 blendVividLight(vec3 base, vec3 blend) {
	return vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));
}

vec3 blendVividLight(vec3 base, vec3 blend, float opacity) {
	return (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));
}

float blendHardMix(float base, float blend) {
	return (blendVividLight(base,blend)<0.5)?0.0:1.0;
}

vec3 blendHardMix(vec3 base, vec3 blend) {
	return vec3(blendHardMix(base.r,blend.r),blendHardMix(base.g,blend.g),blendHardMix(base.b,blend.b));
}

vec3 blendHardMix(vec3 base, vec3 blend, float opacity) {
	return (blendHardMix(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLighten(float base, float blend) {
	return max(blend,base);
}

vec3 blendLighten(vec3 base, vec3 blend) {
	return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
	return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearBurn(float base, float blend) {
	// Note : Same implementation as BlendSubtractf
	return max(base+blend-1.0,0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendSubtract
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {
	return (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearDodge(float base, float blend) {
	// Note : Same implementation as BlendAddf
	return min(base+blend,1.0);
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendAdd
	return min(base+blend,vec3(1.0));
}

vec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {
	return (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearLight(float base, float blend) {
	return blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
	return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

vec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {
	return (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendMultiply(vec3 base, vec3 blend) {
	return base*blend;
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
	return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendNegation(vec3 base, vec3 blend) {
	return vec3(1.0)-abs(vec3(1.0)-base-blend);
}

vec3 blendNegation(vec3 base, vec3 blend, float opacity) {
	return (blendNegation(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendNormal(vec3 base, vec3 blend) {
	return blend;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
	return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendPhoenix(vec3 base, vec3 blend) {
	return min(base,blend)-max(base,blend)+vec3(1.0);
}

vec3 blendPhoenix(vec3 base, vec3 blend, float opacity) {
	return (blendPhoenix(base, blend) * opacity + base * (1.0 - opacity));
}

float blendPinLight(float base, float blend) {
	return (blend<0.5)?blendDarken(base,(2.0*blend)):blendLighten(base,(2.0*(blend-0.5)));
}

vec3 blendPinLight(vec3 base, vec3 blend) {
	return vec3(blendPinLight(base.r,blend.r),blendPinLight(base.g,blend.g),blendPinLight(base.b,blend.b));
}

vec3 blendPinLight(vec3 base, vec3 blend, float opacity) {
	return (blendPinLight(base, blend) * opacity + base * (1.0 - opacity));
}

float blendScreen(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
	return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
	return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}

float blendSoftLight(float base, float blend) {
	return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
	return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
	return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}

float blendSubtract(float base, float blend) {
	return max(base+blend-1.0,0.0);
}

vec3 blendSubtract(vec3 base, vec3 blend) {
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendSubtract(vec3 base, vec3 blend, float opacity) {
	return (blendSubtract(base, blend) * opacity + base * (1.0 - opacity));
}

float HueToRGB(float f1, float f2, float hue)
{
	if (hue < 0.0)
		hue += 1.0;
	else if (hue > 1.0)
		hue -= 1.0;
	float res;
	if ((6.0 * hue) < 1.0)
		res = f1 + (f2 - f1) * 6.0 * hue;
	else if ((2.0 * hue) < 1.0)
		res = f2;
	else if ((3.0 * hue) < 2.0)
		res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
	else
		res = f1;
	return res;
}

vec3 HSLToRGB(vec3 hsl)
{
	vec3 rgb;
	
	if (hsl.y == 0.0)
		rgb = vec3(hsl.z); // Luminance
	else
	{
		float f2;
		
		if (hsl.z < 0.5)
			f2 = hsl.z * (1.0 + hsl.y);
		else
			f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);
			
		float f1 = 2.0 * hsl.z - f2;
		
		rgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));
		rgb.g = HueToRGB(f1, f2, hsl.x);
		rgb.b= HueToRGB(f1, f2, hsl.x - (1.0/3.0));
	}
	
	return rgb;
}

vec3 RGBToHSL(vec3 color)
{
	vec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)
	
	float fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB
	float fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB
	float delta = fmax - fmin;             //Delta RGB value

	hsl.z = (fmax + fmin) / 2.0; // Luminance

	if (delta == 0.0)		//This is a gray, no chroma...
	{
		hsl.x = 0.0;	// Hue
		hsl.y = 0.0;	// Saturation
	}
	else                                    //Chromatic data...
	{
		if (hsl.z < 0.5)
			hsl.y = delta / (fmax + fmin); // Saturation
		else
			hsl.y = delta / (2.0 - fmax - fmin); // Saturation
		
		float deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;
		float deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;
		float deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;

		if (color.r == fmax )
			hsl.x = deltaB - deltaG; // Hue
		else if (color.g == fmax)
			hsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue
		else if (color.b == fmax)
			hsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue

		if (hsl.x < 0.0)
			hsl.x += 1.0; // Hue
		else if (hsl.x > 1.0)
			hsl.x -= 1.0; // Hue
	}

	return hsl;
}

// Hue Blend mode creates the result color by combining the luminance and saturation of the base color with the hue of the blend color.
vec3 BlendHue(vec3 base, vec3 blend)
{
	vec3 baseHSL = RGBToHSL(base);
	return HSLToRGB(vec3(RGBToHSL(blend).r, baseHSL.g, baseHSL.b));
}

vec3 BlendHue(vec3 base, vec3 blend, float opacity) {
	return (BlendHue(base, blend) * opacity + base * (1.0 - opacity));
}

// Saturation Blend mode creates the result color by combining the luminance and hue of the base color with the saturation of the blend color.
vec3 BlendSaturation(vec3 base, vec3 blend)
{
	vec3 baseHSL = RGBToHSL(base);
	return HSLToRGB(vec3(baseHSL.r, RGBToHSL(blend).g, baseHSL.b));
}

vec3 BlendSaturation(vec3 base, vec3 blend, float opacity) {
	return (BlendSaturation(base, blend) * opacity + base * (1.0 - opacity));
}

// Color Mode keeps the brightness of the base color and applies both the hue and saturation of the blend color.
vec3 BlendColor(vec3 base, vec3 blend)
{
	vec3 blendHSL = RGBToHSL(blend);
	return HSLToRGB(vec3(blendHSL.r, blendHSL.g, RGBToHSL(base).b));
}

vec3 BlendColor(vec3 base, vec3 blend, float opacity) {
	return (BlendColor(base, blend) * opacity + base * (1.0 - opacity));
}

// Luminosity Blend mode creates the result color by combining the hue and saturation of the base color with the luminance of the blend color.
vec3 BlendLuminosity(vec3 base, vec3 blend)
{
	vec3 baseHSL = RGBToHSL(base);
	return HSLToRGB(vec3(baseHSL.r, baseHSL.g, RGBToHSL(blend).b));
}

vec3 BlendLuminosity(vec3 base, vec3 blend, float opacity) {
	return (BlendLuminosity(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendFunc(int mode, vec3 base, vec3 blend, float opacity) {
    vec3 returnedValue = base;
    if(mode == 1) {
        returnedValue = blendAdd(base, blend, opacity);
	} if(mode == 2) {
      returnedValue = blendAverage(base, blend, opacity);
    } if(mode == 3) {
        returnedValue = blendColorBurn(base, blend, opacity);
    } if(mode == 4) {
        returnedValue = blendColorDodge(base, blend, opacity);
    } if(mode == 5) {
        returnedValue = blendDarken(base, blend, opacity);
    } if(mode == 6) {
        returnedValue = blendDifference(base, blend, opacity);
    } if(mode == 7) {
        returnedValue = blendExclusion(base, blend, opacity);
    } if(mode == 8) {
        returnedValue = blendGlow(base, blend, opacity);
    } if(mode == 9) {
        returnedValue = blendHardLight(base, blend, opacity);
    } if(mode == 10) {
        returnedValue = blendHardMix(base, blend, opacity);
    } if(mode == 11) {
        returnedValue = blendLighten(base, blend, opacity);
    } if(mode == 12) {
        returnedValue = blendLinearBurn(base, blend, opacity);
    } if(mode == 13) {
        returnedValue = blendLinearDodge(base, blend, opacity);
    } if(mode == 14) {
        returnedValue = blendLinearLight(base, blend, opacity);
    } if(mode == 15) {
        returnedValue = blendMultiply(base, blend, opacity);
    } if(mode == 16) {
        returnedValue = blendNegation(base, blend, opacity);
    } if(mode == 17) {
        returnedValue = blendNormal(base, blend, opacity);
    } if(mode == 18) {
        returnedValue = blendOverlay(base, blend, opacity);
    }  if(mode == 19) {
        returnedValue = blendPhoenix(base, blend, opacity);
    }  if(mode == 20) {
        returnedValue = blendPinLight(base, blend, opacity);
    }  if(mode == 21) {
        returnedValue = blendReflect(base, blend, opacity);
    }  if(mode == 22) {
        returnedValue = blendScreen(base, blend, opacity);
    } if(mode == 23) {
        returnedValue = blendSoftLight(base, blend, opacity);
    } if(mode == 24) {
        returnedValue = blendSubtract(base, blend, opacity);
    } if(mode == 25) {
        returnedValue = blendVividLight(base, blend, opacity);
    } if(mode == 26) {
        returnedValue = BlendHue(base, blend, opacity);
    } if(mode == 27) {
        returnedValue = BlendSaturation(base, blend, opacity);
    } if(mode == 28) {
        returnedValue = BlendColor(base, blend, opacity);
    } if(mode == 29) {
        returnedValue = BlendLuminosity(base, blend, opacity);
    }
	return returnedValue;
}

void main(void) {
    vec4 test = texture2D(sm,tx);
    vec3 color = blendFunc(mode, test.rgb, shaderBlend, shaderOpacity);

    if(blendPosition == 0) {
      gl_FragColor = test;
    } if(blendPosition == 3) {
      gl_FragColor = vec4(color, 1.0);
    } if(blendPosition == 2) {
      if((0.5 - tx.x) < 0.0) {
        gl_FragColor = vec4(color, 1.0);;
      } else {
          gl_FragColor = test;
      }
    } if(blendPosition == 1) {
      if((0.5 - tx.x) > 0.0) {
        gl_FragColor = vec4(color, 1.0);;
      } else {
          gl_FragColor = test;
      }
    }
}
`;


var shaderVs = `
  attribute vec2 vx;
  varying   vec2 tx;
  uniform float xFactor;
  uniform float imgFac;


  void main(void) {
    float vxx   = vx.x * ( 1.0 - xFactor) + xFactor;
    gl_Position = vec4((vx.x * 2.0* xFactor - 1.0) * imgFac + (1.0 - imgFac) * (vxx *2.0 - 1.0)  , 1.0 - vx.y * 2.0, 0, 1);
    tx          = vec2((vx.x*xFactor/2.0)*imgFac + (1.0-imgFac)*(vxx / 2.0 + 0.5) , vx.y);
  }
`;

const $n          = require('udom/element/create');
const onRemove          = require('udom/element/onRemove');
const EventEmitter = require('eventemitter-co');
const requestAnimationFrame = require('udom/window/requestAnimationFrame');

class DoubleMedia extends EventEmitter {


  constructor(media, container, blendColor, blendOpacity, blendMode, blendPosition) {
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

    this.blendColor    = blendColor || [1, 1, 1];
    this.blendOpacity  = blendOpacity || 0;
    this.blendMode     = blendMode || 0;
    this.blendPosition = blendPosition || 0;

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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -length + x ,1,0.0,  -length + x,-1,0.0,  length + x,-1,0.0 , length + x,-1,0.0,  -length + x,1,0.0,  length + x,1,0.0 ]), gl.STATIC_DRAW);

    const coord = gl.getAttribLocation(this.vertShader, "c");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

  }
};





module.exports = DoubleMedia;

