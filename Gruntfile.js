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
          //protocol: 'https',
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
      target: {
        options: {
          report: 'min',
          roundingPrecision: -1
        },
        files: {
          'app/css/main.min.css': 'app/css/main.css'
        }
      }
    },

    jshint: {
      options: {
        ignores: ['app/js/vendor/*.js', '**/*.min.js'],
        devel: true,
        browser: true
      },
      files: ['Gruntfile.js', 'app/js/**/*.js']
    },

    uglify: {
      options: {
        screwIE8: true
      },
      target: {
        files: {
          'app/js/app.bundle.min.js': ['app/js/vendor/classie.js', 'app/js/vendor/fastclick.js',
            'app/js/vendor/WallopSlider.js', 'app/js/PopupService.js',
            'app/js/BulletNavigation.js', 'app/js/videoPlay.js', 'app/js/app.js']
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
        tasks: ['compass:dev', 'cssmin']
      },
      js: {
        files: ['app/js/**/*.js', '!**/*.min.js'],
        tasks: ['jshint', 'uglify']
      }
    }
  });

  grunt.registerTask('serve', [
    'connect',
    'open',
    'watch'
  ]);
};