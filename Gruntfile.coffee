'use strict'

module.exports = (grunt) ->

  require('load-grunt-tasks')(grunt)
  require('time-grunt')(grunt)

  grunt.initConfig

    meta:
      src: 'src'
      lib: 'lib'
      dist: 'dist'

    watch:
      coffee:
        files: ['./src/*.{coffee,litcoffee,coffee.md}']
        tasks: ['build']

      coffeeTest:
        files: ['test/{,*/}*.{coffee,litcoffee,coffee.md}']
        tasks: ['test']

      gruntfile:
        files: ['Gruntfile.coffee']

    uglify:
      dist:
        files:
          'dist/kiwicrypto.min.js': ['dist/kiwicrypto.js']

    browserify:
      main:
        src: ['./lib/kiwicrypto.js']
        dest: 'dist/kiwicrypto.js'
        options:
          alias: [
            "./lib/kiwicrypto.js:KiwiCrypto"
            "./lib/base64.js:Base64"
            "./lib/random.js:Random"
            "./lib/bigint.js:BigInt"
            "./lib/hmacsha256.js:HmacSHA256"
            "./lib/sha256.js:SHA256"
          ]
          ignore: ['./lib/tests/*.js']

      test:
        src: ['./lib/*.js', './lib/tests/*.js']
        dest: 'dist/test_bundle.js'
        options:
          alias: [
            "./lib/kiwicrypto.js:KiwiCrypto",
            "./lib/base64.js:Base64"
            "./lib/random.js:Random"
            "./lib/bigint.js:BigInt"
            "./lib/hmacsha256.js:HmacSHA256"
            "./lib/sha256.js:SHA256"
          ]
          external: ['./lib/*.js']
          ignore: []


    docco:
      debug:
        src: ['src/*.coffee']
        options:
          output: 'docs/annotated_code/'

    codo:
      options:
        title: "KiwiCrypto library",
        output: 'docs',
        inputs: ['src/']


    jasmine:
      src: 'dist/kiwicrypto.js'
      options:
        specs: 'dist/test_bundle.js'

          

    coffeelint:
      app: ['src/*.coffee', 'test/**/*.coffee', 'Gruntfile.coffee']
      options:

        'cyclomatic_complexity':
          'level': 'warn'

        'no_trailing_whitespace':
          'level': 'error'
        'arrow_spacing':
          'level': 'error'
        'camel_case_classes':
          'level': 'error'
        'duplicate_key':
          'level': 'error'
        'empty_constructor_needs_parens':
          'level': 'error'
        'no_stand_alone_at':
          'level': 'error'
        'indentation':
          'level': 'error'
        'no_trailing_semicolons':
          'level': 'error'
        'space_operators':
          'level': 'error'


    clean:
      dist:
        files: [
          dot: true
          src: [
            '.tmp'
            '<%= meta.dist %>/*'
            '<%= meta.lib %>/*'
          ]
        ]


    coffee:
      options:
        sourceMap: false
        sourceRoot: ''
      dist:
        files: [
          expand: true
          cwd: '<%= meta.src %>'
          src: '*.coffee'
          dest: 'lib/'
          ext: '.js'
        ]
      test:
        files: [
          expand: true
          cwd: 'test'
          src: '{,*/}*.coffee'
          dest: 'lib/tests/'
          ext: '.js'
        ]





  grunt.registerTask 'test', [
    'build'
    'jasmine'
  ]

  grunt.registerTask 'docs', [
    'codo'
    'docco'
  ]

  grunt.registerTask 'build', [
    'clean'
    'coffeelint'
    'coffee'
    'browserify'
  ]

  grunt.registerTask 'dist', [
    'build'
    'jasmine'
    'uglify'
    'docs'
  ]


  grunt.registerTask 'default', [
    'test'
  ]

