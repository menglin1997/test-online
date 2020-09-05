import Vue from 'vue'

// 用户列表组件
export const getUsersList = function(data) { // 获取用户列表信息接口
  return Vue.prototype.$http.get('users', { params: data })
}
export const addUserApi = function(data) { // 添加用户接口
  return Vue.prototype.$http.post('users', data)
}
export const showEditApi = function(data) { // 获取当前需要修改的用户信息
  return Vue.prototype.$http.get('users/'+ data)
}