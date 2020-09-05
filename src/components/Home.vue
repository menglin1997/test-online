<template>
  <el-container class="homeContainer">
    <!-- 头部区域 -->
    <el-header>
      <div class="homeLogo">
        <img src="@/assets/m.jpg" />
        <span>浅夏</span>
        <span class="toggle-button" @click="toggleCollapse"><i :class="btnType ? 'el-icon-open' : 'el-icon-turn-off'"></i></span>
      </div>
      <el-button type="success" @click='logOut'>退出</el-button></el-header>
    <el-container>
      <!-- 左侧边栏区域 -->
      <el-aside :width="iscollapse ? '64px' : '200px'">
        <el-menu  text-color="#fff" active-text-color="#ff5722" unique-opened :collapse="iscollapse" :collapse-transition="false" router :default-active="activePath">
        <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key= "item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]" style="color:#fff"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item class="el-menu-item" :index=" '/' +subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' +subItem.path)">
              <template slot="title" >
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体内容区域 -->
      <el-main id="right-content">
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      menulist: [], // 左侧菜单数据
      iconsObj: {   // 字体图标
        125: 'iconfont icon-yonghu2',
        103: 'iconfont icon-quanxian',
        101: 'iconfont icon-shangpin-tianchong',
        102: 'iconfont icon-dingdan',
        145: 'iconfont icon-shuju'
      },
      iscollapse: false, // 是否折叠
      activePath: '',
      btnType: true  //按钮按钮状态
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logOut () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menulist = res.data
    },
    // 点击按钮, 切换菜单的折叠与展开
    toggleCollapse () {
      this.btnType = !this.btnType;
      this.iscollapse = !this.iscollapse;
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
  // 右侧主题内容
  #right-content {
    height: 90vh;
  }
  .homeContainer {
    height: 100%;
  }
  .el-header{
    display: flex;
    padding-left: 0;
    color: #fff;;
    background-image: linear-gradient(100deg,#d726d9b8 0%, #2753de 100%);
    justify-content: space-between;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
    .toggle-button {
      font-size: 22px;
    }
    .toggle-button:hover {
      color: #ff5722;
    }
  }
  .homeLogo {
    margin-left: 2px;
    img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }
  }
  .el-aside {
    background-image: linear-gradient(100deg,#d726d9b8 0%, #2753de 100%);
    .iconfont {
      margin-right: 15px;
    }
    .el-menu {
      background-image: linear-gradient(100deg,#d726d9b8 0%, #2753de 100%);
      border-right: none;
      .el-menu-item {
        background-image: linear-gradient(100deg,#d726d9b8 0%, #2753de 100%);
        > i {
          color: #fff;
        }
      }
    }
    /deep/.el-submenu__title:hover{
      color:#ff5722!important;
      & .iconfont{
        color:#ff5722!important;
      }
    }
  }
</style>
