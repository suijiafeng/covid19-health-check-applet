<template>
  <view class="page-container">
    <view class="label-header"> 街道办：{{ items.text||'' }} </view>
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
      items: uni.getStorageSync('street'),
      localdata: [],
    };
  },
  mounted() {
    this.localdata = streetList.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  },
  methods: {
    handleChange(e) {
      this.items = e.detail.data;
      this.$store.commit('changeStreet',e.detail.data)
      this.$store.commit('changeDistrict',{text:'全市区',value:''})
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