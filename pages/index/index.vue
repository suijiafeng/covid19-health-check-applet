<template>
  <view class="content">
    <cover-view class="header-bar-wrapper">
      <u-notice-bar
			  v-if="noticeList.length"
        speed="40"
        :text="noticeList"
        mode="closable">
			</u-notice-bar>
			<view class="select-group">
				<view class="select-items">全市区 <view class="icon-triangle-down"></view></view>
				<view class="select-items">全部街道<view class="icon-triangle-down"></view></view>
				<view class="select-items">全部类别<view class="icon-triangle-down"></view></view>
			</view>
    </cover-view>
    <map
      id="amap"
      show-location
      :scale="scale"
      :style="[{ width: '750rpx', height: `${pageHeight}px` }]"
      :latitude="latitude"
      :longitude="longitude"
      :markers="covers"
      @markertap="markertap"
    />
    <cover-image
      @click="onControltap"
      src="/static/img/rest_location.png"
      class="cover-btn"
    ></cover-image>
    <u-popup :show="show" :round="8" @close="show=false" bgColor="#f6f6f6">
      <view class="popup-header"
        ><view class="popup-title">核酸检测采集点</view>
        <u-icon name="close" size="20" @click="show = false"></u-icon
      ></view>
      <view class="popup-content">
        <view class="address">{{ marker.name }}</view>
        <view>距离您距离：<text class="txt-red">{{ marker.distance | v }}米</text></view>
        <view>详细地址：{{ marker.address }}</view>
        <view>拥挤程度：
					<text class="status bg-1" v-if="marker.status===1">休息</text>
					<text class="status bg-2" v-if="marker.status===2">畅通</text>
					<text class="status bg-3" v-if="marker.status===3">忙碌</text>
					<text class="status bg-4" v-if="marker.status===4">拥挤</text>
					</view>
				<view>采样台数：{{marker.workerNumber||0}}台</view>
        <view>服务时间：{{ marker.serverTime }}</view>
        <view>服务人群：{{ marker.serverPeople }}</view>
				<view class="go-there">
				<u-button @click="handleClick" shape="circle" type="primary"  icon="map" text="导航前往"></u-button>
				</view>
      </view>
      <view class="popup-footer"></view>
    </u-popup>
  </view>
</template>

<script>
import { request } from "@/api/index";
import { districtList, streetList } from "@/common/static_json";
const QQMapWX = require("@/common/qqmap-wx-jssdk");
export default {
  data() {
    return {
      streetList,
      districtList,
      latitude: 22.554597,
      longitude: 113.953881,
      covers: [],
      noticeList: [],
      qqmapsdk: null,
      scale: 16,
      show: false,
      marker: {},
    };
  },
  computed: {
    pageHeight() {
      const height = uni.getSystemInfoSync().windowHeight;
      return height;
    },
  },
  onLoad() {
    // 实例化API核心类
    this.qqmapsdk = new QQMapWX({
      key: "4BABZ-UP5WQ-KXY5P-GHEHP-YANO5-Q2BH2",
    });
  },
  filters: {
    v(num) {
      if (!num||Number.isNaN(num)) return "--";
      return num.toFixed()
    },
  },
  mounted() {
    // this.getDistrict();
    // this.getStreetOffice();
    this.getNoticeList();
    this.getUserLocation();
  },
  methods: {
    getUserLocation() {
      // 获取用户当前坐标
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
          this.qqmapsdk.reverseGeocoder({
            location: { latitude, longitude },
            success: (res) => {
              const { district } = res.result.address_component || {};
              const districtItem = districtList.find(
                (item) => item.name === district
              );
              this.getList({ areaId: districtItem.id, latitude, longitude });
            },
            fail: (res) => {
              this.getList();
            },
          });
        },
      });
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
        areaId: 1,
        ...params,
      })
        .then((res) => {
          this.covers = res.data.map((item) => ({
            ...item,
            width: 30,
            height: 45,
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
    onControltap(control) {
      uni.createMapContext("amap", this).moveToLocation({
        longitude: this.longitude,
        latitude: this.latitude,
      });
      this.scale = 16;
    },
    markertap(e) {
      const markerId = e.detail.markerId;
      const marker = this.covers.find((item) => item.id === markerId);
      this.marker = marker || {};
      console.log("markerId", markerId);
      console.log("target", marker);
      this.show = true;
    },
		handleClick(){
			const  { latitude, longitude } = this
			uni.openLocation( { latitude, longitude })
		}
  },
};
</script>

<style lang="scss">
.content {
  position: relative;
}
.cover-btn {
  position: absolute;
  bottom: 20%;
  right: 20rpx;
  width: 100rpx;
  height: 100rpx;
}
.header-bar-wrapper {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
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
		color:#fff;
		padding:0 12rpx;
		border-radius: 10rpx;
		&.bg-1 {
			background-color:#bdbbbd;
		}
		&.bg-2 {
			background-color:#0dc947;
		}
		&.bg-3 {
			background-color:#fec952;
		}
		&.bg-4 {
			background-color:#f44336;
		}

	}
	.go-there {
		margin-top: 20rpx;
	}
	.txt-red {
		color:red;
	}
}
.popup-footer {
	  
}
.select-group {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin:16rpx 0;
	// color:#fff;
	.select-items {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(255,255,255,.9);
		border-radius: 16rpx;
		height: 60rpx;
		margin:0 15rpx;
		flex:1;
		font-size: 32rpx;
		color:#444;
	}

}
.popup-title {
  flex: 1;
  color: #717171;
}
.icon-triangle-up {
	width:0;
	height: 0;
	border: 10rpx solid transparent;
	border-bottom-color:  #999;
	border-top-width: 0;
}
.icon-triangle-down {
	width:0;
	height: 0;
	border: 10rpx solid transparent;
	border-top-color:  #999;
	border-bottom-width: 0;
}
</style>
