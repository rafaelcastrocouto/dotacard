module.exports = function(grunt) {
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'jshint': {
      all: ['Gruntfile.js', 'server.js', 'client/*.js', 'client/modules/*.js']
    },
    'cssmin': {
      target: {
        files: [{
          expand: true,
          cwd: 'client/styles',
          src: ['*.css', '!*.min.css'],
          dest: 'client/bundle/css',
          ext: '.min.css'
        }]
      }
    },
    'uglify': {
      target: {
        files: [{
          expand: true,
          cwd: 'client/modules',
          src: ['*.js', '!*.min.js'],
          dest: 'client/bundle/js/modules',
          ext: '.min.js'
        },{
          expand: true,
          cwd: 'client/skills',
          src: ['*.js'],
          dest: 'client/bundle/js/skills',
          ext: '.min.js'
        },{
          expand: true,
          cwd: 'client',
          src: ['*.js'],
          dest: 'client/bundle/js',
          ext: '.min.js'
        }]
      }
    },
    'concat': {
      options: {
        banner: '/*! <%= pkg.name %> grunt <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %> */\n'
      },
      css: {
        src: ['browser_modules/*/*.min.css',
              'client/bundle/css/*.min.css'],
        dest: 'client/bundle/game.min.css',
      },
      lib: {
        src: ['browser_modules/*/*.min.js'],
        dest: 'client/bundle/lib/libraries.min.js'
      },
      js: {
        src: ['browser_modules/*/*.min.js',
              'client/bundle/js/*.min.js',
              'client/bundle/js/modules/*.min.js',
              'client/bundle/js/skills/*.min.js'],
        dest: 'client/bundle/game.min.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['jshint', 'cssmin', 'uglify', 'concat']);
};
