'use strict';

const fs       = require('fs');
const UglifyJS = require("uglify-es");
const path    = require('path');

const browserify = require('browserify');
const discify    = require('discify');
const livereload = require('browserify-reload');
const watchify   = require('watchify');
const defer      = require('nyks/promise/defer');
const rmrf         = require('nyks/fs/rmrf');
const mkdirpSync   = require('nyks/fs/mkdirpSync');
const sleep   = require('nyks/function/sleep');




const DEPLOY_DIR = './release';
const JsEntrie   = './bootstrap.js';


class Packer {

  constructor(debug) {
    this._browserify = browserify({
      commondir     : false,
      detectGlobals : false,
      entries : [
        require.resolve("regenerator-runtime/runtime"),
        JsEntrie
      ],
      cache : {},
      packageCache : {}
    });


    if(debug) {
      this._browserify.plugin(watchify);
      this._browserify.plugin(discify);
      this._browserify.plugin(livereload);
      this._browserify.on('update', this.browserify.bind(this));
    }


    this._browserify.transform({'NODE_ENV' : debug ? 'development' : 'production'}, 'envify');

    this._browserify.transform({global : true, plugins : ['es6-promise', 'transform-object-rest-spread', 'babel-plugin-transform-object-assign'], presets : ['es2015', 'es2017']}, 'babelify');
  }

  async deploy() {
    await rmrf(DEPLOY_DIR);
    mkdirpSync(DEPLOY_DIR);
    await this.browserify();
    this.jsmin();
  }

  jsmin() {
    var result = UglifyJS.minify(fs.readFileSync(`./${DEPLOY_DIR}/index.js`, 'utf-8'));
    fs.writeFileSync(`./${DEPLOY_DIR}/index.min.js`, result.code);
  }

  browserify() {
    console.log('browserify...');
    const defered = defer();
    var target = fs.createWriteStream(`./${DEPLOY_DIR}/index.js`);

    target.on("close", defered.resolve);

    this._browserify.bundle((err) => {
      if(err)
        defered.reject(err);
    }).pipe(target);


    return defered;
  }


}

module.exports = Packer;
