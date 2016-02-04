module.exports = function wallabyConfig (wallaby) {
  return {

    files: [
      './src/**/*.js'
    ],

    tests: [
      './test/**/*.js'
    ],

    compilers: {
      './src/**/*.js': wallaby.compilers.babel()
    },

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'tape'
  }
}
