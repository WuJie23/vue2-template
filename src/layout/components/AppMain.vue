<template>
  <!-- 
    缓存页面内容添加vue提供的transition过渡动画
    在路由上设置唯一标识:key 属性通过给每个路由组件一个唯一的 key 值，以便在组件切换时，Vue 可以正确地触发过渡效果和保留状态。
   -->
    <section class="app-main">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <router-view :key="key" />
        </keep-alive>
      </transition>
    </section>
  </template>
  
  <script>
  export default {
    name: 'AppMain',
    computed: {
      cachedViews() {
        return this.$store.state.tagsView.cachedViews
      },
      key() {
        return this.$route.path
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .app-main {
    /* 50= navbar  50  */
    min-height: calc(100vh - 50px);
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .fixed-header+.app-main {
    padding-top: 50px;
  }
  
  .hasTagsView {
    .app-main {
      /* 84 = navbar + tags-view = 50 + 34 */
      min-height: calc(100vh - 84px);
    }
  
    .fixed-header+.app-main {
      padding-top: 84px;
    }
  }
  </style>
  
  <style lang="scss">
  // fix css style bug in open el-dialog
  .el-popup-parent--hidden {
    .fixed-header {
      padding-right: 15px;
    }
  }
  </style>