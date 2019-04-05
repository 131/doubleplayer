'use strict';

module.exports = function(doublePlayer) {

  if(!doublePlayer)
    return;

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255,  parseInt(result[3], 16) / 255 ];
  }

  var div = document.createElement("div");
  var blendColor     = document.createElement("input");
  blendColor.type  = "color";
  blendColor.value = "#ffffff"

  var blendOpacity = document.createElement("input");
  blendOpacity.type = "number";
  blendOpacity.min  = "number";
  blendOpacity.max  = "number";
  blendOpacity.step = "0.05";
  blendOpacity.value = "0";

  const BLEND_MODES = ['add', 'Average', 'ColorBurn', 'ColorDodge', 'Darken', 'Difference', 'Exclusion', 'Glow', 'HardLight', 'HardMix', 'Lighten', 'LinearBurn', 'LinearDodge', 'LinearLight', 'Multiply', 'Negation', 'Normal', 'Overlay', 'Phoenix', 'PinLight', 'Reflect', 'Screen', 'SoftLight', 'Subtract', 'VividLight', 'Hue', 'Saturation', 'Color', 'Luminosity'];
  var blendMode = document.createElement("select");
  BLEND_MODES.forEach((mode, index) => {
    var b = document.createElement("option");
    b.value = index + 1;
    b.innerHTML = mode;
    blendMode.appendChild(b);
  })

  var blendPosition = document.createElement("select");
  [0, 1, 2, 3].forEach((mode, index) => {
    var b = document.createElement("option");
    b.value = index;
    b.innerHTML = mode;
    blendPosition.appendChild(b);
  })

  div.appendChild(blendColor);
  div.appendChild(blendOpacity);
  div.appendChild(blendMode);
  div.appendChild(blendPosition);

  var  blendChange = () => {
    doublePlayer.setBlendMode(hexToRgb(blendColor.value), blendOpacity.value, blendMode.value, blendPosition.value);
  }

  div.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
  blendColor.addEventListener("change", blendChange)
  blendOpacity.addEventListener("change", blendChange)
  blendMode.addEventListener("change", blendChange)
  blendPosition.addEventListener("change", blendChange)

  return div;
}
