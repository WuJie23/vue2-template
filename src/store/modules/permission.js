import { asyncRoutes, constantRoutes } from '@/router'

/*
store/modules/permission.js
不同用户角色权限的分配
如果是admin角色就添加整个异步路由表单
如果是普通用户角色就递归筛选asyncRoutes异步路由表 循环每一条异步路由
把异步路由的每一条及其子路由递归出来 与 当前的用户角色匹配(路由原信息meta.roles与当前roles)*/

/**
 * 使用meta.role确定当前用户是否具有权限
 * @param roles 用户权限角色
 * @param route 递归出来的每一个异步路由
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 通过递归筛选asyncRoutes异步路由表 匹配出对应roles角色的路由表
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {//用户角色有这条权限路由
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)//添加进路由表
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // roles  通过用户角色权限获取权限路由
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      /*includes 可以判断一个数组中是否包含某一个元素，并返回true 或者false
        ['a','b','c'].includes('a')
        true */
      if (roles.includes('admin')) {//如果是admin asyncRoutes路由添加
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}