module.exports = function(grunt) {
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'jshint': {
      all: [
        'package.json',
        'Gruntfile.js',
        'server.js',
        'client/json/*.json',
        'client/json/**/*.json',
        'client/js/*.js',
        'client/js/**/*.js'
      ]
    },
    'cssmin': {
      target: {
        files: [{
          expand: true,
          cwd: 'client/styles',
          src: ['*.css', '!*.min.css'],
          dest: 'client/bundle',
          ext: '.min.css'
        }]
      }
    },
    'uglify': {
      target: {
        files: [{
          src: 'client/js/game.js',
          dest: 'client/bundle/js/game.min.js',
        },{
          src: 'client/js/**/*.js',
          dest: 'client/bundle/js/after.min.js'
        }]
      }
    },
    'concat': {
      options: {
        banner: '/*! <%= pkg.name %> grunt <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %> */\n'
      },
      js: {
        src: ['browser_modules/**/*.min.js',
              'client/bundle/js/game.min.js',
              'client/bundle/js/after.min.js'],
        dest: 'client/bundle/game.min.js'
      }
    },
    'clean':  ['client/bundle/js']
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['jshint', 'cssmin', 'uglify', 'concat', 'clean']);
};
