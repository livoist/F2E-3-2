<template lang="pug">
#map

</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      station: '',
      target: '',
      mapInstance: null,
      mapMarker: null,
      mapPopup: null,
      nearStationMarkers: [],
      nearRestaruantMarkers: [],
      nearScenicSpotMarkers: [],
      nearHotelMarkers: [],
      selfPosMarker: []
    }
  },
  computed: {
    ...mapState({
      getCurStationTarget: 'curTarget',
      getCurBikeGeometry: 'curBikePath',
      getCurNearByStation: 'stationNearBy',
      getUserPosition: 'userPos',
      getCurNearItem: 'nearNameItem',
      getAvailabilityNearByArray: 'availabilityNearBy',
      getStationRents: 'availability',
      getRestaruant: 'restaurantNearBy',
      getScenicSpot: 'scenicSpotNearBy',
      getHotel: 'hotelNearBy'
    })
  },
  watch: {
    getCurBikeGeometry: {
      deep: true,
      handler(val) {
        if (val.length !== 0) this.getBikePath(val)
      }
    },
    getCurStationTarget: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val !== '') this.getBikeStationMarker(val)
      }
    },
    getCurNearByStation: {
      deep: true,
      handler(val) {
        if (val) this.getUserCurPosNearByStation(val)
      }
    },
    getCurNearItem: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) this.getCurNearSelectMarker(val)
      }
    },
    getRestaruant: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) this.getStationNearByRestaurant()
      }
    },
    getScenicSpot: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) this.getStationNearByScenicSpot()
      }
    },
    getHotel: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) this.getStationNearByHotel()
      }
    }
  },
  methods: {
    initMapBox() {
      this.mapInstance = new this.$map.Map({
        accessToken: 'pk.eyJ1IjoiYmVubGFpIiwiYSI6ImNrdzRib2FzYTAydTQyb3JoaHU4MGVzcWoifQ.j-bTKoCaWwbV4Ldqvy2Vrg',
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [120.9738819, 23.97565],
        zoom: 7
      })

      this.mapMarker = new this.$map.Marker()
      this.mapPopup = new this.$map.Popup()
    },
    getCurNearSelectMarker(target) {
      const { pos, name } = target

      // get target index
      const targetMarker = this.getCurNearByStation.findIndex(item => {
        return item.StationName.Zh_tw === name.Zh_tw
      })

      // get need info
      const availabilityAry = this.getAvailabilityNearByArray
      const {
        AvailableRentBikes,
        AvailableReturnBikes,
        UpdateTime
      } = availabilityAry[targetMarker]

      // set marker
      this.nearStationMarkers[targetMarker]
        .setPopup(
          this.mapPopup
            .setHTML(`
              <p class="popup-content">
                <span>Address :</span> 
                <span>${target.address.Zh_tw}</span>
              </p>
              <div class="popup-flex">
                <p class="popup-content">
                  <span>CanRent : </span>
                  <span>${AvailableRentBikes}</span>
                </p>
                <p class="popup-content">
                  <span>NotReturn : </span>
                  <span>${AvailableReturnBikes}</span>
                </p>
              </div>
              <p class="popup-content">
                <span>LastUpdateTimes : </span>
                <br />
                <span>${UpdateTime}</span>
                </p>
            `)
        )
        .togglePopup()

      // jump to select marker
      this.mapInstance.jumpTo(
        {
          center: [pos.PositionLon, pos.PositionLat],
          zoom: 14,
          speed: 2,
          curve: 1,
          duration: 5000,
          easing(t) {
            return t
          }
        }
      )
    },
    createCustomPoint(type, item) {
      const el = document.createElement('div')
      const childText = document.createElement('div')
      childText.innerHTML = item.name.length > 8 ? `${item.name.slice(0, 7)}...` : item.name

      childText.classList.add('textBlock', type)
      el.classList.add('marker', type, 'hidden')
      el.appendChild(childText)

      return el
    },
    getStationNearByRestaurant() {
      if (this.nearRestaruantMarkers.length > 0) {
        this.nearRestaruantMarkers.forEach(item => item.remove())
        this.nearRestaruantMarkers = []
      }

      const result = this.getRestaruant.slice()
      result.forEach(item => {
        const el = this.createCustomPoint('restaurant', item)
        const restaurantMarker = new this.$map.Marker(el)

        restaurantMarker.setLngLat(item.pos).addTo(this.mapInstance)
        this.nearRestaruantMarkers.push(restaurantMarker)
      })
    },
    getStationNearByScenicSpot() {
      if (this.nearScenicSpotMarkers.length > 0) {
        this.nearScenicSpotMarkers.forEach(item => item.remove())
        this.nearScenicSpotMarkers = []
      }

      const result = this.getScenicSpot.slice()
      result.forEach(item => {
        const el = this.createCustomPoint('scenicSpot', item)
        const scenicSpotMarker = new this.$map.Marker(el)

        scenicSpotMarker.setLngLat(item.pos).addTo(this.mapInstance)
        this.nearScenicSpotMarkers.push(scenicSpotMarker)
      })
    },
    getStationNearByHotel() {
      if (this.nearHotelMarkers.length > 0) {
        this.nearHotelMarkers.forEach(item => item.remove())
        this.nearHotelMarkers = []
      }

      const result = this.getHotel.slice()
      result.forEach(item => {
        const el = this.createCustomPoint('hotel', item)
        const hotelMarker = new this.$map.Marker(el)
        
        hotelMarker.setLngLat(item.pos).addTo(this.mapInstance)
        this.nearHotelMarkers.push(hotelMarker)
      })
    },
    async getUserCurPosNearByStation(nearByAry) {
      // remove old nearMarker
      if (this.nearStationMarkers.length > 0) {
        this.nearStationMarkers.forEach(item => item.remove())
        this.nearStationMarkers = []
      }

      // remove old selfMarker
      if (this.selfPosMarker.length > 0) {
        this.selfPosMarker.forEach(item => item.remove())
        this.selfPosMarker = []
      }
  
      // custom selfMarker style
      const el = document.createElement('div')
      const childText = document.createElement('div')
      childText.innerHTML = 'SELF'

      childText.classList.add('textBlock')
      el.classList.add('marker', 'self')
      el.appendChild(childText)

      // add selfMarker on map
      const selfMarker = new this.$map.Marker(el)
      selfMarker.setLngLat(this.getUserPosition).addTo(this.mapInstance)
      this.selfPosMarker.push(selfMarker)

      // add all nearMarker on map
      nearByAry.forEach(item => {
        const { StationName, StationPosition } = item
        const nearMarker = new this.$map.Marker()

        nearMarker
          .setLngLat([StationPosition.PositionLon, StationPosition.PositionLat])
          .setPopup(this.mapPopup.setHTML(StationName.Zh_tw))
          .addTo(this.mapInstance)

        // save all nearMarker
        this.nearStationMarkers.push(nearMarker)
      })

      // jump to self position
      this.mapInstance.jumpTo(
        {
          center: this.getUserPosition,
          zoom: 14,
          speed: 2,
          curve: 1,
          duration: 5000,
          easing(t) {
            return t
          }
        }
      )
    },
    getBikeStationMarker(target) {
      this.mapMarker
        .setLngLat([target.pos.PositionLon, target.pos.PositionLat])
        .setPopup(this.mapPopup.setHTML(target.address))
        .addTo(this.mapInstance)
        .togglePopup(true)

      this.mapInstance.jumpTo(
        {
          center: [target.pos.PositionLon, target.pos.PositionLat],
          zoom: 14,
          speed: 2,
          curve: 1,
          duration: 5000,
          easing(t) {
            return t
          }
        }
      )
    },
    getBikePath(path) {
      // update source and layer
      const sourceTargets = ['route', 'point-start', 'point-end']
      sourceTargets.forEach(item => {
        this.mapInstance.getLayer(item) && this.mapInstance.removeLayer(item)
        this.mapInstance.getSource(item) && this.mapInstance.removeSource(item)
      })

      // bikePath source
      this.mapInstance.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
              type: "LineString",
              coordinates: path
          }
        }
      })

      // startPoint source
      this.mapInstance.addSource("point-start", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                description: "Start"
              },
              geometry: {
                type: "Point",
                coordinates: [path[0][0], path[0][1]]
              }
            }
          ]
        }
      })

      // endPoint source
      this.mapInstance.addSource("point-end", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                description: "End"
              },
              geometry: {
                type: "Point",
                coordinates: [path[path.length - 1][0], path[path.length - 1][1]]
              }
            }
          ]
        }
      })

      // add souce in layer
      this.mapInstance.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#CC8A4D",
          "line-width": 4,
          "line-opacity": 0.6
        }
      })

      this.mapInstance.addLayer({
        id: "point-start",
        type: "circle",
        source: "point-start",
        paint: {
          "circle-color": "#FEC804",
          'circle-stroke-width': 2,
          'circle-stroke-color': "#3A5A69",
          "circle-radius": 5
        }
      })

      this.mapInstance.addLayer({
        id: "point-end",
        type: "circle",
        source: "point-end",
        paint: {
          "circle-color": "#C2E3F4",
          'circle-stroke-width': 2,
          'circle-stroke-color': "#3A5A69",
          "circle-radius": 5
        }
      })

      // get current bikePath middlePoint
      const middlePoint = Math.floor(path.length / 2)
      const { innerWidth } = window

      const getZoomSize = () => {
        if ((middlePoint > 40 && innerWidth > 575)) {
          return 11
        } else if ((middlePoint > 40 && innerWidth < 575 )) {
          return 9
        } else if(middlePoint < 40) return 13
      }

      // jump to current bikePath middle point
      this.mapInstance.jumpTo({
        center: [path[middlePoint][0], path[middlePoint][1]],
        zoom: getZoomSize(),
        speed: 2,
        curve: 1,
        duration: 5000,
        easing(e) {
          return e
        }
      })
    },
    async getBikeStation(city) {
      await this.$store.dispatch('getAllStation', city)
      this.station = this.$store.state.station
    }
  },
  mounted() {
    this.initMapBox()
  }
}
</script>

<style lang="sass">
.popup-flex
  display: flex
  p
    &:nth-of-type(1)
      margin-right: 20px

.popup-content span:nth-of-type(1)
  color: #F2DD66

@keyframes userPoint
  0%
    box-shadow: 0 0 0 rgba(#a3a3a3,0.7)
  60%
    opacity: 1
  100%
    box-shadow: 0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3, 0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3

.marker
  width: 12px
  height: 12px
  border-radius: 50%
  position: relative
  border: 3px solid #a3a3a3
  transition: 0.3s
  &.hidden
    opacity: 0
    visibility: hidden
  &.self
    background: #172532
    animation: userPoint 0.5s both infinite alternate
  &.restaurant
    background: #EE3239
  &.scenicSpot
    background: #5EAA5F
  &.hotel
    background: #FECE00

.textBlock
  position: absolute
  top: -42px
  width: 50px
  left: 50%
  transform: translateX(-50%)
  font-size: 12px
  text-align: center
  line-height: 26px
  background: #000
  color: #fff
  border-radius: 6px
  &.self
    width: 50px
  &.restaurant,&.scenicSpot,&.hotel
    min-width: 100px
    padding: 0 5px
  &:after
    content: ''
    position: absolute
    width: 0
    height: 0
    border-style: solid
    border-width: 8px 5px 0 5px
    border-color: #000 transparent transparent transparent
    left: 50%
    transform: translateX(-50%)
    bottom: -8px

</style>
