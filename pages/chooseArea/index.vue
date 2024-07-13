<template>
  <view class="page-container">
    <view class="label-header">
      市辖区：{{ selectedDistrict }}
    </view>
    <view class="checkbox-group">
      <uni-data-checkbox
        mode="tag"
        :value="selectedValue"
        @change="handleChange"
        :localdata="districtOptions"
      ></uni-data-checkbox>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { districtList } from "@/common/static_json";

export default {
  computed: {
    ...mapState({
      district: state => state.district
    }),
    selectedDistrict() {
      return this.district.text || '';
    },
    selectedValue() {
      return this.district.value;
    },
    districtOptions() {
      return districtList.map(item => ({
        text: item.name,
        value: item.id,
      }));
    }
  },
  methods: {
    ...mapMutations(['changeDistrict', 'changeStreet']),
    handleChange(e) {
      const selectedData = e.detail.data;
      this.changeDistrict(selectedData);
      this.changeStreet({text:'全部街道', value:''});
      uni.setStorageSync('district', selectedData);
      uni.navigateBack({ delta: 2 });
    },
  },
};
</script>

<style lang="scss">
.page-container {
  .checkbox-group {
    padding: 24rpx;
  }
  .label-header {
    padding: 36rpx 24rpx 12rpx;
    border-bottom: 2rpx solid #999;
  }
}
</style>