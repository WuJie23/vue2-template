import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // 进度条样式
import { getToken } from "@/utils/auth"; // 从cookie获取令牌
import getPageTitle from "@/utils/get-page-title";

/*
permission.js
全局异步路由监听
确定用户是否已登录/有无Token

如果已登录，判断是否去login，是则重定向到主页，不是则确定用户是否已通过getInfo获得其权限角色，有权限角色 next()，
没有权限角色则try尝试{获取用户信息，然后基于角色生成可访问路由，再动态添加可访问的路由}，失败则 catch (error){删除令牌并转到登录页面重新登录}

如果未登录，没有token，如果在免登录白名单中，直接进入。如果是其他没有访问权限的页面会重定向到登录页面。

*/

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = ["/login", "/auth-redirect"]; // 白名单

// 全局异步路由监听
router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start();

  //设置页面标题
  document.title = getPageTitle(to.meta.title);

  //确定用户是否已登录
  const hasToken = getToken();

  if (hasToken) {            router.addRoute(accessRoute);

    if (to.path === "/login") {
      // 如果已登录，则重定向到主页
      next({ path: "/" });
      NProgress.done(); // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // 确定用户是否已通过getInfo获得其权限角色
      const hasRoles = store.getters.roles && store.getters.roles.length > 0;
      if (hasRoles) {
        next();
      } else {
        try {
          // 获取用户信息
          // 注意：角色必须是一个对象数组！例如：[‘admin’]或，[‘developer’，‘ditor’]
          const { roles } = await store.dispatch("user/getInfo");

          // 基于角色生成可访问路线图
          const accessRoutes = await store.dispatch(
            "permission/generateRoutes",
            roles
          );

          // 动态添加可访问的路由
          for (const accessRoute of accessRoutes) {
          }
        
          // hack方法以确保addRoutes是完整的
          // 设置replace:true，这样导航就不会留下历史记录
          next({ ...to, replace: true });
        } catch (error) {
          // 删除令牌并转到登录页面重新登录
          await store.dispatch("user/resetToken");
          Message.error(error || "Has Error");
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    /* 未登录没有token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单中，直接进入
      next();
    } else {
      // 其他没有访问权限的页面会重定向到登录页面。
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
