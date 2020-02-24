module.exports = {
  root: true,
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'prettier/vue'
  ],
  rules: {
    // @see: https://github.com/typescript-eslint/typescript-eslint/issues/1220
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error'
  }
}
