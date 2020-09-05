import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },   // 如果访问'/'路径,重定向到登录页面
    { path: '/login', component: () => import('@/components/Login') }, // 登录页面
    { path: '/home', component: () => import('@/components/Home'), redirect: '/welcome',  //进入主页面,重定向到欢迎页
      children: [
        { path: '/welcome',name: '首页', component: () => import('@/components/Welcome')}, //欢迎页面
        { path: '/users', component: () => import('@/components/user/Users') },  //用户列表页
        { path: '/rights', component: () => import('@/components/jurisdiction/Rights')},  // 权限列表
        { path: '/roles', component: () => import('@/components/jurisdiction/Roles')},  // 角色列表
        { path: '/goods', component: () => import('@/components/goods/Goods')},    // 商品列表页
        { path: '/goodsadd', component: () => import('@/components/goods/goodsAdd/GoodsAdd') }, // 添加商品
        { path: '/categories', component: () => import('@/components/goods/Categories')},  // 商品分类页面
        { path: '/params', component: () => import('@/components/goods/GoodsParams')},  // 分类参数页面
        { path: '/orders', component: () => import('@/components/order/Order') },  // 订单管理页面
        { path: '/reports', component: () => import('@/components/dataTable/Reports') } // 数据报表页面
      ]
    }
  ]
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  /* 
    to 将要访问的路径
    from 代表从哪个路径跳转而来
    next 是一个函数, 表示放行
    next() 放行 --> next('/login') 强制跳转 
  */
  if (to.path === '/login') {
    return next()
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  } else {
    next()
  }
})
export default router
