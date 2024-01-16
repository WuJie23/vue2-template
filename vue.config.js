const { defineConfig } = require("@vue/cli-service");
const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = defineConfig({
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  // 关闭eslint语法验证
  lintOnSave: false,
  devServer: {
    // 关闭eslint语法验证
    // overlay: {
    //   warning: false,
    //   errors: false,
    // },
    
  },
  chainWebpack(config) {
     // set svg-sprite-loader
     config.module
     .rule('svg')
     .exclude.add(resolve('src/icons'))
     .end()
   config.module
     .rule('icons')
     .test(/\.svg$/)
     .include.add(resolve('src/icons'))
     .end()
     .use('svg-sprite-loader')
     .loader('svg-sprite-loader')
     .options({
       symbolId: 'icon-[name]'
     })
     .end()
  },

  transpileDependencies: true,
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    resolve: {
      alias: {
        "@": resolve("src"),
      },
      fallback: {
        "path": require.resolve("path-browserify")
      }
    },
  },
});
