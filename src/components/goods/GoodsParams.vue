<template>
  <div>
    <!-- 买包导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示 -->
      <el-alert style="font-size: 20px;"  show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类级联选择框 -->
          <el-cascader expandTrigger='hover' v-model="selectedCateKeys" :options="goodsList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTagClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many" >
          <!-- 添加参数的按钮 -->
          <el-button type="success" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data='manyTableData' border stipe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染出来的标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable  @close="handleClosed(i, scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deletParamsDailog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="success" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data='onlyTableData' border stipe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染出来的标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i, scope.row)">{{item}}></el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deletParamsDailog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      paramsForm: [], // 获取参数的数据
      paramsRules: {}, // 表单验证规则
      goodsList: [], // 商品所有的数据
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: [],  // 级联选择框双向绑定到的数组
      activeName: 'many', // 被激活的页签名称
      manyTableData: [], // 动态参数数据
      onlyTableData: [], // 静态参数数据
      addDialogVisible: false, // 控制添加分类参数 和 属性对话框的显示与隐藏
      addForm: {  // 添加表单数据的对象
        attr_name: ''
      },
      addFormRules: {  // 添加表单验证规则的对象
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      editDialogVisible: false, // 控制修改按钮的显示与隐藏
      editForm: {}, // 修改的表单数据对象 
      editFormRules: {  // 修改表单的验证规则对象
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getCategories()
  },
  computed: {
    isBtnDisabled () {
      // 按钮需要禁用返回 true ,否则返回false
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的ID
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    //  动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  methods: {
    // 获取所有商品的分类列表
    async getCategories () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表数据失败')
      }
      this.goodsList = res.data
    },
    // 级联选择框选中项会变化,会触发这个函数
    handleChange () {
      this.getparamsData()
    },
    // tag 页签点击事件处理函数
    handleTagClick () {
      this.getparamsData()
    },
    // 获取参数列表的数据
    async getparamsData () {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }
      // 根据所选分类的ID,和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表数据失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框输入的值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post('categories/' + this.cateId + '/attributes', { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getparamsData()
        this.addDialogVisible = false
      })
    },
    // 点击按钮 修改对话框
    async showEditDialog (id) {
      // 查询当前参数的信息
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes/' + id, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数信息失败')
      }
      this.editForm = res.data
    },
    // 重置表单的操作
    editDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮,修改对话框操作
    editParams (id) {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put('categories/' + this.cateId + '/attributes/' + this.editForm.attr_id, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数信息失败')
        }
        this.getparamsData()
        this.editDialogVisible = false
        return this.$message.success('修改参数信息成功')
      })
    },
    // 点击按钮,删除参数
    async deletParamsDailog (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 删除的业务逻辑
      const { data: res } = await this.$http.delete('categories/' + this.cateId + '/attributes/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除当前参数失败')
      }
      this.getparamsData()
      return this.$message.success('删除当前参数成功')
    },
    // 文本框失去了焦点或按下了 Enter键 都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      }
      // 如果没有return, 则证明输入的内容,需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.invisible = false
      this.saveAttrVals(row)
    },
    // 点击按钮 展示输入文本框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用,就是当页面上元素被重新渲染之后,才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handleClosed (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 将对AttrVals的操作保存到数据库
    async saveAttrVals (row) {
      // 需要发送请求, 保存这次操作
      const { data: res } = await this.$http.put('categories/' + this.cateId + '/attributes/' + row.attr_id, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-cascader {
    margin-left: 15px;
  }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>
