<template>
  <!-- 
    tagsview

   -->
    <div id="tags-view-container" class="tags-view-container">
      <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
        <router-link
          v-for="tag in visitedViews"
          ref="tag"
          :key="tag.path"
          :class="isActive(tag)?'active':''"
          :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
          tag="span"
          class="tags-view-item"
          @click.middle.native="!isAffix(tag)?closeSelectedTag(tag):''"
          @contextmenu.prevent.native="openMenu(tag,$event)"
        >
          {{ tag.title }}
          <span v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
        </router-link>
      </scroll-pane>
      <!-- 鼠标右点击触发tagview删除选项 -->
      <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
        <li @click="refreshSelectedTag(selectedTag)">Refresh</li>
        <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">Close</li>
        <li @click="closeOthersTags">Close Others</li>
        <li @click="closeAllTags(selectedTag)">Close All</li>
      </ul>
    </div>
  </template>

  <!-- 此页面为右侧主要内容区域的 历史记录Tag标签 -->
  
  <script>
  import ScrollPane from './ScrollPane'
  import path from 'path'

  /*
  tagview
  监听路由变换，变换就调用addTags方法添加标签
  addTags中调用vuex方法 去储存新的tags view，其中分为 visitedViews: [],//储存所有tagview(不重复，用some方法判断当前跳转路由路径与已储存路由路径是否重复)
  cachedViews: []//储存appmain需要被缓存的组件（cachedViews通过路由原信息中定义的noCache字段来判断是否需要缓存）

  动态设置tagsview 的class名 来实现路由变换时tagsview的高亮 通过比对当前路由路径与tagsview的路由路径 相同就高亮
  同时tagsview选中时滚动条滚动到标签位置保证标签在可视范围内
    
  */
  
  export default {
    components: { ScrollPane },
    data() {
      return {
        visible: false,
        top: 0,
        left: 0,
        selectedTag: {},
        affixTags: []
      }
    },
    computed: {
      visitedViews() {
        return this.$store.state.tagsView.visitedViews
      },
      routes() {
        return this.$store.state.permission.routes
      }
    },
    watch: {
      $route() {
        this.addTags()
        this.moveToCurrentTag()
      },
      visible(value) {
        if (value) {
          document.body.addEventListener('click', this.closeMenu)
        } else {
          document.body.removeEventListener('click', this.closeMenu)
        }
      }
    },
    mounted() {
      this.initTags()
      this.addTags()
    },
    methods: {
      isActive(route) {
        return route.path === this.$route.path
      },
      isAffix(tag) {
        return tag.meta && tag.meta.affix
      },
      filterAffixTags(routes, basePath = '/') {
        let tags = []
        routes.forEach(route => {
          if (route.meta && route.meta.affix) {
            const tagPath = path.resolve(basePath, route.path)
            tags.push({
              fullPath: tagPath,
              path: tagPath,
              name: route.name,
              meta: { ...route.meta }
            })
          }
          if (route.children) {
            const tempTags = this.filterAffixTags(route.children, route.path)
            if (tempTags.length >= 1) {
              tags = [...tags, ...tempTags]
            }
          }
        })
        return tags
      },
      initTags() {
        const affixTags = this.affixTags = this.filterAffixTags(this.routes)
        for (const tag of affixTags) {
          // Must have tag name
          if (tag.name) {
            this.$store.dispatch('tagsView/addVisitedView', tag)
          }
        }
      },
      addTags() {
        const { name } = this.$route
        if (name) {
          this.$store.dispatch('tagsView/addView', this.$route)
        }
        return false
      },
      moveToCurrentTag() {
        const tags = this.$refs.tag
        this.$nextTick(() => {
          for (const tag of tags) {
            if (tag.to.path === this.$route.path) {//tagsview选中时滚动条滚动到标签位置保证标签在可视范围内
              this.$refs.scrollPane.moveToTarget(tag)
              // 当查询不同时，更新
              if (tag.to.fullPath !== this.$route.fullPath) {
                this.$store.dispatch('tagsView/updateVisitedView', this.$route)
              }
              break
            }
          }
        })
      },
      refreshSelectedTag(view) {
        this.$store.dispatch('tagsView/delCachedView', view).then(() => {
          const { fullPath } = view
          this.$nextTick(() => {
            this.$router.replace({
              path: '/redirect' + fullPath
            })
          })
        })
      },
      closeSelectedTag(view) {
        this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
          if (this.isActive(view)) {
            this.toLastView(visitedViews, view)
          }
        })
      },
      closeOthersTags() {
        this.$router.push(this.selectedTag)
        this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
          this.moveToCurrentTag()
        })
      },
      closeAllTags(view) {
        this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
          if (this.affixTags.some(tag => tag.path === view.path)) {
            return
          }
          this.toLastView(visitedViews, view)
        })
      },
      toLastView(visitedViews, view) {
        const latestView = visitedViews.slice(-1)[0]
        if (latestView) {
          this.$router.push(latestView.fullPath)
        } else {
          // now the default is to redirect to the home page if there is no tags-view,
          // you can adjust it according to your needs.
          if (view.name === 'Dashboard') {
            // to reload home page
            this.$router.replace({ path: '/redirect' + view.fullPath })
          } else {
            this.$router.push('/')
          }
        }
      },
      openMenu(tag, e) {
        const menuMinWidth = 105
        const offsetLeft = this.$el.getBoundingClientRect().left // 左侧集装箱边距
        const offsetWidth = this.$el.offsetWidth // 集装箱宽度
        const maxLeft = offsetWidth - menuMinWidth // 左边界
        const left = e.clientX - offsetLeft + 15 // 15: margin right
  
        if (left > maxLeft) {
          this.left = maxLeft
        } else {
          this.left = left
        }
  
        this.top = e.clientY
        this.visible = true
        this.selectedTag = tag
      },
      closeMenu() {
        this.visible = false
      },
      handleScroll() {
        this.closeMenu()
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .tags-view-container {
    height: 34px;
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
    .tags-view-wrapper {
      .tags-view-item {
        display: inline-block;
        position: relative;
        cursor: pointer;
        height: 26px;
        line-height: 26px;
        border: 1px solid #d8dce5;
        color: #495060;
        background: #fff;
        padding: 0 8px;
        font-size: 12px;
        margin-left: 5px;
        margin-top: 4px;
        &:first-of-type {
          margin-left: 15px;
        }
        &:last-of-type {
          margin-right: 15px;
        }
        &.active {
          background-color: #42b983;
          color: #fff;
          border-color: #42b983;
          &::before {
            content: '';
            background: #fff;
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            position: relative;
            margin-right: 2px;
          }
        }
      }
    }
    .contextmenu {
      margin: 0;
      background: #fff;
      z-index: 3000;
      position: absolute;
      list-style-type: none;
      padding: 5px 0;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 400;
      color: #333;
      box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
      li {
        margin: 0;
        padding: 7px 16px;
        cursor: pointer;
        &:hover {
          background: #eee;
        }
      }
    }
  }
  </style>
  
  <style lang="scss">
  //reset element css of el-icon-close
  .tags-view-wrapper {
    .tags-view-item {
      .el-icon-close {
        width: 16px;
        height: 16px;
        vertical-align: 2px;
        border-radius: 50%;
        text-align: center;
        transition: all .3s cubic-bezier(.645, .045, .355, 1);
        transform-origin: 100% 50%;
        &:before {
          transform: scale(.6);
          display: inline-block;
          vertical-align: -3px;
        }
        &:hover {
          background-color: #b4bccc;
          color: #fff;
        }
      }
    }
  }
  </style>