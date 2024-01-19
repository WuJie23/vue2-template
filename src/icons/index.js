import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'// svg component

// register globally
Vue.component('svg-icon', SvgIcon)//全局注册svg-icon组件

const req = require.context('./svg', false, /\.svg$/)//全局生成上下文  在全局寻找./svg目录下以.svg结尾的文件
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
