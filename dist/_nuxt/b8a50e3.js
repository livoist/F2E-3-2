(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{307:function(t,e,n){"use strict";n.r(e);var o=n(5),r=(n(35),{data:function(){return{station:"",target:""}},computed:{getCurTarget:function(){return this.$store.state.curTarget}},watch:{getCurTarget:{deep:!0,immediate:!0,handler:function(t){""!==t&&(this.target=t,(0,this.initMapBox().getMarker)(t))}}},methods:{initMapBox:function(){var map=new this.$map.Map({accessToken:"pk.eyJ1IjoiYmVubGFpIiwiYSI6ImNrdzRib2FzYTAydTQyb3JoaHU4MGVzcWoifQ.j-bTKoCaWwbV4Ldqvy2Vrg",container:"map",style:"mapbox://styles/mapbox/light-v10",center:[120.9738819,23.97565],zoom:7}),marker=new this.$map.Marker,t=new this.$map.Popup;return{getMarker:function(e){marker.setLngLat([e.pos.PositionLon,e.pos.PositionLat]).setPopup(t.setHTML(e.address)).addTo(map).togglePopup(!0),map.jumpTo({center:[e.pos.PositionLon,e.pos.PositionLat],zoom:18,speed:2,curve:1,duration:5e3,easing:function(t){return t}})}}},getBikeStation:function(t){var e=this;return Object(o.a)(regeneratorRuntime.mark((function n(){return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.$store.dispatch("getAllStation",t);case 2:e.station=e.$store.state.station;case 3:case"end":return n.stop()}}),n)})))()}},mounted:function(){this.initMapBox()}}),c=n(22),component=Object(c.a)(r,(function(){var t=this.$createElement;return(this._self._c||t)("div",{attrs:{id:"map"}})}),[],!1,null,null,null);e.default=component.exports}}]);