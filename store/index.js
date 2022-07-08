import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex)
export default new Vuex.Store({
	state:{
    test:'666',
		street:uni.getStorageSync('street')||'',
		district:uni.getStorageSync('district')||'',
		userType:uni.getStorageSync('userType')||''
  },
	mutations:{
		changeStreet(state,payload){
			state.street  = payload
			uni.setStorageSync('street', payload);
		},
		changeDistrict(state,payload){
			state.district  = payload
			uni.setStorageSync('district', payload);
		},
		changeUserType(state,payload){
			state.userType  = payload
			uni.setStorageSync('userType', payload);
		}
	},
	getters:{}
})