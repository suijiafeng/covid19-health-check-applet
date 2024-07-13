<template>
  <view class="search-page">
    <u-sticky>
      <view class="search-container">
        <view class="search-address">
          <image src="/static/img/icon_search.png" class="icon_search" />
          <input
            class="uni-input"
            focus
            maxlength="68"
            @input="onInput"
            :placeholder-style="placeholderStyle"
            placeholder="请输入采样点关键词"
          />
        </view>
      </view>
    </u-sticky>
    <view class="markers-container">
      <template v-if="markers.length">
        <u-list>
          <u-list-item v-for="marker in markers" :key="marker.id">
            <view class="info-card">
              <view class="info-header">
                <text>{{ locationText(marker) }}</text>
                <view class="serve-people">
                  <text v-if="showGreenCode(marker)" class="color-1">绿码</text>
                  <text v-if="showYellowCode(marker)" class="color-2">黄码</text>
                </view>
              </view>
              <view class="address">{{ marker.name }}</view>
              <view>详细地址：{{ marker.address }}</view>
              <view>
                拥挤程度：
                <text :class="['status', `bg-${marker.status}`]">{{ statusText(marker.status) }}</text>
              </view>
              <view class="flex-x-between">
                <text>采样台数：{{ marker.workerNumber || 0 }}台</text>
                <view @click="goLocation(marker)">
                  <image class="icon-location" src="/static/img/icon_dingwei.png"/>
                </view>
              </view>
              <view>服务时间：{{ marker.serverTime }}</view>
              <view>服务人群：{{ marker.serverPeople }}</view>
            </view>
          </u-list-item>
        </u-list>
        <u-loadmore :status="loadMoreStatus" @loadmore="loadMore" />
      </template>
      <view v-else class="empty-status">
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
      markers: [],
      debouncedSearch: null,
      page: 1,
      pageSize: 20,
      total: 0,
      loadMoreStatus: 'loadmore',
      searchValue: '',
    };
  },
  computed: {
    placeholderStyle() {
      return "color:#999999;font-size:26rpx";
    },
  },
  created() {
    this.debouncedSearch = uni.$u.debounce(this.handleSearch, 300);
    this.getList();
  },
  methods: {
    onInput(event) {
      const value = event.detail.value;
      this.searchValue = value;
      this.page = 1;
      this.markers = [];
      this.debouncedSearch(value);
    },
    handleSearch(value) {
      this.getList({ checkpointName: value });
    },
    async getList(params = {}) {
      try {
        if (this.page === 1) {
          uni.showLoading({ title: "加载中" });
        }
        const res = await request("/ilhapi/wjw/checkpoint/list", {
          page: this.page,
          pageSize: this.pageSize,
          checkpointName: this.searchValue,
          ...params,
        });
        if (this.page === 1) {
          this.markers = res.data;
        } else {
          this.markers = [...this.markers, ...res.data];
        }
        this.total = res.total;
        this.loadMoreStatus = this.markers.length >= this.total ? 'nomore' : 'loadmore';
      } catch (err) {
        console.error('获取列表失败:', err);
        uni.showToast({
          title: '获取列表失败，请稍后重试',
          icon: 'none'
        });
        this.loadMoreStatus = 'loadmore';
      } finally {
        uni.hideLoading();
      }
    },
    loadMore() {
      if (this.markers.length < this.total) {
        this.page += 1;
        this.getList();
      }
    },
    goLocation(marker) {
      const { latitude, longitude, streetName, address } = marker;
      uni.openLocation({
        latitude: +latitude,
        longitude: +longitude,
        name: streetName,
        address,
      });
    },
    locationText(marker) {
      return `${marker.areaName}/${marker.streetName}/${marker.communityName}`;
    },
    showGreenCode(marker) {
      return marker.serverPeopleInt === 1 || marker.serverPeopleInt === 3;
    },
    showYellowCode(marker) {
      return marker.serverPeopleInt === 2 || marker.serverPeopleInt === 3;
    },
    statusText(status) {
      const statusMap = {
        1: "休息",
        2: "畅通",
        3: "忙碌",
        4: "拥挤",
      };
      return statusMap[status] || "";
    },
  },
};
</script>

<style lang="scss">
.search-page {
  min-height: 100vh;
  background-color: #f6f6f6;

  .search-container {
    background-color: #fff;
    padding: 10rpx 0;
  }

  .search-address {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 12rpx 24rpx;
    margin: 12rpx;
    border-radius: 50rpx;
    border: 2rpx solid #eee;

    .icon_search {
      width: 48rpx;
      height: 48rpx;
    }

    .uni-input {
      flex: 1;
      color: #666;
      font-size: 28rpx;
    }
  }

  .markers-container {
    padding-bottom: 24rpx;
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
      color: #666;
      font-size: 28rpx;

      .serve-people {
        display: flex;
        align-items: center;
      }

      .color-1 {
        color: #348d5d;
      }

      .color-2 {
        color: #e4b134;
        margin-left: 20rpx;
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

      &.bg-1 { background-color: #bdbbbd; }
      &.bg-2 { background-color: #0dc947; }
      &.bg-3 { background-color: #fec952; }
      &.bg-4 { background-color: #f44336; }
    }

    .icon-location {
      width: 24rpx;
      height: 28rpx;
    }
  }

  .empty-status {
    display: flex;
    justify-content: center;
    color: #999999;
    padding: 25rpx;
  }

  .flex-x-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .scroll-view {
    max-height: 350rpx;
  }
}
</style>