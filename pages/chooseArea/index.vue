<template>
  <view class="page-container">
    <view class="label-header"> 市辖区：{{ items.text||'' }} </view>
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
import { districtList, streetList } from "@/common/static_json";
export default {
  data() {
    return {
      items: uni.getStorageSync('district'),
      localdata: [],
    };
  },
  mounted() {
    this.localdata = districtList.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  },
  methods: {
    handleChange(e) {
      this.items = e.detail.data;
      this.$store.commit('changeDistrict',e.detail.data)
      this.$store.commit('changeStreet',{text:'全部街道',value:''})
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