<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avtar_box">
        <img src="../assets/m.jpg">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username" >
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-yonghu2" ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-mima" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btn">
          <el-button type="warning" @click="resetLoginForm">重置</el-button>
          <el-button type="success" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败!账号或密码错误')
        } else {
          this.$message.success('登录成功')
          // 1.将登录成功之后的 token,保存到客户端的 sessionStorage 中
          // -->项目中除了登录之外的其他API接口,必须在登录之后才能访问
          // -->token 只应在当前网站打开期间生效, 所以将token 保存在 sessionStorage 中
          // --> localStorage 持久化储存  --> sessionStorage 是会话储存
          window.sessionStorage.setItem('token', res.data.token)
          // 2.通过编程式导航跳转到后台主页,路由地址是 /home
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_header {
    text-align: center;
    background-color:yellow;
  }
  .login_container {
    background-image: linear-gradient(100deg,#f114d7f2 0%, #2753de 100%);
    height: 100%;
  }
  .login_box {
    width: 500px;
    height: 300px;
    border-radius: 15px;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .avtar_box {
    width: 150px;
    height: 150px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btn {
    display: flex;
    justify-content: flex-end;
  }
  h3 {
    color: #f31515;
  }
</style>
