(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{312:function(t,e,n){var content=n(315);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(26).default)("60835984",content,!0,{sourceMap:!1})},313:function(t,e,n){"use strict";var r=n(9),o=n(77).findIndex,c=n(134),d="findIndex",l=!0;d in[]&&Array(1).findIndex((function(){l=!1})),r({target:"Array",proto:!0,forced:l},{findIndex:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}}),c(d)},314:function(t,e,n){"use strict";n(312)},315:function(t,e,n){var r=n(25)(!1);r.push([t.i,'.popup-flex{display:flex}.popup-flex p:first-of-type{margin-right:20px}.popup-content span:first-of-type{color:#f2dd66}@-webkit-keyframes userPoint{0%{box-shadow:0 0 0 hsla(0,0%,63.9%,.7)}60%{opacity:1}to{box-shadow:0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3}}@keyframes userPoint{0%{box-shadow:0 0 0 hsla(0,0%,63.9%,.7)}60%{opacity:1}to{box-shadow:0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3}}.selfMarker{background:#172532;border:3px solid #a3a3a3;width:12px;height:12px;border-radius:50%;position:relative;-webkit-animation:userPoint .5s infinite alternate both;animation:userPoint .5s infinite alternate both}.textBlock{top:-42px;width:50px;height:26px;font-size:12px;text-align:center;line-height:26px;background:#000;color:#fff;border-radius:6px}.textBlock,.textBlock:after{position:absolute;left:50%;transform:translateX(-50%)}.textBlock:after{content:"";width:0;height:0;border-color:#000 transparent transparent;border-style:solid;border-width:8px 5px 0;bottom:-8px}',""]),t.exports=r},316:function(t,e,n){"use strict";n.r(e);var r=n(5),o=(n(31),n(32),n(313),n(53),n(15),n(37),{data:function(){return{station:"",target:"",mapInstance:null,mapMarker:null,mapPopup:null,nearMarkers:[],selfMarkers:[]}},computed:{getCurStationTarget:function(){return this.$store.state.curTarget},getCurBikeGeometry:function(){return this.$store.state.curBikePath},getCurNearByStation:function(){return this.$store.state.stationNearBy},getUserPosition:function(){return this.$store.state.userPos},getCurNearItem:function(){return this.$store.state.nearNameItem},getAvailabilityNearByArray:function(){return this.$store.state.availabilityNearBy},getStationRents:function(){return this.$store.state.availability}},watch:{getCurBikeGeometry:{deep:!0,handler:function(t){0!==t.length&&this.getBikePath(t)}},getCurStationTarget:{deep:!0,immediate:!0,handler:function(t){""!==t&&this.getBikeStationMarker(t)}},getCurNearByStation:{deep:!0,handler:function(t){t&&this.getUserCurPosNearByStation(t)}},getCurNearItem:{immediate:!0,deep:!0,handler:function(t){t&&this.getCurNearSelectMarker(t)}}},methods:{initMapBox:function(){this.mapInstance=new this.$map.Map({accessToken:"pk.eyJ1IjoiYmVubGFpIiwiYSI6ImNrdzRib2FzYTAydTQyb3JoaHU4MGVzcWoifQ.j-bTKoCaWwbV4Ldqvy2Vrg",container:"map",style:"mapbox://styles/mapbox/light-v10",center:[120.9738819,23.97565],zoom:7}),this.mapMarker=new this.$map.Marker,this.mapPopup=new this.$map.Popup},getCurNearSelectMarker:function(t){var e=t.pos,n=t.name,r=this.getCurNearByStation.findIndex((function(t){return t.StationName.Zh_tw===n.Zh_tw})),o=this.getAvailabilityNearByArray[r],c=o.AvailableRentBikes,d=o.AvailableReturnBikes,l=o.UpdateTime;this.nearMarkers[r].setPopup(this.mapPopup.setHTML('\n              <p class="popup-content">\n                <span>Address :</span> \n                <span>'.concat(t.address.Zh_tw,'</span>\n              </p>\n              <div class="popup-flex">\n                <p class="popup-content">\n                  <span>CanRent : </span>\n                  <span>').concat(c,'</span>\n                </p>\n                <p class="popup-content">\n                  <span>NotReturn : </span>\n                  <span>').concat(d,'</span>\n                </p>\n              </div>\n              <p class="popup-content">\n                <span>LastUpdateTimes : </span>\n                <br />\n                <span>').concat(l,"</span>\n                </p>\n            "))).togglePopup(),this.mapInstance.jumpTo({center:[e.PositionLon,e.PositionLat],zoom:14,speed:2,curve:1,duration:5e3,easing:function(t){return t}})},getUserCurPosNearByStation:function(t){var e=this;return Object(r.a)(regeneratorRuntime.mark((function n(){var r,o,c;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:e.nearMarkers.length>0&&(e.nearMarkers.forEach((function(t){return t.remove()})),e.nearMarkers=[]),e.selfMarkers.length>0&&(e.selfMarkers.forEach((function(t){return t.remove()})),e.selfMarkers=[]),r=document.createElement("div"),(o=document.createElement("div")).innerHTML="SELF",o.classList.add("textBlock"),r.classList.add("selfMarker"),r.appendChild(o),(c=new e.$map.Marker(r)).setLngLat(e.getUserPosition).addTo(e.mapInstance),e.selfMarkers.push(c),t.forEach((function(t){var n=t.StationName,r=t.StationPosition,o=new e.$map.Marker;o.setLngLat([r.PositionLon,r.PositionLat]).setPopup(e.mapPopup.setHTML(n.Zh_tw)).addTo(e.mapInstance),e.nearMarkers.push(o)})),e.mapInstance.jumpTo({center:e.getUserPosition,zoom:14,speed:2,curve:1,duration:5e3,easing:function(t){return t}});case 13:case"end":return n.stop()}}),n)})))()},getBikeStationMarker:function(t){this.mapMarker.setLngLat([t.pos.PositionLon,t.pos.PositionLat]).setPopup(this.mapPopup.setHTML(t.address)).addTo(this.mapInstance).togglePopup(!0),this.mapInstance.jumpTo({center:[t.pos.PositionLon,t.pos.PositionLat],zoom:18,speed:2,curve:1,duration:5e3,easing:function(t){return t}})},getBikePath:function(path){var t=this;["route","point-start","point-end"].forEach((function(e){t.mapInstance.getLayer(e)&&t.mapInstance.removeLayer(e),t.mapInstance.getSource(e)&&t.mapInstance.removeSource(e)})),this.mapInstance.addSource("route",{type:"geojson",data:{type:"Feature",properties:{},geometry:{type:"LineString",coordinates:path}}}),this.mapInstance.addSource("point-start",{type:"geojson",data:{type:"FeatureCollection",features:[{type:"Feature",properties:{description:"Start"},geometry:{type:"Point",coordinates:[path[0][0],path[0][1]]}}]}}),this.mapInstance.addSource("point-end",{type:"geojson",data:{type:"FeatureCollection",features:[{type:"Feature",properties:{description:"End"},geometry:{type:"Point",coordinates:[path[path.length-1][0],path[path.length-1][1]]}}]}}),this.mapInstance.addLayer({id:"route",type:"line",source:"route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#CC8A4D","line-width":4,"line-opacity":.6}}),this.mapInstance.addLayer({id:"point-start",type:"circle",source:"point-start",paint:{"circle-color":"#FEC804","circle-stroke-width":2,"circle-stroke-color":"#3A5A69","circle-radius":5}}),this.mapInstance.addLayer({id:"point-end",type:"circle",source:"point-end",paint:{"circle-color":"#C2E3F4","circle-stroke-width":2,"circle-stroke-color":"#3A5A69","circle-radius":5}});var e=Math.floor(path.length/2),n=window.innerWidth;this.mapInstance.jumpTo({center:[path[e][0],path[e][1]],zoom:e>40&&n>575?11:e>40&&n<575?9:e<40?13:void 0,speed:2,curve:1,duration:5e3,easing:function(t){return t}})},getBikeStation:function(t){var e=this;return Object(r.a)(regeneratorRuntime.mark((function n(){return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.$store.dispatch("getAllStation",t);case 2:e.station=e.$store.state.station;case 3:case"end":return n.stop()}}),n)})))()}},mounted:function(){this.initMapBox()}}),c=(n(314),n(14)),component=Object(c.a)(o,(function(){var t=this.$createElement;return(this._self._c||t)("div",{attrs:{id:"map"}})}),[],!1,null,null,null);e.default=component.exports}}]);