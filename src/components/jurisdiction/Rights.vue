<template>
  <div>
    <!-- 买包导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsLists" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0' " effect="plain">标签一</el-tag>
            <el-tag effect="plain" type="success" v-else-if="scope.row.level === '1'">标签二</el-tag>
            <el-tag effect="plain" type="danger" v-else>标签三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rightsLists: []
    }
  },
  created () {
    // 获取所有的权限
    this.getRightsLists()
  },
  methods: {
    // 获取权限列表
    async getRightsLists () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsLists = res.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>
