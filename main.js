import Vue from 'vue'
import store from "./store"
import App from './App'
import uView from '@/uni_modules/uview-ui'

Vue.use(uView)
Vue.prototype.$store = store

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  store,
    ...App
})
app.$mount()