module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var appConfig = {
        widgetName: null,
        dir: 'dist',
        fsTargetDir: '',
        fsSourceDir: '',
        codeWidgetPath: './',
        getCssFilename: getCssFilename
    },
    
    thenCallback,
    
    fullConfig = {
        project: appConfig,

        version: {},

        copy: {
            app: {
                src: 'app/js/app.<%= project.type %>.js',
                dest: 'tmp/app.js'
            },
            dist_html: {
                flatten: true,
                src: ['<%= project.fsSourceDir %>/template.html'],
                dest: '<%= project.fsTargetDir %>/',
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('template', 'index');
                }
            },
            dist_assets1: {
                flatten: true,
                src: [
                    'tmp/app.bundle.min.js',
                    '<%= project.fsSourceDir %>/widgetConfig.js',
                    '<%= project.fsSourceDir %>/version.json'
                ],
                dest: '<%= project.fsTargetDir %>/',
                expand: true
            },
            dist_assets2: {
                src: ['app/fonts/**', 'app/img/**'],
                dest: "<%= project.fsTargetDir %>/",
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('app\/', '');
                }
            },
            dist_css_widget: {
                flatten: true,
                src: ['app/css/main.min.css'],
                dest: '<%= project.fsTargetDir %>/',
                expand: true
            },
            dist_css_dashboard: {
                flatten: true,
                src: ['tmp/dashboard.min.css'],
                dest: '<%= project.fsTargetDir %>/',
                expand: true
            }
        },

        clean: {
            tmp: ['tmp']
        },

        concat: {
            options: {
                separator: ';'
            },
            dist_js: {
                src: [
                    // order of elements is important!
                    'app/js/vendor/*.js',
                    'app/js/*.js',
                    'tmp/app.js',
                    '!app/js/app.bundle.min.js',
                    '!app/js/text.js',
                    '!app/js/app.widget.js',
                    '!app/js/app.dashboard.js'
                ],
                dest: 'tmp/app.bundle.js'
            },
            banner_html: {
                options: {
                    stripBanners: true,
                    banner: '<!-- \n   ! <%= version.codename %> - v<%= version.full %> - <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>\n-->\n'
                },
                files: {
                    '<%= project.fsTargetDir %>/index.html': ['<%= project.fsTargetDir %>/index.html']
                }
            },
            banner_css: {
                options: {
                    stripBanners: true,
                    banner: '/* \n   ! <%= version.codename %> - v<%= version.full %> - <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>\n*/\n'
                },
                files: {
                    '<%= project.fsTargetDir %>/<%= project.getCssFilename() %>': ['<%= project.fsTargetDir %>/<%= project.getCssFilename() %>']
                }
            },
            banner_js: {
                options: {
                    stripBanners: true,
                    banner: '/* \n   ! <%= version.codename %> - v<%= version.full %> - <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>\n*/\n'
                },
                files: {
                    '<%= project.fsTargetDir %>/app.bundle.min.js': ['<%= project.fsTargetDir %>/app.bundle.min.js']
                }
            }
        },

        uglify: {
            dist: {
                src: ['tmp/app.bundle.js'],
                dest: 'tmp/app.bundle.min.js'
            }
        },

        replace: {
            widget_html: {
                options: {
                    patterns: [
                        {
                            match: /<!--dist scripts replace-->[\s\S]+<!--end dist scripts replace-->/,     // [\s\S]+ multiline match of any character
                            replacement: '<script type="text/javascript" src="app.bundle.min.js"></script>'
                        },
                        {
                            match: /<style>@import '[\.\/]*css\/main\.min\.css';<\/style>/,
                            replacement: '<link type="text/css" rel="stylesheet" href="./main.min.css" />'
                        },
                        {
                            match: /<style>@import '[\.\/]*css\/dashboard\.css';<\/style>/,
                            replacement: '<link type="text/css" rel="stylesheet" href="./dashboard.min.css" />'
                        },
                        {
                            match: /src="[.\/]+img\//g,
                            replacement: 'src="<%= project.codeWidgetPath %>img/'
                        },
                        {
                            match: /src="\/dist\/common\/text\.js"/,
                            replacement: 'src="http://dev.sarineplatform.com.s3.amazonaws.com/qa4/content/viewers/templates/common/text.js"'
                        }
                    ]
                },
                src: '<%= project.fsTargetDir %>/index.html',
                dest: '<%= replace.widget_html.src %>'
            },
            css_bundle: {
                options: {
                    patterns: [
                        {
                            match: /url\((\.[.\/]*|\/)fonts/g,
                            replacement: 'url(<%= project.codeWidgetPath %>fonts'
                        },
                        {
                            match: /url\([\.\/]*img/g,
                            replacement: 'url(<%= project.codeWidgetPath %>img'
                        },
                        {
                            // remove iefix
                            match: /(src:)[^,;]+,/g,
                            replacement: '$1'
                        }
                    ]
                },
                src: '<%= project.fsTargetDir %>/<%= project.getCssFilename() %>',
                dest: '<%= replace.css_bundle.src %>'
            }
        },
        
        template: {
            shell: {
                options: {
                    data: appConfig
                },
                files: {}
            }
        },
        
        cssmin: {
            target: {
                options: {
                    report: 'min',
                    roundingPrecision: -1
                },
                files: {
                    'tmp/dashboard.min.css': 'app/css/dashboard.css'
                }
            }
        },
        
        appcache: {
            options: {
                // Task-specific options go here. 
                basePath: '<%= project.fsTargetDir %>'
            },
            target1: {
                dest: '<%= project.fsTargetDir %>/cache.manifest',
                cache: {
                    patterns: [
                        '<%= project.fsTargetDir %>/img/**/*',
                        '<%= project.fsTargetDir %>/fonts/**/*',
                        '<%= project.fsTargetDir %>/app.bundle.min.js',
                        '<%= project.fsTargetDir %>/main.min.css'
                    ]
                },
                network: '*'
            }
        }
    },
    
    watchConfig = {
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

        sass: {
            dist: {
                options: {
                    style: 'nested',
                    sourcemap: 'none',
                    compass: true,
                    update: true
                },
                files: {
                    'app/css/dashboard.css': 'app/sass/dashboard/main.scss'
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
            default: {
                options: {
                    livereload: true
                },
                files: [
                    'app/**/*'
                ],
                sass: {
                    options: {
                        livereload: false
                    },
                    files: 'app/sass/widgets/**/*.scss',
                    tasks: ['compass:dev', 'cssmin']
                }
            },
            dashboard: {
                files: ['app/sass/dashboard/**/*.scss', 'app/index.html', 'app/widgets/dashboard/*', 'app/js/**/*.js'],
                tasks: ['sass'],
                options: {
                    livereload: true
                }
            }
        }
    },
    
    promptConfig = {
        prompt: {
            target: {
                options: {
                    questions: [
                        {
                            config: 'project.widgetName',
                            type: 'list',
                            message: 'Select a widget to process',
                            choices: getAllWidgets(),
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
    };
    
    
    
    
    
    
    
    grunt.registerTask('serve', 'Watch for changes in files', function () {
        grunt.initConfig(watchConfig);
        grunt.task.run([
            'connect',
            'open',
            'watch:default'
        ]);
    });



    grunt.registerTask('dashboard', 'watching...', function () {
        grunt.initConfig(watchConfig);
        grunt.task.run([
            'connect',
            'open',
            'watch:dashboard'
        ]);
    });


    
    grunt.registerTask('build_widget', 'Build widget for production', function () {
        grunt.initConfig(promptConfig);
        grunt.task.run(['prompt']);
        thenCallback = function () {
            grunt.task.run('build:widget:' + appConfig.widgetName);
        };
    });
    
    
    
    grunt.registerTask('build_dashboard', 'Build dashboard for production', function () {
        grunt.initConfig(promptConfig);
        grunt.task.run(['prompt']);
        thenCallback = function () {
            grunt.task.run('build:dashboard:' + appConfig.widgetName);
        };
    });
    
    
    
    /**
     * Examples:
     * grunt build:widget:w1.5
     * grunt build:dashboard:dashboard
     */
    grunt.registerTask('build', 'Build specific widget for a specified target (release or test)', function () {
        appConfig.type = this.args[0];
        appConfig.widgetName = this.args[1];
        
        appConfig.fsSourceDir = 'app/widgets/' + appConfig.widgetName;
        appConfig.fsTargetDir = 'app/dist/' + appConfig.widgetName;
        fullConfig.version = grunt.file.readJSON(appConfig.fsSourceDir + '/version.json');
        appConfig.version = fullConfig.version;
        
        grunt.initConfig(fullConfig);
        
        conditionalExec([
            {task: 'clean',                 exec: 1},
            {task: 'copy:app',              exec: 1},
            {task: 'cssmin',                exec: appConfig.type === 'dashboard'},
            {task: 'concat:dist_js',        exec: 1},
            {task: 'uglify',                exec: 1},
            {task: 'copy:dist_html',        exec: 1},
            {task: 'copy:dist_assets1',     exec: 1},
            {task: 'copy:dist_assets2',     exec: 1},
            {task: 'copy:dist_css_widget',  exec: appConfig.type === 'widget'},
            {task: 'copy:dist_css_dashboard', exec: appConfig.type === 'dashboard'},
            {task: 'replace:widget_html',   exec: 1},
            {task: 'replace:css_bundle',    exec: 1},
            {task: 'clean',                 exec: 1},
//            {task: 'appcache',              exec: 1},
            {task: 'concat:banner_html',    exec: 1},
            {task: 'concat:banner_css',     exec: 1},
            {task: 'concat:banner_js',      exec: 1}
        ]);
    });
    
    
    
    /**
     * 
     * @param {Array} data     Pass the names of tasks and boolean values: [
     *      {task: 'taskName1', exec: true},
     *      {task: 'taskName2', exec: false}
     * ]
     * @returns {void}
     */
    function conditionalExec(data) {
        var i,
            tasklist = [];
        for (i = 0; i < data.length; i++) {
            if (!!data[i].exec) {
                tasklist.push(data[i].task);
            }
        }
        grunt.task.run(tasklist);
    }
    
    
    /**
     * Returns array of all subdirs names in 'app/widgets/ dir
     * 
     * @returns {Array} Array of widgets names
     */
    function getAllWidgets() {
        var widgets = [];
        grunt.file.expand('app/widgets/*').forEach(function (w) {
            var wDirname = w.split('/').pop();
            widgets.push(wDirname);
        });
        return widgets;
    }
    
    
    /**
     * Return filename for css bundle depending on task type (widget or dashboard)
     */
    function getCssFilename() {
        var result;
        if (appConfig.type === 'widget') {
            result = 'main';
        } else {
            result = 'dashboard';
        }
        return result + '.min.css';
    }
};
