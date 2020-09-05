<template>
  <div>
    <!-- 买包导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right" >
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter='20'>
        <el-col :span='4'>
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear='getUserList' style="width:240px;">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span='4'>
          <!-- 添加用户按钮 -->
          <el-button type="success" @click="addDialogVisble=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data='userList' border stripe>
        <el-table-column type='index'></el-table-column>
        <el-table-column label="姓名" prop='username'></el-table-column>
        <el-table-column label="邮箱" prop='email'></el-table-column>
        <el-table-column label="电话" prop='mobile'></el-table-column>
        <el-table-column label="角色" prop='role_name'></el-table-column>
        <el-table-column label="状态">
          <template slot-scope='scope'>
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="userStateChanged(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="success" icon="el-icon-edit" circle size='mini' @click="showEditDialog(scope.row.id) "></el-button>
             <!-- 分配角色 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable='false'>
              <el-button type="primary" icon="el-icon-setting" circle  size='mini' @click="addUserRigthsDialog(scope.row)"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" circle  size='mini' @click="deleteUser(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户" :visible.sync="addDialogVisble" width="600px" @close='addDialogClosed'>
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisble = false">取 消</el-button>
        <el-button type="success" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改按钮对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="600px" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" ></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop='mobile'>
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="success" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加用户权限的对话框 -->
    <el-dialog title="权限分配" :visible.sync="addUserRightsDialogVisible" width="600px" @close="selectRoleClosed">
      <div>
        <p>当前的用户: {{userInfo.username}}</p>
        <p>当前的角色: {{userInfo.role_name}}</p>
        <p> 分配新角色:
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleId(userInfo.id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUsersList, addUserApi, showEditApi } from '@/api/user.js'
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',  // 你要查询的条件
        pagenum: 1, // 默认当前的页数
        pagesize: 10  // 默认当前每页显示多少条数据
      },
      userList: [],
      total: 0, // 页面数据总条数
      addDialogVisble: false, // 控制对话框的显示与隐藏
      addForm: {  // 添加用户的表单数据
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: { // 添加表单的验证规则对象
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, max: 10, message: '长度在 3 到 10 个字符之间', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, max: 15, message: '长度在 6 到 15 个字符之间', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }]
      },
      editDialogVisible: false,  // 控制修改用户的显示与隐藏
      editForm: '', // 查询到的用户信息对象
      editFormRules: {  // 修改表单验证规则对象
        email: [{ required: true, message: '请输入用户邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入用户手机号', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }]
      },
      addUserRightsDialogVisible: false, // 控制用户权限分配的显示与隐藏
      userInfo: {}, // 需要被分配角色的用户信息
      rolesList: [], // 所有角色的数据列表
      selectRoleId: '' // 已选中的角色Id值
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await getUsersList(this.queryInfo)
      if (res.meta.status !== 200) {
        return this.$message.methods('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听最新的 pagesize 改变事件
    handleSizeChange (newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getUserList()
    },
    // 监听页码值改变事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮, 添加新用户
    addUser () {
      const _this = this;
      _this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        // 可以发送网络请求
        const { data: res } = await addUserApi(_this.addForm)
        if (res.meta.status !== 201) {
          return _this.$message.error('添加用户失败')
        }
        // 隐藏添加用户的对话框
        _this.addDialogVisble = false
        // 重新获取用户列表数据
        _this.getUserList()
        return _this.$message.success('添加用户成功')
      })
    },
    // 展示修改按钮的对话框
    async showEditDialog (id) {
      const _this = this;
      const { data: res } = await showEditApi(id)
      if (res.meta.status !== 200) {
        return _this.$message.error('查询用户信息失败')
      }
      _this.editDialogVisible = true
      _this.editForm = res.data
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户行为并提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        // 发起用户修改信息请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          return this.$message.error('用户信息修改失败')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 修改成功
        return this.$message.success('用户信息修改成功')
      })
    },
    // 根据ID删除对应用户的信息
    async deleteUser (id) {
      // 弹框询问是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认了删除,则返回值为字符串 confirm
      // 如果用户取消了删除, 则返回值为字符串 cancel
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // 刷新数据列表
      this.getUserList()
      return this.$message.success('删除用户成功')
    },
    // 监听用户权限的对话框事件
    async addUserRigthsDialog (userInfo) {
      this.userInfo = userInfo
      // 展示对话框之前,显示所有数据列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户权限列表失败')
      }
      this.rolesList = res.data
      this.addUserRightsDialogVisible = true
    },
    // 点击按钮,分配角色
    async saveRoleId (id) {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色!')
      }
      const { data: res } = await this.$http.put('users/' + id + '/role', { rid: this.selectRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新分配用户权限失败')
      }
      this.getUserList()
      this.addUserRightsDialogVisible = false
      return this.$message.success('更新分配权限角色成功')
    },
    // 权限对话框关闭后 清空内容
    selectRoleClosed () {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>
