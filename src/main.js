import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Cookies from "js-cookie";
import Element from "element-ui";
import enLang from "element-ui/lib/locale/lang/en";
import './styles/element-variables.scss'
import "@/styles/index.scss"; // global css
import './icons' // icon
import './permission'
import './utils/error-log' // error log
import i18n from './lang' // internationalization
// import * as filters from './filters' // global filters
Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
