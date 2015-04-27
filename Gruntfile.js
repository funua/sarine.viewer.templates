module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var appConfig = {
        widgetName: null,
        dir: ''
    },
    thenCallback;
    
    var fullConfig = {
        project: appConfig,

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
            }
        },

        copy: {
            dist_html: {
                flatten: true,
                src: ["app/widgets/<%= project.widgetName %>/template.html"],
                dest: 'app/<%= project.dir %>/<%= project.widgetName %>/',
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('template', 'index');
                }
            },
            dist_assets1: {
                flatten: true,
                src: ['tmp/app.bundle.min.js', 'app/css/main.min.css'],
                dest: 'app/<%= project.dir %>/<%= project.widgetName %>/',
                expand: true
            },
            dist_assets2: {
                src: ['app/fonts/**', 'app/img/**'],
                dest: "app/<%= project.dir %>/<%= project.widgetName %>/",
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('app\/', '');
                }
            }
        },

        clean: {
            initial: ['app/dist'],
            tmp: ['tmp']
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    // order of elements is important!
                    'app/js/vendor/*.js',
                    'app/js/*.js',
                    'app/widgets/<%= project.widgetName %>**/*.js',
                    '!app/js/app.bundle.min.js',
                    '!app/js/app.js',
                    'app/js/app.js'         // must be last in bundle
                ],
                dest: 'tmp/app.bundle.js'
            }
        },

        uglify: {
            dist: {
                src: ['tmp/app.bundle.js'],
                dest: 'tmp/app.bundle.min.js'
            }
        },

        replace: {
            container: {
                options: {
                    patterns: [
                        {
                            match: /var template = '[^']+'/,
                            replacement: "var template = '<%= project.widgetName %>/index.html'"
                        }
                    ]
                },
                src: 'app/index.html',
                dest: 'app/<%= project.dir %>/<%= project.container_name %>'
            },
            widget_html: {
                options: {
                    patterns: [
                        {
                            match: /<!--dist scripts replace-->[\s\S]+<!--end dist scripts replace-->/,     // [\s\S]+ multiline match of any character
                            replacement: '<script type="text/javascript" src="app.bundle.min.js"></script>'
                        }, {
                            match: /@import '[./]+css\/main\.min\.css'/,
                            replacement: "@import '/<%= project.dir %>/<%= project.widgetName %>/main.min.css'"
                        }, {
                            match: /src="\/img\//,
                            replacement: 'src="/<%= project.dir %>/<%= project.widgetName %>/img/'
                        }
                    ]
                },
                src: 'app/<%= project.dir %>/<%= project.widgetName %>/index.html',
                dest: '<%= replace.widget_html.src %>'
            },
            css_bundle: {
                options: {
                    patterns: [
                        {
                            match: /url\(\.\.\/fonts/g,
                            replacement: 'url(/<%= project.dir %>/<%= project.widgetName %>/fonts'
                        },
                        {
                            match: /url\([./]+img/g,
                            replacement: 'url(/<%= project.dir %>/<%= project.widgetName %>/img'
                        }
                    ]
                },
                src: 'app/<%= project.dir %>/<%= project.widgetName %>/main.min.css',
                dest: '<%= replace.css_bundle.src %>'
            }
        }
    };

    grunt.initConfig({
        prompt: {
            target: {
                options: {
                    questions: [
                        {
                            config: 'project.widgetName',
                            type: 'list',
                            message: 'Select a widget to process',
                            choices: function () {
                                var widgets = [];
                                grunt.file.expand('app/widgets/*').forEach(function (w) {
                                    var wDirname = w.split('/').pop();
                                    widgets.push(wDirname);
                                });
                                return widgets;
                            },
                            filter: function(value) {
                                appConfig.widgetName = value;
                            }
                        }
                    ],
                    then: function () {
                        thenCallback();
                    }
                }
            }
        }
    });


    grunt.registerTask('serve', 'Watch for changes in files', function () {
        grunt.initConfig(fullConfig);
        grunt.task.run([
            'connect',
            'open',
            'watch'
        ]);
    });

    
    grunt.registerTask('build_widget', '', function () {
        build_widget_prompt('dist');
    });
    
    
    grunt.registerTask('build_test', '', function () {
        build_widget_prompt('dist_test');
    });
    
    function build_widget_prompt(dir) {
        appConfig.dir = dir;
        grunt.task.run(['prompt']);
        thenCallback = function () {
            appConfig.container_name = dir === 'dist' ? 'release' : 'test';
            appConfig.container_name += '_' + appConfig.widgetName + '.html';
            grunt.initConfig(fullConfig);
            if (dir === 'dist') {
                grunt.task.run(['clean:initial']);
            }
            grunt.task.run(['build_widget_internal', 'replace:container']);
        };
    };
    
    grunt.registerTask('build_widget_internal', [
        'clean:tmp',
        'concat',
        'uglify',
        'copy',

        // replace paths in html
        'replace:widget_html',

        // replace paths in css
        'replace:css_bundle',

        'clean:tmp'
    ]);
};
