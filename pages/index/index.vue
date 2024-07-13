<template>
  <view class="content">
    <view class="notice-bar" v-if="showNoticeBar">
      <view class="notice-bar-content">
        {{ noticeList }}
      </view>
      <view class="notice-close" @click="showNotice = false">
        <u-icon name="close" color="#999" size="24"></u-icon>
      </view>
    </view>
    <map
      id="amap"
      class="map-container"
      v-if="mapReady"
      show-location
      :scale="scale"
      :style="mapStyle"
      :latitude="latitude"
      :longitude="longitude"
      :markers="covers"
      @markertap="markertap"
    >
      <cover-view class="header-bar-wrapper">
        <cover-view class="search-address" @click="goSearchPage">
          <cover-image src="/static/img/icon_search.png" class="icon_search" />
          <cover-view>
            请输入核酸点关键词
          </cover-view>
        </cover-view>

        <cover-view class="select-group">
          <cover-view v-for="(item, index) in selectItems" :key="index" class="select-items" @click="toSelectPage(item.type)">
            <cover-view>{{ item.text }}</cover-view>
            <cover-image
              src="/static/img/arrow-down.png"
              class="icon-triangle-down"
            />
          </cover-view>
        </cover-view>
      </cover-view>
      <cover-image
        @click="onControltap"
        src="/static/img/rest_location.png"
        class="cover-btn"
      ></cover-image>
    </map>
    <u-popup
      v-model:show="show"
      :round="8"
      :overlay="true"
      bgColor="#f6f6f6"
    >
      <view class="popup-header">
        <view class="popup-title">核酸检测采集点</view>
        <u-icon name="close" size="20" @click="closePopup"></u-icon>
      </view>
      <view class="popup-content">
        <scroll-view scroll-y style="max-height: 350rpx">
          <view class="info-item">
            <text class="info-label">名称：</text>
            <text class="info-value">{{ marker.name }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">距离：</text>
            <text class="info-value txt-red">{{ formatDistance(marker.distance) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">地址：</text>
            <text class="info-value">{{ marker.address }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">拥挤程度：</text>
            <text :class="['status', `bg-${marker.status}`]">{{ getStatusText(marker.status) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">采样台数：</text>
            <text class="info-value">{{ marker.workerNumber || 0 }}台</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务时间：</text>
            <text class="info-value">{{ marker.serverTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务人群：</text>
            <text class="info-value">{{ marker.serverPeople }}</text>
          </view>
        </scroll-view>
        <view class="go-there">
          <u-button
            @click="handleClick"
            shape="circle"
            type="primary"
            icon="map"
            text="导航前往"
          ></u-button>
        </view>
      </view>
    </u-popup>
    <u-modal :show="showModal" @confirm="showModal = false">
      <rich-text nodes="服务仅适用于深圳地区，感谢您的使用。"></rich-text>
    </u-modal>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { request } from "@/api/index";
import { districtList, streetList, queryTypeList } from "@/common/static_json";

// 条件编译，根据平台引入不同的地图SDK
// #ifdef H5
import QQMapWX from "@/common/qqmap-wx-jssdk";
const qqmapsdk = new QQMapWX({ key: "4BABZ-UP5WQ-KXY5P-GHEHP-YANO5-Q2BH2" });
// #endif

// #ifdef MP-WEIXIN
const QQMapWX = require("@/common/qqmap-wx-jssdk");
const qqmapsdk = new QQMapWX({ key: "4BABZ-UP5WQ-KXY5P-GHEHP-YANO5-Q2BH2" });
// #endif

export default {
  data() {
    return {
      latitude: 22.554597,
      longitude: 113.953881,
      covers: [],
      noticeList: [],
      scale: 14,
      show: false,
      showNotice: true,
      showModal: false,
      marker: {},
      pageHeight: uni.getSystemInfoSync().windowHeight,
      mapReady: false,
    };
  },
  computed: {
    ...mapState(["street", "district", "userType"]),
    showNoticeBar() {
      return this.noticeList.length && this.showNotice;
    },
    mapStyle() {
      return [{
        width: '750rpx',
        height: this.showNoticeBar ? `${this.pageHeight - 30}px` : `${this.pageHeight}px`,
      }];
    },
    selectItems() {
      return [
        { type: '1', text: this.district.text || "全市区" },
        { type: '2', text: this.street.text || "全部街道" },
        { type: '3', text: this.userType.text || "全部类型" },
      ];
    },
  },
  watch: {
    district: 'handleUserSelectChange',
    street: 'handleUserSelectChange',
    userType: 'handleUserSelectChange',
  },
  async mounted() {
    await this.initializeComponent();
  },
  methods: {
    ...mapMutations(['changeDistrict', 'changeStreet', 'changeUserType']),
    
    async initializeComponent() {
      try {
        await this.getNoticeList();
        await this.getUserLocation();
        this.mapReady = true;
      } catch (error) {
        console.error('初始化失败:', error);
        uni.showToast({
          title: '初始化失败，请重试',
          icon: 'none'
        });
      }
    },

    getUserLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: "gcj02",
          isHighAccuracy: true,
          success: (res) => {
            this.latitude = res.latitude;
            this.longitude = res.longitude;
            this.reverseGeocode().then(resolve).catch(reject);
          },
          fail: (error) => {
            console.error('获取位置失败:', error);
            uni.showToast({
              title: '获取位置失败，使用默认位置',
              icon: 'none'
            });
            this.getList().then(resolve).catch(reject);
          }
        });
      });
    },

    reverseGeocode() {
      return new Promise((resolve, reject) => {
        qqmapsdk.reverseGeocoder({
          location: { latitude: this.latitude, longitude: this.longitude },
          success: (res) => {
            this.handleGeocodeSuccess(res);
            resolve();
          },
          fail: (error) => {
            console.error('反地理编码失败:', error);
            this.getList().then(resolve).catch(reject);
          }
        });
      });
    },

    handleGeocodeSuccess(res) {
      const { district } = res.result.address_component || {};
      const districtItem = this.findDistrict(district);
      this.updateDistrict(districtItem);
      this.resetChoose();
      this.getList({ areaId: districtItem.id, latitude: this.latitude, longitude: this.longitude });
    },

    findDistrict(district) {
      return districtList.find((item) => item.name === district) || districtList[0];
    },

    updateDistrict(districtItem) {
      this.changeDistrict({
        text: districtItem.name,
        value: districtItem.id,
      });
    },

    resetChoose() {
      this.changeStreet({ text: '全部街道', value: '' });
      this.changeUserType({ text: '全部类型', value: '' });
    },

    handleUserSelectChange() {
      this.customerChoose(this.district.text, this.street.text, this.userType.text);
    },

    customerChoose(district = "", street = "", userType = "") {
      const params = this.buildChooseParams(district, street, userType);
      this.getList(params);
    },

    buildChooseParams(district, street, userType) {
      const districtItem = districtList.find((item) => item.name === district) || {};
      const streetItem = streetList.find((item) => item.name === street) || {};
      const userTypeItem = queryTypeList.find((item) => item.name === userType) || {};
      return {
        areaId: districtItem.id,
        streetId: streetItem.id,
        queryType: userTypeItem.id,
      };
    },

    async getList(params = {}) {
      uni.showLoading({ title: "加载中" });
      const queryParams = this.buildQueryParams(params);
      try {
        const res = await request("/ilhapi/wjw/checkpoint/list", queryParams);
        this.handleListResponse(res);
      } catch (err) {
        this.handleListError(err);
      } finally {
        uni.hideLoading();
      }
    },

    buildQueryParams(params) {
      const baseParams = {
        page: 1,
        pageSize: 10,
        latitude: this.latitude,
        longitude: this.longitude,
        queryType: 0,
      };
      return Object.fromEntries(
        Object.entries({ ...baseParams, ...params })
          .filter(([_, v]) => v != null)
      );
    },

    handleListResponse(res) {
      this.covers = res.data.map(this.formatMarker);
    },

    formatMarker(item) {
      const colors = {
        1: "#bdbbbd",
        2: "#0dc947",
        3: "#fec952",
        4: "#f44336",
      };
      return {
        ...item,
        width: 30,
        height: 45,
        callout: {
          content: item.name,
          padding: 4,
          borderRadius: 4,
          fontSize: 14,
          borderWidth: 1,
          bgColor: colors[item.status] || "#999",
          color: "#fff",
        },
        iconPath: `/static/img/status${item.status}.png`,
      };
    },

    handleListError(err) {
      console.error('获取列表失败:', err);
      uni.showToast({
        title: '获取列表失败，请稍后重试',
        icon: 'none'
      });
    },

    async getNoticeList() {
      try {
        const res = await request("/ilhapi/wjw/tip/list");
        this.handleNoticeResponse(res);
      } catch (err) {
        this.handleNoticeError(err);
      }
    },

    handleNoticeResponse(res) {
      this.noticeList = res.data?.map((item) => `${item.title}：${item.content}`).join();
    },

    handleNoticeError(err) {
      console.error('获取通知失败:', err);
    },

    onControltap() {
      this.moveToLocation();
      this.scale = 16;
    },

    moveToLocation({ latitude = this.latitude, longitude = this.longitude } = {}) {
      uni.createMapContext("amap", this).moveToLocation({
        latitude,
        longitude,
      });
    },

    markertap(e) {
      const markerId = e.detail.markerId;
      const selectedMarker = this.covers.find((item) => item.id === markerId);
      if (selectedMarker) {
        this.marker = { ...selectedMarker };
        this.show = true;
        // #ifndef H5
        this.moveToLocation({
          latitude: selectedMarker.latitude,
          longitude: selectedMarker.longitude
        });
        // #endif
      } else {
        console.error('未找到对应的标记点');
      }
    },

    closePopup() {
      this.show = false;
    },

    handleClick() {
      const { latitude, longitude, address, streetName } = this.marker;
      uni.openLocation({
        latitude: +latitude,
        longitude: +longitude,
        name: streetName,
        address,
      });
    },

    goSearchPage() {
      uni.navigateTo({
        url: "/pages/searchPage/index",
      });
    },

    toSelectPage(type) {
      const pages = {
        '1': "/pages/chooseArea/index",
        '2': "/pages/chooseStreet/index",
        '3': "/pages/chooseType/index",
      };
      uni.navigateTo({
        url: pages[type],
      });
    },

    formatDistance(distance) {
      if (!distance || isNaN(distance)) return "--";
      return distance > 1000 ? `${(distance / 1000).toFixed(2)}km` : `${distance.toFixed(2)}m`;
    },

    getStatusText(status) {
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
.search-address {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12rpx 24rpx;
  margin: 12rpx;
  border-radius: 50rpx;
  color: #999999;
  font-size: 26rpx;
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
.content {
  position: relative;
  height: 100vh; /* 确保内容区域占满整个屏幕 */
  overflow: hidden; /* 隐藏溢出内容 */
}
.map-container {
  width: 100%;
  height: 100%; /* 确保地图占满整个内容区域 */
}
.cover-btn {
  position: absolute;
  bottom: 10%;
  right: 10rpx;
  width: 100rpx;
  height: 100rpx;
}

.popup-header {
  display: flex;
  padding: 24rpx 24rpx 0;
}
.popup-content {
  margin: 24rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #666;
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
  .txt-red {
    color: red;
  }
}

.select-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // color:#fff;
  .select-items {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 16rpx;
    height: 60rpx;
    margin: 0 15rpx;
    flex: 1;
    font-size: 26rpx;
    color: #444;
  }
}
.popup-title {
  flex: 1;
  color: #717171;
}
.icon-triangle-down {
  width: 32rpx;
  height: 32rpx;
}

.notice-bar {
  position: relative;
  padding: 12rpx 24rpx;
  background-color: rgb(253, 246, 236);
  font-size: 24rpx;
  color: #f9ae3d;
  overflow: hidden;
  .notice-bar-content {
    display: block;
    height: 18px;
    line-height: 18px;
    white-space: nowrap;
    -webkit-animation: notice 20s 0s linear infinite both;
    animation: notice 20s 0s linear infinite both;
  }
  .notice-close {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    padding: 0 32rpx 0 24rpx;
    color: #999;
    background-color: rgb(253, 246, 236);
  }
}

@keyframes notice {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
@-webkit-keyframes notice {
  0% {
    -webkit-transform: translateX(100%);
  }
  100% {
    -webkit-transform: translateX(-100%);
  }
}
</style>