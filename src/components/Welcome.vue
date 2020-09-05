<template>
    <div>
      <!-- 轮播图 -->
      <div class="block">
        <el-carousel height="90vh">
          <el-carousel-item v-for="item in swiperList" :key="item.id">
            <img class="swiper-img" :src="item.img">
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
</template>
<script>
export default {
  data () {
    return {
      swiperList: [
        { id: '001', 
          img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1590563344546&di=0a4df0c000429112f0650b2c4d65733f&imgtype=0&src=http%3A%2F%2Fn.sinaimg.cn%2Fsinacn10115%2F492%2Fw1920h972%2F20190315%2Fbc19-hufnxfn7928846.jpg' },
        { id: '002', 
          img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1590563466603&di=c3479fde01d348f0726ecda4d2a78d97&imgtype=0&src=http%3A%2F%2Fdingyue.nosdn.127.net%2FeasHfN9pVLAhAibIktC2Kk6r0iHVfRVbG2E9QYVzBBNJi1527400518296compressflag.jpg' }
      ]
    }
  }
}
</script>
<style lang="less" scoped>
  .swiper-img {
    width: 100%;
    height: 100%;
  }
</style>
