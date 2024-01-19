import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)

// https://webpack.js.org/guides/dependency-management/#requirecontext

/*
使用了 require.context 来在指定目录中动态导入模块。
'./modules' 是基础目录，即从哪个目录开始搜索模块。
true 表示要递归地搜索子目录。
/\.*js$/ 是一个正则表达式，用于匹配文件名以 .js 结尾的文件。
这段代码的作用通常是在构建时动态导入符合条件的模块，常见于使用像Webpack这样的模块打包工具的项目中。*/
const modulesFiles = require.context('./modules', true, /\.js$/)

// 您不需要“从中导入应用程序”/模块/应用程序'`
// 它将自动要求模块文件中的所有vuex模块
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

const store = new Vuex.Store({
  modules,
  getters
})

export default store