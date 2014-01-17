'use strict';

module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', 'assemble']});

  grunt.initConfig({

    // Project metadata
    site: grunt.file.readYAML('_config.yml'),
    bower: grunt.file.readJSON('.bowerrc').directory,
    pkg: grunt.file.readJSON('package.json'),


    shell: {
      options: {stdout: true},
      npm: {
        command: 'npm install'
      },
      bower: {
        command: 'node ./node_modules/bower/bin/bower install'
      }
    },

    watch: {
      options: {livereload: true},
      src: {
        // No tasks are defined in this target, so these won't
        // trigger anything to build
        files: ['<%= site.src %>/**/*.{html,htm,js,css}', 'test/**/*.{html,htm,js,css}']
      },
      assemble: {
        files: [
          '<%= assemble.pages.src %>',
          '<%= assemble.issues.src %>',
          // '<%= assemble.articles.src %>',
          '<%= site.src %>/issues/**/*.md',
          '<%= site.layouts %>/*.hbs',
          '<%= site.data %>',
          '<%= site.partials %>'
        ],
        tasks: ['clean:out', 'assemble:pages', 'assemble:issues', 'assemble:articles']
      }
    },


    connect: {
      options: {
        port: 9000,
        livereload: true,
        hostname: 'localhost'
      },
      devserver: {
        options: {
          open: false,
          base: ['<%= site.src %>', '<%= site.dest %>', 'test']
        }
      }
    },


    assemble: {
      options: {
        flatten: false,
        assets: '<%= site.assets %>/',

        // Metadata
        pkg: '<%= pkg %>',
        site: '<%= site %>',
        data: ['<%= site.data %>'],

        // Templates
        partials: ['<%= site.partials %>/*.hbs'],
        layoutdir: '<%= site.layouts %>',

        // Extensions
        helpers: ['<%= site.helpers %>'],
        plugins: ['<%= site.plugins %>'],
        contextual: {
          dest: 'tmp/'
        }
      },
      pages: {
        options: {layout: 'page.hbs'},
        expand: true,
        cwd: '<%= site.src %>',
        src: ['*.hbs', '!_*/**', '!index.hbs'],
        dest: '<%= site.dest %>/'
      },
      //something is not 100% correct here
      issues: {
        options: {layout: 'issue.hbs'},
        expand: true,
        cwd: '<%= site.src %>/issues',
        src: ['../index.hbs', '**/index.hbs', '!_*/**'], //only do index.hbs
        dest: '<%= site.dest %>/issues/'
      },
      articles: {
        options: {layout: 'article.hbs'},
        expand: true,
        cwd: '<%= site.src %>/issues',
        src: ['**/*.md', '!**/intro.md'],
        dest: '<%= site.dest %>/issues/'
      }
    },

    clean: {
      options: { force: false },
      out: ['<%= site.dest %>/*']
    },

    copy: {
      source: {
        expand: true,
        cwd: '<%= site.src %>/',
        src: ['**', '!**/*.hbs', '!_*/**', '.htaccess'],
        dest: '<%= site.dest %>/'
      },
      fonts: {
        expand: true,
        cwd: '<%= bower %>/bootstrap/fonts/',
        src: ['**'],
        dest: '<%= site.dest %>/fonts/'
      }
    },

    useminPrepare: {
      options: {
        dest: '<%= site.dest %>'
      },
      html: '<%= site.dest %>/index.html'
    },

    usemin: {
      options: {
        dirs: ['<%= site.dest %>']
      },
      html: ['<%= site.dest %>/**/*.html'],
      css: ['<%= site.dest %>/styles/**/*.css']
    },

    htmlmin: {
      dist: {
        options: {
          removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          //removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          //removeEmptyAttributes: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= site.dest %>',
          src: '**/*.html',
          dest: '<%= site.dest %>'
        }]
      }
    },

    //imagemin: {
    //  dist: {
    //    files: [{
    //      expand: true,
    //      cwd: '<%= site.src %>/images',
    //      src: '**/*.{png,jpg,jpeg,gif,webp}',
    //      dest: '<%= site.dest %>/images'
    //    }]
    //  }
    //},

    //svgmin: {
    //  dist: {
    //    files: [{
    //      expand: true,
    //      cwd: '<%%= site.src %>/images',
    //      src: '{,*/}*.svg',
    //      dest: '<%%= site.dest %>/images'
    //    }]
    //  }
    //},

    jshint: {
      options: {jshintrc: '.jshintrc'},
      files: [
        'Gruntfile.js',
        'src/scripts/*.js'
      ]
    },

    rev: {
      files: {
        src: [
          '<%= site.dest %>/scripts/{,*/}*.js',
          '<%= site.dest %>/styles/{,*/}*.css'
        ]
      }
    },

    //less: {
    //  styles: {
    //    files: {
    //      '<%= site.dest %>/styles/**/*.*': ['<%= site.src %>/styles/**/*.less']
    //    }
    //  }
    //},

    //'bower-install': {
    //  target: {
    //    html: 'out/index.html' // point to your HTML file.
    //  }
    //},

    'gh-pages': {
      options: {
        base: 'out',
        branch: 'gh-pages'
      },
      src: ['**/*']
    },

    rsync: {
      options: {
        args: ["--verbose", "--delete"],
        recursive: true
      },
      dist: {
        options: {
          src: "<%= site.dest %>/",
          dest: "<%= site.dist %>"
        }
      }
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%= connect.devserver.options.hostname %>:<%= connect.devserver.options.port %>/test.html'],
          globals: ['$']
        }
      }
    }

  });


  grunt.registerTask('install', ['shell:npm', 'shell:bower']);
  grunt.registerTask('server', ['connect:devserver', 'watch']);
  grunt.registerTask('run', ['clean', 'assemble', 'server']);

  // Build
  grunt.registerTask('run:build', ['build', 'server']);
  grunt.registerTask('build', [
    'copy',
    //'imagemin',
    'useminPrepare',
    'concat',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  // Deploy
  grunt.registerTask('deploy:rsync', ['build', 'rsync']);
  grunt.registerTask('deploy', ['build', 'gh-pages']);

  // Tests to be run
  grunt.registerTask('test', ['assemble', 'connect:devserver', 'mocha']);

  // The default task to be run with the `grunt` command
  grunt.registerTask('default', ['clean', 'test', 'build']);
};
