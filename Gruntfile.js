var _ = require("underscore");
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist: {
                src: ['build/']
            }
        },
        webpack: {
            dist: {
                entry: "./src/js/app.jsx",
                output: {
                    path: "./build/",
                    filename: "app.js",
                },
                module: {
                    resolve: {
                        extensions: ['', '.js', '.jsx']
                    },
                    loaders: [{
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        loaders: ["babel-loader"]
                    }]
                }
            }
        },
        concat: {
            options: {
                separator: ';\n',
                stripBanners: true,
            },
            config: {
                src: ['src/js/config/base.js', 'src/js/config/layers/*.js', 'src/js/config/lessons/*.js'],
                dest: 'src/js/config.js'
            },
            classes: {
                src: ['src/js/classes/FOI.js', 'src/js/classes/Lesson.js', 'src/js/classes/LessonGroup.js'],
                dest: 'src/js/classes.js'
            },
            app: {
                src: ['src/js/requires.js','src/js/classes.js', 'src/js/config.js','src/js/base.jsx'],
                dest: 'src/js/app.jsx'
            },
            lib: {
                src: ['src/js/lib/ol-debug.js', 'src/js/lib/jquery-2.1.1.min.js', 'src/js/lib/materialize.min.js', 'src/js/lib/tinycolor.js'],
                dest: 'build/libs.js'
            }
        },
        sass: {
            dist: {
                files: {
                    'src/stylesheets/app.css': 'src/stylesheets/app.scss'
                }
            }
        },
        concat_css: {
            options: {
                sourceMapStyle: 'inline'
            },
            all: {
                src: ["src/stylesheets/lib/*.css", "src/stylesheets/*.css"],
                dest: "build/app.css"
            }
        },
        autoprefixer: {
            options: {},
            dist: {
                files: {
                    'build/app.css': 'build/app.css'
                }
            }
        },
        copy: {
            data: {
                expand: true,
                cwd: 'src/data',
                src: '**',
                dest: 'build/data',
            },
            index: {
                expand: true,
                files: {
                    'build/index.html': ['src/index.html']
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js','src/**/*.jsx', 'src/*.html', 'src/stylesheets/app.scss'],
                tasks: ['default'],
                options: {
                    spawn: false,
                    livereload: true
                },
            },
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-md2html');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-webpack');
    // Default task(s).
    grunt.registerTask('default', ['clean', 'sass', 'concat_css', 'autoprefixer', 'copy', 'concat', 'webpack']);
};
