module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    connect: {
      server: {
        options: {
          port: 9003,
          base: 'app',
          hostname: '0.0.0.0',
          livereload: true
        }
      }
    },

    open: {
      server: {
        path: 'http://localhost:<%= connect.server.options.port %>'
      }
    },

    compass: {
      dist: {
        options: {
          sassDir: 'app/sass',
          cssDir: 'app/css',
          fontsDir: 'app/fonts',
          relativeAssets: true,
          environment: 'production'
        }
      },
      dev: {
        options: {
          sassDir: 'app/sass',
          cssDir: 'app/css',
          fontsDir: 'app/fonts',
          relativeAssets: true,
          sourcemap: true,
          outputStyle: 'expanded'
        }
      }
    },

    cssmin: {
      options: {
        aggressiveMerging: true,
        roundingPrecision: -1
      },
      target: {
        files: {
          'app/css/main.min.css': 'app/css/main.css'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },
      files: ['app/**/*'],
      sass: {
        options: {
          livereload: false
        },
        files: 'app/sass/**/*.scss',
        tasks: ['compass:dev']
      }
    }
  });

  grunt.registerTask('serve', [
    'connect',
    'open',
    'watch'
  ]);
};