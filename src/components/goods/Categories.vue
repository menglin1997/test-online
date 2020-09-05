<template>
  <div>
    <!-- 面包导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-button type="success" @click="addSortButton">添加分类</el-button>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="categoriesList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:rgb(115 243 49)"></i>
          <i class="el-icon-error" v-else style="color:#ea0f0fdb"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="success" v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <el-button type="success" icon="el-icon-edit" size="mini" @click="showeditCateForm(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-edit" size="mini" @click="delCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addSortDialogVisible" width="600px" @close="addSortFormDiaClosed">
      <!-- 内容区域 -->
      <el-form ref="addSortFormRef" :model="addSortForm" label-width="80px" :rules="addSortRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addSortForm.cat_name "></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options: 用来指定数据源 -->
          <!-- props: 用来指定配置对象 -->
          <el-cascader expandTrigger="hover" v-model="slectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" clearable props.checkStrictly></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addSortDialogVisible = false">取 消</el-button>
        <el-button type="success" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑添加分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editSortDialogVisible" width="600px">
      <el-form ref="editSortFormRef" :model="editSortForm" label-width="80px" :rules="editSortRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editSortForm.cat_name "></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editSortDialogVisible = false">取 消</el-button>
        <el-button type="success" @click="editFormText">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      categoriesList: [], // 商品分类的数据
      querInfo: { // 查询条件
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0, // 总数据条数
      columns: [  // 为table 指定列的定义
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          //  表示当前模板列的使用名称
          template: 'isOk'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          //  表示当前模板列的使用名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          //  表示当前模板列的使用名称
          template: 'operation'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addSortDialogVisible: false,
      // 添加分类表单验证规则对象
      addSortRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 修改分类表单验证对象
      editSortRules: {
        cat_name: [{ required: true, message: '请输入分类名称' }]
      },
      // 添加分类的数据表单对象
      addSortForm: {
        // 将要添加分类的名称
        cat_name: '',
        // 分级分类的id
        cat_pid: 0,
        // 分类的等级, 默认要添加的是1级分类
        cat_level: 0
      },
      // 父级分类的列表
      parentCateList: [],
      // 用来指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的分级分类的ID数组
      slectedKeys: [],
      // 控制修改分类的对话框显示与隐藏
      editSortDialogVisible: false,
      // 修改分类的数据
      editSortForm: {
        cat_name: '',
        cat_pid: 0,
        // 分类的等级, 默认要添加的是1级分类
        cat_level: 0
      },
      // 编辑分类使用到的Id
      editId: ''
    }
  },
  created () {
    this.getCategories()
  },
  methods: {
    // 获取商品列表信息
    async getCategories () {
      const { data: res } = await this.$http.get('/categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类信息失败')
      }
      // 把数据列表 赋值给  categoriesList  返回的是一个对象
      this.categoriesList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCategories()
    },
    // 监听 pagenum 的改变
    handleCurrentChange (newNum) {
      this.querInfo.pagenum = newNum
      this.getCategories()
    },
    // 点击添加分类按钮 弹出对话框
    addSortButton () {
      // 先获取分级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addSortDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据列表失败')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      // 如果 selectedKeys  数组中的 length 大于0, 证明选中的父级分类
      // 反之, 就说明没有选中任何父级分类
      if (this.slectedKeys.length > 0) {
        // 父级分类Id
        this.addSortForm.cat_pid = this.slectedKeys[this.slectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addSortForm.cat_level = this.slectedKeys.length
        return true
      } else {
        // 父级分类Id
        this.addSortForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addSortForm.cat_level = 0
      }
    },
    // 点击按钮 添加新的分类
    addCate () {
      this.$refs.addSortFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addSortForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.getCategories()
        this.addSortDialogVisible = false
        return this.$message.success('添加分类成功')
      })
    },
    // 添加分类表单关闭事件,重置表单数据
    addSortFormDiaClosed () {
      this.$refs.addSortFormRef.resetFields()
      this.slectedKeys = []
      this.addSortForm.cat_pid = 0
      this.addSortForm.cat_level = 0
    },
    // 编辑分类弹出对话框
    async showeditCateForm (id) {
      this.editId = id
      // 弹出对话框
      this.editSortDialogVisible = true
      // 先拿到分类数据
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      // 获取数据
      this.editSortForm = res.data
    },
    // 编辑分类对话框的内容
    editFormText () {
      // 表单验证
      this.$refs.editSortFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put(
          'categories/' + this.editId,
          { cat_name: this.editSortForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('分类数据更新失败')
        }
        this.getCategories()
        this.editSortDialogVisible = false
        return this.$message.success('分类名称更新成功')
      })
    },
    // 删除当前分类
    async delCate (id) {
      const confirmCatee = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmCatee === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      this.getCategories()
      return this.$message.success('删除当前分类成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
