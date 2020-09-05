<template>
    <div>
      <!-- 买包导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
       <!-- 卡片视图区域 -->
      <el-card class="box-card">
        <!-- 搜索与添加区域 -->
        <el-row :gutter='20'>
          <el-col :span='4'>
            <!-- 添加用户按钮 -->
            <el-button type="success" @click="addDialogVisible=true">添加角色</el-button>
          </el-col>
        </el-row>
        <!-- 角色列表区域 -->
        <el-table :data='rolesList' border stripe>
          <!-- 展开列 -->
          <el-table-column type='expand'>
            <template slot-scope="scope">
              <el-row :class="['bd-bottom', i1 === 0 ?'bd-top' : '','venter']" v-for="(item1, i1) in scope.row.children" :key="item1.id" >
                <!-- 一级权限列表 -->
                <el-col :span='5'>
                  <el-tag type="success" closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级权限列表 -->
                <el-col :span="19">
                  <el-row :class="[i2 === 0 ? '' : 'twoBdColor','venter' ]" v-for="(item2, i2) in item1.children" :key="item2.id" >
                    <el-col :span="6">
                      <el-tag type="warning" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级权限 -->
                    <el-col :span="18">
                      <el-tag :class="['threeColor']" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                        {{item3.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column type='index'></el-table-column>
          <el-table-column label="角色名称" prop='roleName'></el-table-column>
          <el-table-column label="角色描述" prop='roleDesc'></el-table-column>
          <el-table-column label="操作" width="170px">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button type="success" icon="el-icon-edit" circle size='mini' @click="showEditDialog(scope.row.id) "></el-button>
              <!-- 分配权限 -->
              <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable='false'>
                <el-button type="primary" icon="el-icon-setting" circle  size='mini' @click="showSetRightsDialog(scope.row)"></el-button>
              </el-tooltip>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" circle  size='mini' @click="deleteUser(scope.row.id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible"  width="600px" @close="addDialogClosed">            
        <!-- 内容主图区域 -->
        <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="80px" class="demo-ruleForm">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="success" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
    <!-- 修改按钮对话框 -->
    <el-dialog title="修改角色信息" :visible.sync="editDialogVisible" width="600px">
      <el-form ref="editFormRef" :rules="editRolesFormRules" :model="editForm" label-width="80px">
        <el-form-item label="角色名称" prop='roleName'>
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="success" @click="editRolesInfo(editForm.roleId)">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="SetRightsDialogVisible" width="600px" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="setRightList" :props="treeProps" show-checkbox node-key='id' default-expand-all :default-checked-keys="defaultChecked" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightsDialogVisible = false">取 消</el-button>
        <el-button type="success" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      // 控制对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addRolesForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色表单的验证规则对象
      addRolesFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }, { min: 3, max: 10, message: '长度在 3 到 10 个字符之间', trigger: 'blur' }]
      },
      // 控制修改用户的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: '',
      // 修改角色信息的验证对象
      editRolesFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }, { min: 3, max: 10, message: '长度在 3 到 10 个字符之间', trigger: 'blur' }]
      },
      // 权限分配对话框的显示与隐藏
      SetRightsDialogVisible: false,
      // 所有权限的数据
      setRightList: [],
      // 树形控件绑定的属性事件
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的树形节点id数组
      defaultChecked: [],
      // 当前即将分配权限的ID
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表信息
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表信息失败')
      }
      this.rolesList = res.data
    },
    // 监听角色添加对话框的关闭事件
    addDialogClosed () {
      this.$refs.addRolesFormRef.resetFields()
    },
    // 添加角色
    addRoles () {
      // 表单预校验
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) {
          return false;
        }
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.getRolesList()
        this.addDialogVisible = false
        return this.$message.success('添加角色成功')
      })
    },
    // 修改角色信息
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 提交角色信息
    editRolesInfo (id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put('roles/' + id, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败')
        }
        this.getRolesList()
        this.editDialogVisible = false
        return this.$message.success('修改角色信息成功')
      })
    },
    // 监听删除角色事件
    async deleteUser (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认了删除,则返回值为字符串 confirm
      // 如果用户取消了删除,则返回值为字符串 cancel
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.getRolesList()
      return this.$message.success('删除角色成功')
    },
    // 根据id删除对应权限
    async removeRightById (rolesId, id) {
      // 弹框提示是否要删除
      const confirmResult2 = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult2 === 'cancel') {
        this.$message.info('已取消删除权限')
      }
      const { data: res } = await this.$http.delete('roles/' + rolesId.id + '/rights/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      rolesId.children = res.data
      return this.$message.success('删除权限成功')
    },
    // 展示分配权限的对话框
    async showSetRightsDialog (role) {
      this.roleId = role.id
      // 获取权限列表所有的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表信息失败')
      }
      // 把获取的权限保存到data中
      this.setRightList = res.data
      // 递归获取三级节点的 ID
      this.getLeafKeys(role, this.defaultChecked)
      this.SetRightsDialogVisible = true
    },
    // 通过递归的形式,获取角色下所有三级权限的id,并保存到defaultChecked数组中.
    getLeafKeys (node, arr) {
      // 如果当前node 节点不包含 children 属性, 则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭权限管理对话框,清空操作
    setRightDialogClosed () {
      this.defaultChecked = []
    },
    // 点击为角色添加分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post('roles/' + this.roleId + '/rights', { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('添加分配角色权限失败')
      }
      this.getRolesList()
      this.SetRightsDialogVisible = false
      return this.$message.success('添加分配角色权限成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 10px;
  }
  .bd-top {
    border-top: 1px solid red;
  }
  .bd-bottom {
    border-bottom: 1px solid red;
  }
  .twoBdColor {
    border-top: 1px solid gold;
  }
  .threeColor {
    border-top:  1px solid darkmagenta;
  }
  .venter {
    display: flex;
    align-items: center;
  }
</style>
