<template>
  <view class="page-container">
    <view class="label-header">
      服务类型：{{ selectedType }}
    </view>
    <view class="checkbox-group">
      <uni-data-checkbox
        mode="tag"
        :value="selectedValue"
        @change="handleChange"
        :localdata="typeOptions"
      ></uni-data-checkbox>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { queryTypeList } from "@/common/static_json";

export default {
  computed: {
    ...mapState({
      userType: state => state.userType
    }),
    selectedType() {
      return this.userType.text || '';
    },
    selectedValue() {
      return this.userType.value;
    },
    typeOptions() {
      return queryTypeList.map(item => ({
        text: item.name,
        value: item.id,
      }));
    }
  },
  methods: {
    ...mapMutations(['changeUserType']),
    handleChange(e) {
      const selectedData = e.detail.data;
      this.changeUserType(selectedData);
      uni.setStorageSync('userType', selectedData);
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