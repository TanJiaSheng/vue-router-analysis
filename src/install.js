import View from './components/view'
import Link from './components/link'

// 全局变量接收Vue实例，不用单独引入Vue从而减少包体积
export let _Vue

export function install (Vue) {
  // 确保 install 逻辑只执行一次，用了 install.installed 变量做已安装的标志位
  // 跟Vue的初始化类似，单例模式下确保每次使用的都是同一个对象模型
  console.log(`%c 路由${install.installed ? '已' : '未'}挂载`, 'color: blue; font-size: 24px; background: yellow;')
  if (install.installed && _Vue === Vue) return
  console.log('%c 路由初始化install', 'color: blue; font-size: 24px; background: yellow;')
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  // 通过Vue.mixin把router的beforeCreate和destroyed函数注入到每一个组件中。
  // 因此在每个组件中都可以通过this.$router拿到vue-router实例
  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this) // 初始化路由
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 实现路由变化的监听
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 注册router的两个组件
  console.log('%c 注册组件<RouterView />和<RouterLink />', 'color: blue; font-size: 24px; background: green;')
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
