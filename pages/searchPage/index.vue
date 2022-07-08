<template>
  <view class="search-page">
    <u-sticky>
      <view style="background-color: #fff; padding: 10rpx 0">
        <view class="search-adress">
          <image src="/static/img/icon_search.png" class="icon_search" />
          <input
            class="uni-input"
            focus
            maxlength="68"
            @input="handleSearch"
            placeholderStyle="color:#999999;font-size:26rpx"
            placeholder="请输入采样点关键词"
          />
        </view>
      </view>
    </u-sticky>
    <view>
      <view class="info-card" v-for="(marker, index) in markers" :key="index">
        <view class="info-header">
         <text> {{marker.areaName}}/{{marker.streetName}}/{{marker.communityName}}
          </text>
          <view class="serve-people">
          <text class="color-1" v-if="marker.serverPeopleInt===1||marker.serverPeopleInt===3">
            绿码
          </text>
          <text class="color-2" style="margin-left:20rpx" v-if="marker.serverPeopleInt===2||marker.serverPeopleInt===3">
            黄码
          </text>
          </view>
          </view>
        <scroll-view scroll-y style="max-height: 350rpx">
          <view class="address">{{ marker.name }}</view>
          <view>详细地址：{{ marker.address }}</view>
          <view
            >拥挤程度：
            <text class="status bg-1" v-if="marker.status === 1">休息</text>
            <text class="status bg-2" v-if="marker.status === 2">畅通</text>
            <text class="status bg-3" v-if="marker.status === 3">忙碌</text>
            <text class="status bg-4" v-if="marker.status === 4">拥挤</text>
          </view>
          <view class="flex-x-between">
            <text>采样台数：{{ marker.workerNumber || 0 }}台</text>
          <view  @click="goLocation(marker)">
            <image class="icon-location"  src="/static/img/icon_dingwei.png"/>
            </view>
          </view>
          <view>服务时间：{{ marker.serverTime }}</view>
          <view>服务人群：{{ marker.serverPeople }}</view>
        </scroll-view>
      </view>
      <view class="empty-status" v-if="!markers.length">
        无搜索结果
      </view>
    </view>
  </view>
</template>

<script>
import { request } from "@/api/index";
export default {
  data() {
    return {
      a: 1,
      markers: [],
    };
  },
  methods: {
    handleSearch(e) {
      uni.$u.debounce(() => {
      const searchStr = e.detail.value;
      this.getList({checkpointName:searchStr})
        console.log("s");
      });
    },
    getList(params = {}) {
      // 获取核酸检测场所列表
      uni.showLoading({
        title: "加载中",
      });
      return request("/ilhapi/wjw/checkpoint/list", {
        page: 1,
        pageSize: 9999,
        ...params,
      })
        .then((res) => {
          this.markers = res.data.map((item) => ({
            ...item,
          }));
          uni.hideLoading();
        })
        .catch((err) => {
          uni.hideLoading();
        });
    },
    goLocation(marker){
      const {latitude,longitude,streetName,address} = marker
      uni.openLocation({
        latitude: +latitude,
        longitude: +longitude,
        name: streetName,
        address,
      });
    }
  },
};
</script>

<style lang="scss">
.search-page {
  min-height: 100vh;
  background-color: #f6f6f6f6;
  .search-adress {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 12rpx 24rpx;
    margin: 12rpx;
    border-radius: 50rpx;
    color: #999999;
    font-size: 26rpx;
    border: 2rpx solid #eee;
  }
  .icon_search {
    width: 48rpx;
    height: 48rpx;
  }
  .uni-input {
    color: #666;
    font-size: 28rpx;
    width: 100%;
  }
  .info-card {
    margin: 24rpx;
    padding: 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    font-size: 24rpx;
    line-height: 1.5;
    color: #666;
    .info-header {
      display: flex;
      justify-content: space-between;
      font-weight: 500;
      color:#666;
      font-size: 28rpx;
      .serve-people {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
      }
      .color-1 {
        color:#348d5d;
      }
      .color-2 {
        color:#e4b134;;
      }
    }
    .address {
      font-size: 32rpx;
      color: #343434;
    }
    .status {
      color: #fff;
      padding: 0 12rpx;
      border-radius: 10rpx;
      &.bg-1 {
        background-color: #bdbbbd;
      }
      &.bg-2 {
        background-color: #0dc947;
      }
      &.bg-3 {
        background-color: #fec952;
      }
      &.bg-4 {
        background-color: #f44336;
      }
    }
    .go-there {
      margin-top: 20rpx;
    }
    .icon-location{
     width: 24rpx;
     height: 28rpx;
    }
  }
  .empty-status {
    display: flex;
    justify-content: center;
    color:#999999;
    padding:25rpx;
  }
  .flex-x-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>