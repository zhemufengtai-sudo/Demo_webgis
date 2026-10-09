'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    var path = require('path');

    /**
     * Resolve external project resource as file path
     */
    function resolvePath(project, file) {
        return path.join(path.dirname(require.resolve(project)), file);
    }

    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //把多个模块中用到的相同的东西放在这里，这样只用改一遍就行了
        config: {
            sources: 'views',
            public:'public'
        },

        // uglify:{
        //     options: {
        //         banner: bannerContent,
        //         sourceMapRoot: '../',
        //         sourceMap: 'distrib/' + name + '.min.js.map',
        //         sourceMapUrl: name + '.min.js.map'
        //     },
        //     target: {
        //         expand: true,
        //         cwd: '<%=config.sources %>',
        //         src: '*.js',
        //         dest: ''
        //     }
        // },

        jshint: {
            src: [
                ['<%=config.sources %>/**/*.js']
            ],
            options: {
                jshintrc: true,
                esversion: 6
            }
        },

        csslint:{
            all:{
                src:['<%= config.sources %>/**/*.js']
            }
        },

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true,
                    list: true,
                    // make sure we do not include browser shims unnecessarily
                    insertGlobalVars: {
                        process: function () {
                            return 'undefined';
                        },
                        Buffer: function () {
                            return 'undefined';
                        }
                    }
                },
                transform: [ 'brfs' ]
            },
            watch: {
                options: {
                    watch: true
                },
                files: {
                    '<%= config.public %>/js/browserBundle.js': [
                        '<%= config.sources %>/**/*.js',
                        resolvePath('bson','lib/bson/objectid')
                    ]
                }
            }
        },

        copy: {
            js:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= config.sources %>',
                        src:['**/*.js'],
                        dest:'<%= config.public %>/js'
                    }
                ]
            },
            css:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= config.sources %>',
                        src:['**/*.css'],
                        dest:'<%= config.public %>/css'
                    }
                ]
            }
        },

        watch: {
            options: {
                livereload: 2345
            },
            js: {
                files: [ '<%= config.sources %>/**/*.js'],
                tasks: [ 'browserify:watch' ]
            },
            css:{
                files: [ '<%= config.sources %>/**/*.css' ],
                tasks: [ 'copy:css']
            },
            ejs:{
                files: [ '<%= config.sources %>/**/*.ejs' ],
                tasks: [ 'browserify:watch']
            }
        },
    });

    // tasks
    grunt.registerTask('default', [
        // 'csslint',
        'jshint',
        'copy:css',
        'browserify:watch',
        'watch'
    ]);
};
