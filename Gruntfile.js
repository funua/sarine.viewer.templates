module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var appConfig = {
        widgetName: 'w2'        // must exactly match widget folder name
    };

    grunt.initConfig({
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
            dist_html: {
                flatten: true,
                src: ["app/widgets/<%= project.widgetName %>/template.html"],
                dest: "app/dist/<%= project.widgetName %>/",
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace("template", "index");
                }
            },
            dist_assets1: {
                flatten: true,
                src: ['tmp/app.bundle.min.js', 'app/css/main.min.css'],
                dest: "app/dist/<%= project.widgetName %>/",
                expand: true
            },
            dist_assets2: {
                src: ['app/fonts/**', 'app/img/**'],
                dest: "app/dist/<%= project.widgetName %>/",
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace("app\/", '');
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
            index_html: {
                options: {
                    patterns: [
                        {
                            match: /var template = '[^']+'/,
                            replacement: "var template = '<%= project.widgetName %>/index.html'"
                        }
                    ]
                },
                src: 'app/index.html',
                dest: 'app/dist/test_<%= project.widgetName %>.html'
            },
            dist_scripts_links: {
                options: {
                    patterns: [
                        {
                            match: /<!--dist scripts replace-->[\s\S]+<!--end dist scripts replace-->/,     // [\s\S]+ multiline match of any character
                            replacement: '<script type="text/javascript" src="app.bundle.min.js"></script>'
                        }
                    ]
                },
                src: 'app/dist/<%= project.widgetName %>/index.html',
                dest: '<%= replace.dist_scripts_links.src %>'
            },
            dist_css_link: {
                options: {
                    patterns: [
                        {
                            match: /@import '\.\.\/\.\.\/css\/main\.min\.css'/,
                            replacement: "@import '/dist/<%= project.widgetName %>/main.min.css'"
                        }
                    ]
                },
                src: 'app/dist/<%= project.widgetName %>/index.html',
                dest: '<%= replace.dist_css_link.src %>'
            },
            css_bundle_font_urls: {
                options: {
                    patterns: [
                        {
                            match: /url\(\.\.\/fonts/g,
                            replacement: "url(/dist/<%= project.widgetName %>/fonts"
                        }
                    ]
                },
                src: 'app/dist/<%= project.widgetName %>/main.min.css',
                dest: '<%= replace.css_bundle_font_urls.src %>'
            },
            css_bundle_img_urls: {
                options: {
                    patterns: [
                        {
                            match: /url\([./]+img/g,
                            replacement: "url(/dist/<%= project.widgetName %>/img"
                        }
                    ]
                },
                src: 'app/dist/<%= project.widgetName %>/main.min.css',
                dest: '<%= replace.css_bundle_img_urls.src %>'
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

    grunt.registerTask('build_widget', [
        'clean:tmp',
        'clean:initial',
        'concat',
        'uglify',
        'copy:dist_html',
        'copy:dist_assets1',
        'copy:dist_assets2',

        // replace paths in html
        'replace:dist_scripts_links',
        'replace:dist_css_link',

        // replace paths in css
        'replace:css_bundle_font_urls',
        'replace:css_bundle_img_urls',

        'clean:tmp'
    ]);
    
    grunt.registerTask('build_test', [
        'build_widget',
        'replace:index_html'
    ]);
};
