module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'standard',
    'plugin:vue/recommended'
  ],
  plugins: [
    'import'
  ],
  settings: {
    // https://github.com/benmosher/eslint-plugin-import/tree/master/resolvers/webpack
    'import/resolver': {

      alias: {
        map: [
          ['~', '.']
        ],
        extensions: ['.js', '.vue', '.json']
      }
    }
  },
  // add your custom rules here
  rules: {
    'vue/no-v-html': 'off'
  }
}
