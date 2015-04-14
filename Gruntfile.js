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
            'app/js/vendor/hammer.js', 'app/js/vendor/modernizr.custom.js',
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
    },
    
    copy: {
        html: {
            flatten: true,
            src: ["app/template.html"],
            dest: "app/dist/",
            expand: true,
            rename: function (dest, src) {
                return dest + src.replace("template", "index");
            }
        },
        js: {
            flatten: true,
            src: ["app/js/app.bundle.min.js"],
            dest: "app/dist/js/",
            expand: true
        },
        css: {
            flatten: true,
            src: ["app/css/main.min.css"],
            dest: "app/dist/css/",
            expand: true
        },
        fonts: {
            flatten: true,
            src: ["app/fonts/*"],
            dest: "app/dist/fonts/",
            expand: true
        },
        img: {
            flatten: true,
            src: ["app/img/*"],
            dest: "app/dist/img/",
            expand: true
        }
    }
  });

    grunt.registerTask('serve', [
        'connect',
        'open',
        'watch'
    ]);
  
    grunt.registerTask('build', [
        'copy'
    ]);
};
