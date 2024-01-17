import request from "@/utils/request";

/*
src/api/user.js
获取token
用户登录之后在store储存用户名，用户密码
并以此作为参数向后端发送请求，后端返回token

然后根据token 向后端请求返回用户信息
*/

export function login(data) {
  // return request({
  //   url: '/vue-element-admin/user/login',
  //   method: 'post',
  //   data
  // })
  return Promise.resolve({ data: { token: "xxx-xxx-xxx-xxx" } });
}

export function getInfo(token) {//根据token返回用户信息
  // return request({
  //   url: "/vue-element-admin/user/info",
  //   method: "get",
  //   params: { token },
  // });
  return Promise.resolve({
    data: {
      roles: ["admin"],
      name: "wj",
      avatar: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
      introduction: undefined,
    },
  });
}

export function logout() {
  return Promise.resolve();
}
