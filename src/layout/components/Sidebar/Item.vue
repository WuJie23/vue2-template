<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    i18Key: {
      type: String,
      default: ''
    },
  },
  render(h, context) {
    const { icon, title, i18Key } = context.props//先在props中注册过后  context.props中才有
    const vnodes = []
    const _this = context.parent; // 获取组件实例
    if (icon) {
      if (icon.includes('el-icon')) {
        vnodes.push(<i class={[icon, 'sub-el-icon']} />)
      } else {
        vnodes.push(<svg-icon icon-class={icon}/>)
      }
    }
    // 设置侧边栏title标题
    if (title) {
      vnodes.push(<span slot='title'>{(_this.$t(`route.${i18Key}`))}</span>)
    }
    return vnodes
  }
}
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
</style>