import Vue from "vue";
import mapboxgl from 'mapbox-gl'

const map = {
  install(Vue) {
    Vue.prototype.$map = mapboxgl
  }
}

Vue.use(map)