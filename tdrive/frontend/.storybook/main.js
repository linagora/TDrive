const path = require('path');
const alias = require('../tsconfig.paths.json');
const webpack = require("webpack");

module.exports = {
  stories: ['../src/app/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    'storybook-dark-mode',
  ],
  framework: '@storybook/react',
  webpackFinal(config, { configType }) {
    let updatedAlias = {};
    for (const key in alias?.compilerOptions?.paths || {}) {
      updatedAlias[key.replace(/\/\*$/, '')] = path.resolve(
        __dirname,
        '../' + alias?.compilerOptions?.paths?.[key][0].replace(/\/\*$/, ''),
      );
    }
    config = {
      ...config,
      resolve: {
        ...config.resolve,
        roots: [
          ...(config.resolve.roots || []),
          path.resolve(__dirname, '../public'),
          'node_modules',
        ],
        alias: {
          ...updatedAlias,
          ...config.resolve.alias,
        },
      },
    };

    config.module.rules.push({
      test: /\,css&/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [require('tailwindcss'), require('autoprefixer')],
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    });

    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /languages-service/,
        path.resolve(__dirname, './__mocks__/languages-service.js'),
      )
    );

    return config;
  },
  babel: async options => ({
    ...options,
    presets: [
      ...options.presets,
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
        },
        'preset-react-jsx-transform', // Can name this anything, just an arbitrary alias to avoid duplicate presets'
      ],
    ],
  }),
  core: {
    builder: 'webpack5',
  }
};
