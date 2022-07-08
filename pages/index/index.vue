<template>
  <view class="content">
    <view class="notice-bar" v-if="showNoticeBar">
      <view class="notice-bar-content">
        {{ noticeList }}
      </view>
      <view class="notice-close" @click="showNotice = false">X</view>
    </view>
    <map
      id="amap"
      show-location
      :scale="scale"
      :style="[
        {
          width: '750rpx',
          height: showNoticeBar ? `${pageHeight - 30}px` : `${pageHeight}px`,
        },
      ]"
      :latitude="latitude"
      :longitude="longitude"
      :markers="covers"
      @markertap="markertap"
    >
      <cover-view class="header-bar-wrapper">
        <cover-view class="select-group">
          <cover-view class="select-items" @click="toSelectPage('1')">
            <cover-view>{{ district.text||'全市区' }}</cover-view>
            <cover-image
              src="/static/img/arrow-down.png"
              class="icon-triangle-down"
            />
          </cover-view>
          <cover-view class="select-items" @click="toSelectPage('2')">
            <cover-view>{{ street.text||'全部街道' }}</cover-view>
            <cover-image
              src="/static/img/arrow-down.png"
              class="icon-triangle-down"
            />
          </cover-view>
          <cover-view class="select-items" @click="toSelectPage('3')">
            <cover-view>{{ userType.text||'全部类型' }}</cover-view>
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
      :show="show"
      :round="8"
      @close="show = false"
      :overlay="false"
      bgColor="#f6f6f6"
    >
      <view class="popup-header"
        ><view class="popup-title">核酸检测采集点</view>
        <u-icon name="close" size="20" @click="show = false"></u-icon
      ></view>
      <view class="popup-content">
        <scroll-view scroll-y style="max-height: 350rpx">
          <view class="address">{{ marker.name }}</view>
          <view
            >距离您距离：<text class="txt-red">{{
              marker.distance | v
            }}</text></view
          >
          <view>详细地址：{{ marker.address }}</view>
          <view
            >拥挤程度：
            <text class="status bg-1" v-if="marker.status === 1">休息</text>
            <text class="status bg-2" v-if="marker.status === 2">畅通</text>
            <text class="status bg-3" v-if="marker.status === 3">忙碌</text>
            <text class="status bg-4" v-if="marker.status === 4">拥挤</text>
          </view>
          <view>采样台数：{{ marker.workerNumber || 0 }}台</view>
          <view>服务时间：{{ marker.serverTime }}</view>
          <view>服务人群：{{ marker.serverPeople }}</view>
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
      <view class="popup-footer"></view>
    </u-popup>
  </view>
</template>

<script>
import { request } from "@/api/index";
import { districtList, streetList, queryTypeList } from "@/common/static_json";
const QQMapWX = require("@/common/qqmap-wx-jssdk");
const qqmapsdk = new QQMapWX({ key: "4BABZ-UP5WQ-KXY5P-GHEHP-YANO5-Q2BH2" });
const pageWidth = uni.getSystemInfoSync().windowWidth;
const pageHeight = uni.getSystemInfoSync().windowHeight;
import { mapState } from "vuex";
export default {
  data() {
    return {
      streetList,
      districtList,
      pageHeight,
      latitude: 22.554597,
      longitude: 113.953881,
      covers: [],
      noticeList: [],
      scale: 14,
      show: false,
      showNotice: true,
      marker: {},
    };
  },
  onShareAppMessage(res) {
    return {
      title: "深圳核酸采样点地图",
      path: "/pages/index/index",
    };
  },
  onShareTimeline() {
    return {
      title: "深圳核酸采样点地图",
      path: "/pages/index/index",
    };
  },
  computed: {
    showNoticeBar() {
      return this.noticeList.length && this.showNotice;
    },
    userSelect() {
      const { street, district, userType } = this;
      return { street, district, userType };
    },
    ...mapState(["street", "district", "userType"]),
  },
  filters: {
    v(num) {
      if (!num || Number.isNaN(num)) return "--";
      if (num > 1000) return `${(num / 1000).toFixed(2)}km`;
      return `${num.toFixed(2)}m`;
    },
  },

  mounted() {
    // this.getDistrict();
    // this.getStreetOffice();
    this.getNoticeList();
    this.getUserLocation();
  },
  watch: {
    userSelect() {
      const districtName = this.district.text;
      const streetName = this.street.text;
      const typeName = this.userType.text;
      this.customerChoose(districtName, streetName,typeName);
    },
  },
  methods: {
    getUserLocation() {
      // 获取用户当前坐标
      // this.$store.commit("changeStreet", { text: "全部街道", value: "" });
      // this.$store.commit("changeUserType", { text: "全部类别", value: 0 });
      // this.$store.commit("changeDistrict", { text: "全市区", value: '' });
      uni.getLocation({
        type: "gcj02",
        altitude: true,
        geocode: true,
        isHighAccuracy: true,
        success: (res) => {
          const latitude = res.latitude;
          const longitude = res.longitude;
          this.latitude = latitude;
          this.longitude = longitude;
          // 判断用户的位置区域
          qqmapsdk.reverseGeocoder({
            location: { latitude, longitude },
            success: (res) => {
              const { district } = res.result.address_component || {};
              const districtItem =
                districtList.find((item) => item.name === district) || {};
              if (Object.keys(districtItem).length) {
                // 用户当前地址能够匹配到后端数据时
                this.$store.commit("changeDistrict", {
                  text: districtItem.name,
                  value: districtItem.id,
                });
              } else {
                // 当用户当前位置超出后台数据匹配范围
                this.$store.commit("changeDistrict", {
                  text: districtList[0].name,
                  value: districtList[0].id,
                });
              }
              this.getList({ areaId: districtItem.id, latitude, longitude });
            },
            fail: (res) => {
              // 当用户未授权或无法获取用户当前位置坐标时
              this.getList();
            },
          });
        },
      });
      
    },
    customerChoose(district = "", street = "",userType="") {
      const districtItem =
        districtList.find((item) => item.name === district) || {};
      const streetItem = streetList.find((item) => item.name === street) || {};
      const userTypeItem = queryTypeList.find((item) => item.name === userType) || {};
      this.getList({ areaId: districtItem.id, streetId: streetItem.id,queryType: userTypeItem.id});
    },
    getList(params = {}) {
      // 获取核酸检测场所列表
      uni.showLoading({
        title: "加载中",
      });
      return request("/ilhapi/wjw/checkpoint/list", {
        page: 1,
        pageSize: 10,
        latitude: this.latitude,
        longitude: this.longitude,
        queryType: 0,
        ...params,
      })
        .then((res) => {
          const colors = {
            1: "#bdbbbd",
            2: "#0dc947",
            3: "#fec952",
            4: "#f44336",
          };
          this.covers = res.data.map((item) => ({
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
          }));
          uni.hideLoading();
        })
        .catch((err) => {
          uni.hideLoading();
        });
    },
    // getDistrict() {
    //   // 获取深圳行政区列表
    //   return request("/ilhapi/wjw/area/list").then((res) => {});
    // },
    // getStreetOffice() {
    //   // 获取深圳街道办列表
    //   return request("/ilhapi/wjw/street/list").then((res) => {});
    // },
    getNoticeList() {
      // 获取通知列表
      return request("/ilhapi/wjw/tip/list").then((res) => {
        const noticeStr = res.data.map(
          (item, index) => `${item.title}：${item.content}`
        );
        this.noticeList = noticeStr.join();
      });
    },
    onControltap() {
      const { longitude, latitude } = this;
      this.moveToLocation({ longitude, latitude });
      this.scale = 16;
    },
    moveToLocation({ longitude, latitude }) {
      uni.createMapContext("amap", this).moveToLocation({
        longitude,
        latitude,
      });
    },
    markertap(e) {
      const markerId = e.detail.markerId;
      const marker = this.covers.find((item) => item.id === markerId);
      this.marker = marker || {};
      console.log("markerId", markerId);
      console.log("target", marker);
      this.show = true;
      // #ifndef H5
      this.moveToLocation({
        latitude: marker.latitude,
        longitude: marker.longitude,
      });
      // #endif
    },
    handleClick() {
      console.log("eee", this.marker);
      const { latitude, longitude, address, streetName } = this.marker;
      uni.openLocation({
        latitude: +latitude,
        longitude: +longitude,
        name: streetName,
        address,
      });
    },
    toSelectPage(type) {
      if (type === "1") {
        uni.navigateTo({
          url: "/pages/chooseArea/index",
        });
      }
      if (type === "2") {
        uni.navigateTo({
          url: "/pages/chooseStreet/index",
        });
      }
      if (type === "3") {
        uni.navigateTo({
          url: "/pages/chooseType/index",
        });
      }
    },
  },
};
</script>

<style lang="scss">
.content {
  position: relative;
}
.cover-btn {
  position: absolute;
  bottom: 61.8%;
  right: 20rpx;
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
.popup-footer {
}
.select-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16rpx 0;
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
