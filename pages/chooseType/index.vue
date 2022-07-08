<template>
  <view class="page-container">
    <view class="label-header"> 服务类型：{{ items.text }} </view>
    <view class="chekcbox-group">
      <uni-data-checkbox
        mode="tag"
        :value="items.value"
        @change="handleChange"
        :localdata="localdata"
      ></uni-data-checkbox>
    </view>
  </view>
</template>

<script>
import { queryTypeList } from "@/common/static_json";
export default {
  data() {
    return {
      items: uni.getStorageSync('userType'),
      localdata: [],
    };
  },
  mounted() {
    this.localdata = queryTypeList.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  },
  methods: {
    handleChange(e) {
      this.items = e.detail.data;
      this.$store.commit('changeUserType',e.detail.data)
      uni.navigateBack({
        delta: 2,
      });
    },
  },
};
</script>

<style lang="scss">
.page-container {
  // padding:24rpx;
}
.chekcbox-group {
  padding: 24rpx;
}
.label-header {
  padding: 36rpx 24rpx 12rpx;
  border-bottom: 2rpx solid #999;
}
</style>