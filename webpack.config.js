const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const PurgecssWebpackPlugin = require('purgecss-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const glob = require('glob'); // 文件匹配模式
const PATHS = {
  src: path.join(__dirname, 'src'),
};

module.exports = {
  // 入口出口配置
  entry: path.resolve(__dirname, 'src/index.jsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    publicPath: '/',
  },

  plugins: [
    // 配置模板html
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    // 分离css
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].css',
    }),
    // 打包前先清空目录
    new CleanWebpackPlugin(),
    // 构建速度分析
    //  new SpeedMeasureWebpackPlugin(),
    //  构建体积分析
    //  new WebpackBundleAnalyzer(),
    // 清除无用的css 必须搭配分离css使用
    new PurgecssWebpackPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    }),
  ],

  // 配置本地服务
  devServer: {
    //     contentBase: path.join(__dirname, 'dist'), //启动后外界访问资源的路径
    static: {
      directory: path.join(__dirname, 'dist'), //启动后外界访问资源的路径
    },
    port: '8080',
    host: 'localhost',
    // 打开模块热替换
    hot: true,
  },

  resolve: {
    // 配置别名
    alias: {
      '~': path.resolve('src'),
      '@': path.resolve('src'),
      components: path.resolve('src/components'),
    },
    // 配置需要解析的后缀，引入的时候不带扩展名，webpack会从左到右依次解析
    extensions: ['.js', '.jsx', '.json', '.wasm', '.less', '.html', '.css'],
  },

  // 配置内联资源，即打包的时候不必引入
  //   externals: {
  //     react: 'React',
  //     'react-dom': 'ReactDOM',
  //   },

  // 配置loader
  module: {
    rules: [
      // 支持加载css文件
      {
        test: /\.css/,
        use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader'],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        sideEffects: true,
      },
      {
        test: /\.less/,
        use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader', 'less-loader'],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        sideEffects: true,
      },
      // 支持加载图片
      //       {
      //         test: /.(gif|jpg|png|bmp|eot|woff|woff2|ttf|svg)/,
      //         use: [
      //           {
      //             loader: 'url-loader',
      //             options: {
      //               limit: 8192,
      //               outputPath: 'images',
      //             },
      //           },
      //         ],
      //       },

      // webpack5新增对图片文件的处理
      {
        test: /\.(jpe?g|png|gif)$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          // [ext] 自带 "." 这个与 url-loader 配置不同
          filename: '[name][ext]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 50 * 1024, //超过50kb不转 base64
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          filename: '[name][chunkhash:8][ext]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 超过100kb不转 base64
          },
        },
      },

      //支持转义ES6/ES7/JSX
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/react'],
              plugins: [[require('@babel/plugin-proposal-decorators'), { legacy: true }]],
              cacheDirectory: true, // 启用缓存
            },
          },
        ],
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
    ],
  },

  // 缓存配置 https://webpack.docschina.org/configuration/cache/#cache
  cache: {
    type: 'filesystem', // 开启持久化缓存
    //     version: createEnvironmentHash(env.raw), // 参考react脚手架的配置 可以记录打包缓存的版本
    cacheDirectory: path.appWebpackCache,
    store: 'pack',
    // 构建依赖，如果有文件修改，则重新执行打包流程
    buildDependencies: {
      defaultWebpack: ['webpack/lib/'],
      config: [__filename],
    },
  },

  // 优化配置
  optimization: {
    minimizer: [
      // 配置压缩js
      new UglifyWebpackPlugin({
        parallel: 4, // 使用多进程来运行提高构建速度
        // 配置移除的语句 生产环境生效
        uglifyOptions: {
          compress: {
            drop_console: true, //传true就是干掉所有的console.*这些函数的调用.
            drop_debugger: true, //干掉那些debugger;
            //     pure_funcs: ['console.log'], // 如果你要干掉特定的函数比如console.info ，又想删掉后保留其参数中的副作用，那用pure_funcs来处理   }  }
          },
        },
      }),
      // 配置压缩css
      new OptimizeCssAssetsWebpackPlugin(),
      // 与 UglifyWebpackPlugin 效果相同, UglifyWebpackPlugin已经弃用
      new TerserWebpackPlugin({
        // 配置移除的语句
        terserOptions: {
          compress: {
            drop_console: true, //传true就是干掉所有的console.*这些函数的调用.
            drop_debugger: true, //干掉那些debugger;
            //     pure_funcs: ['console.log'], // 如果你要干掉特定的函数比如console.info ，又想删掉后保留其参数中的副作用，那用pure_funcs来处理   }  }
          },
        },
      }),
    ],
    // 启动摇树优化
    //     usedExports: true,
    //     minimize: true,

    //代码分割 默认配置
    splitChunks: {
      chunks: 'async', // 有效值为 `all`，`async` 和 `initial`
      minSize: 20000, // 生成 chunk 的最小体积（≈ 20kb)
      minRemainingSize: 0, // 确保拆分后剩余的最小 chunk 体积超过限制来避免大小为零的模块
      minChunks: 1, // 拆分前必须共享模块的最小 chunks 数。
      maxAsyncRequests: 5, // 最大的按需(异步)加载次数
      maxInitialRequests: 3, // 打包后的入口文件加载时，还能同时加载js文件的数量（包括入口文件）
      enforceSizeThreshold: 50000,
      cacheGroups: {
        // 配置提取模块的方案
	// 从 webpack 5 开始，不再允许将 entry 名称传递给 {cacheGroup}.test 或者为 {cacheGroup}.name 使用现有的 chunk 的名称。
        defaultVendors: {
          test: /[\/]node_modules[\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: 'vendors',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          name: 'default',
        },
        react: {
          test: /(react|react-dom)/, // 匹配chunk的名称
          name: 'react', //打包后的文件名
          chunks: 'all',
          priority: 13, // 优先级 越高则先处理
        },
      },
    },
  },
};
