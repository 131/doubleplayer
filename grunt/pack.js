var fs = require('fs');
var cp = require('child_process');

module.exports = function(grunt) {
  var manifest = grunt.config.get('manifest')

  grunt.config('uglify', {
    options: {
      mangle: false
    },
    pack : {
      files: {
        'release/doubleplayer.min.js': ['release/doubleplayer.js']
      }
    }
  });

  grunt.config('browserify', {
    options : { browserifyOptions : {

      //  https://github.com/substack/node-browserify/blob/master/bin/args.js#L71
      detectGlobals : false,
    },},

    pack : {
       options: {
          transform: [['babelify', {presets: ['es2015']}]]
        },
      files: {
        'release/doubleplayer.js': ['release/_bootstrap.js']
      }
    }
  });


  //disable uglify.min version as uglify-js do not support ES6 strings
  grunt.registerTask('pack', ['browserify' ,'uglify']); //, 'uglify'
  grunt.registerTask('default', ['pack']);


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
};
