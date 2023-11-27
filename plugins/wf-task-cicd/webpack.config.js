const path = require('path');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');


const stringReplaceLoaderOptions = require('./webpack/string-replace-loader-options');

const PUBLIC_DIR = path.join('public');
const DIST_DIR = path.resolve(__dirname, PUBLIC_DIR);

module.exports = (env, argv) => {
  let webpackConfig;
  const isDevelopment = argv.mode !== 'production';

  const htmlPlugin = new HtmlWebPackPlugin({
    template: './src/index.html',
    filename: './index.html'
  });
  const miniCssExtractPlugin = new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
  });
  const forkTsCheckerWebpackPlugin = new ForkTsCheckerWebpackPlugin();
  const terserPlugin = new TerserPlugin({
    extractComments: false,
  });
  const copyPlugin = new CopyPlugin({
    patterns: [
      {
        from: './src/schemas/',
        to: path.resolve(DIST_DIR, 'schemas')
      } 
    ]
  });

  webpackConfig = {
    entry: './src/main.tsx',
    output: {
      path: DIST_DIR,
      filename: '[name].[contenthash].js',
      clean: {
        keep: /(translations|schemas)\//i
      }
    },
    devtool: isDevelopment ? 'source-map' : false,
    watch: isDevelopment ? true : false,
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        terserPlugin,
      ],
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
          vendorStyles: {
            test: /[\\/]node_modules[\\/]/,
            type: 'css/mini-extract',
            name: 'vendor-styles',
            chunks: 'all',
            enforce: true,
          }
        }
      },
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader'
            }
          ]
        },
        {
          test: /\.js(x?)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.s?css$/,
          use: [
            {
              loader: isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader, // creates style nodes from JS strings
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
              options: { importLoaders: 2 }, // tell if that you are running your styles through two other loaders before this one should run
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'sass-loader' // compiles Sass to CSS
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 8192, // 2^13
          },
        },
        {
          test: /\.css$/,
          loader: 'string-replace-loader',
          include: [ /node_modules\/@qualtrics/ ],
          options: stringReplaceLoaderOptions,
        }
      ]
    },
    resolve: {
      alias: {
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        '@qualtrics/ui-react': path.resolve(__dirname, './node_modules/@qualtrics/ui-react'),
      },
      extensions: [ '.ts', '.tsx', '.js', '.jsx', '.css' ]
    },
    plugins: [
      htmlPlugin,
      miniCssExtractPlugin,
      forkTsCheckerWebpackPlugin,
      copyPlugin,
    ]
  };
  return webpackConfig;
};
