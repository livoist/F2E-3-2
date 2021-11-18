import Vue from "vue";
import * as L from "leaflet";
import Vue2LeafletMarkerCluster from "vue2-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

Vue.component("v-marker-cluster", Vue2LeafletMarkerCluster);

 const LeafletPlugin = {
  install(Vue) {
   Vue.prototype.$L = L;
  }
 };

Vue.use(LeafletPlugin);