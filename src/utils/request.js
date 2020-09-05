import Vue from 'vue'
import axios from 'axios'
// 导入 Nprogress 包对应的js和css
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
// 设置请求的根路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
// axios请求拦截
// 在 request 拦截器中,展示进度条 Nprogress.start()
axios.interceptors.request.use(config => {
  Nprogress.start()
  // 为请求头对象 添加 Token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})

Vue.prototype.$http = axios
Vue.config.productionTip = false
