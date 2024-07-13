<template>
  <view class="page-container">
    <view class="label-header">
      街道办：{{ selectedStreet }}
    </view>
    <view class="checkbox-group">
      <uni-data-checkbox
        mode="tag"
        :value="selectedValue"
        @change="handleChange"
        :localdata="streetOptions"
      ></uni-data-checkbox>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { streetList } from "@/common/static_json";

export default {
  computed: {
    ...mapState({
      street: state => state.street
    }),
    selectedStreet() {
      return this.street.text || '';
    },
    selectedValue() {
      return this.street.value;
    },
    streetOptions() {
      return streetList.map(item => ({
        text: item.name,
        value: item.id,
      }));
    }
  },
  methods: {
    ...mapMutations(['changeStreet', 'changeDistrict']),
    handleChange(e) {
      const selectedData = e.detail.data;
      this.changeStreet(selectedData);
      this.changeDistrict({text:'全市区', value:''});
      uni.setStorageSync('street', selectedData);
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