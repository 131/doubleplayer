"use strict";

const DoubleMedia = require('./doublemedia');
const EventEmitter = require('eventemitter-co');
const mod = (a,b) => ((a%b)+b)%b;


class DoublePlayer extends EventEmitter {
  constructor(elements, container) {
    super();
    this.index = 0;
    this.elements = elements;
    this.container = container;
  }

  switch(delta) {
    this.index += delta;
    this.play(mod(this.index, this.elements.length)); 
  }


  play(id, develMode) {
    this.index = id;
    var media    = this.elements[this.index]; 
    this.emit("mediaLoading", media);
    this.container.innerHTML = "";
    this.doublemedia = new DoubleMedia(media, this.container, develMode);
    //this is bubble time
    this.doublemedia.on("mediaLoaded", this.emit.bind(this, "mediaLoaded", media));
    this.doublemedia.on("cursor", this.emit.bind(this, "cursor"));
  }

  setBlendMode(blendColor, blendOpacity, blendMode, blendPosition, thickness) {
    if(!this.doublemedia)
      return;

    this.doublemedia.blendColor    = blendColor;
    this.doublemedia.blendOpacity  = blendOpacity;
    this.doublemedia.blendMode     = blendMode;
    this.doublemedia.blendPosition = blendPosition;
    this.doublemedia.thickness     = thickness;


  }
 
  pause() {
    this.doublemedia.pause();
  }

}

module.exports = DoublePlayer;
