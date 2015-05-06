module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var appConfig = {
        widgetName: null,
        dir: 'dist_test',
        fsTargetDir: '',
        codeWidgetPath: './',
        shell_name: '',
        base_server: ''
    },
    
    thenCallback,
    
    fullConfig = {
        project: appConfig,

        copy: {
            dist_html: {
                flatten: true,
                src: ["app/widgets/<%= project.widgetName %>/template.html"],
                dest: '<%= project.fsTargetDir %>/',
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('template', 'index');
                }
            },
            dist_assets1: {
                flatten: true,
                src: ['tmp/app.bundle.min.js', 'app/css/main.min.css'],
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
//            shell: {
//                options: {
//                    patterns: [
//                        {
//                            match: /var template = '[^']+'/,
//                            replacement: "var template = '<%= project.widgetName %>/index.html'"
//                        }
//                    ]
//                },
//                src: 'app/index.html',
//                dest: 'app/<%= project.dir %>/<%= project.shell_name %>'
//            },
            widget_html: {
                options: {
                    patterns: [
                        {
                            match: /<!--dist scripts replace-->[\s\S]+<!--end dist scripts replace-->/,     // [\s\S]+ multiline match of any character
                            replacement: '<script type="text/javascript" src="app.bundle.min.js"></script>'
                        }, {
                            match: /<style>@import '[.\/]+css\/main\.min\.css';<\/style>/,
                            replacement: '<!--[if !IE]><!--><style>@import \'./main.min.css\';</style><!--<![endif]--> <!--[if IE]><link type="text/css" rel="stylesheet" href="/main.min.css" /><![endif]-->'
                        }, {
                            match: /src="[.\/]+img\//g,
                            replacement: 'src="<%= project.codeWidgetPath %>img/'
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
                            match: /url\((\.[.\/]+|\/)fonts/g,
                            replacement: 'url(<%= project.codeWidgetPath %>fonts'
                        },
                        {
                            match: /url\([.\/]+img/g,
                            replacement: 'url(<%= project.codeWidgetPath %>img'
                        }
                    ]
                },
                src: '<%= project.fsTargetDir %>/main.min.css',
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
    
    
    
    
    
    
    
    grunt.initConfig(watchConfig);
    grunt.registerTask('serve', 'Watch for changes in files', function () {
        grunt.task.run([
            'connect',
            'open',
            'watch'
        ]);
    });

    
    grunt.registerTask('build_widget', 'Build widget for production', function () {
        build_widget_prompt('dist');
    });
    
    
    grunt.registerTask('build_test', 'Build widget for testing', function () {
        build_widget_prompt('dist_test');
    });
    
    function build_widget_prompt(dir) {
        grunt.initConfig(promptConfig);
        grunt.task.run(['prompt']);
        thenCallback = function () {
            grunt.task.run('build:' + dir + ':' + appConfig.widgetName);
        };
    };
    
    
    grunt.registerTask('make_shell', 'Make shell file for uploading to sarine-widgets.synergetica.net', function () {
        var dir = this.args[0],
            isRelease = dir === 'dist',
            targetFilename = '';
        appConfig.dir = dir;
        
        thenCallback = function () {
//            fullConfig.template.shell.files['app/' + appConfig.widgetName + '.html'] = ['app/shell.tpl.html'];
            if (isRelease) {
                appConfig.base_server = 'http://sarine-widgets.synergetica.net';
                targetFilename = 'app/' + appConfig.widgetName;
            } else {
                appConfig.base_server = 'http://sarine-widgets.ho.ua';
                targetFilename = 'app/dist_test/test_' + appConfig.widgetName;
            }
            targetFilename += '.html';
            
            fullConfig.template.shell.files[targetFilename] = ['app/shell.tpl.html'];
            grunt.initConfig(fullConfig);
            grunt.task.run([
                'template'
            ]);
        };
        
        if (this.args[1]) {
            appConfig.widgetName = this.args[1];
            thenCallback();
        } else {
            grunt.initConfig(promptConfig);
            grunt.task.run(['prompt']);
        }
    });
    
    
    grunt.registerTask('build_all_test', 'Build all widgets for testing', function () {
        var widgets = getAllWidgets(),
            i,
            tasksList = [];
        for (i = 0; i < widgets.length; i++) {
            tasksList.push('build:dist_test:' + widgets[i]);
        }
        grunt.task.run(tasksList);
    });
    
    
    /**
     * grunt build:dist:w1.5
     * grunt build:dist_test:1.2
     */
    grunt.registerTask('build', 'Build specific widget for a specified target (release or test)', function () {
        var isRelease = this.args[0] === 'dist';
        appConfig.dir = this.args[0];
        appConfig.widgetName = this.args[1];
        
        appConfig.fsTargetDir = 'app/' + appConfig.dir;
        if (isRelease) {
//            appConfig.codeWidgetPath = './';
        } else {
//            appConfig.codeWidgetPath = '/' + appConfig.dir + '/' + appConfig.widgetName + '/';
            appConfig.fsTargetDir += '/' + appConfig.widgetName;
        }
        appConfig.shell_name = 'test_' + appConfig.widgetName + '.html';
        
        grunt.initConfig(fullConfig);
        
        conditionalExec([
            {task: 'clean:initial',         exec: isRelease},
            {task: 'clean:tmp',             exec: 1},
            {task: 'concat',                exec: 1},
            {task: 'uglify',                exec: 1},
            {task: 'copy',                  exec: 1},
            {task: 'replace:widget_html',   exec: 1},
            {task: 'replace:css_bundle',    exec: 1},
            {task: 'clean:tmp',             exec: 1},
            {task: 'make_shell:dist_test:' + appConfig.widgetName,         exec: !isRelease}
        ]);
    });
    
    
    
    /**
     * 
     * @param {Array} data     Pass the names of tasks and boolean values: {
     *      taskName1: true, taskName2: false
     * }
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
};
