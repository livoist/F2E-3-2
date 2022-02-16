<template lang="pug">
#map
  LoadingPage
  EnterAnimation
  MarkerDetailModal(
    :modalType="curModalType"
    :info="curMarkerDetailInfo"
  )

</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      station: '',
      target: '',
      mapInstance: null,
      mapMarker: null,
      mapPopup: null,
      selfPosMarker: [],
      stationMarker: [],
      nearStationMarkers: [],
      nearRestaruantMarkers: [],
      nearScenicSpotMarkers: [],
      nearHotelMarkers: [],
      curMarkerDetailInfo: {},
      curModalType: ''
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
      getHotel: 'hotelNearBy',
      isClearMarkers: 'isClearMakers',
      isClearBikePath: 'isClearBikePath',
      getBasicSelect: 'basicSelect',
      updateUserPosSelect: 'updateUserPosSelect'
    })
  },
  watch: {
    getCurBikeGeometry: {
      deep: true,
      handler(val) {
        if (val.length !== 0) this.getBikePath(val)
      }
    },
    getBasicSelect: {
      deep: true,
      handler(val) {
        if (val) {
          this.getBikeStationMarker(this.getCurStationTarget)
          this.changeBasicSelect(false)

          this.getStationNearByMarkers(
            'restaurant',
            this.getRestaruant,
            this.nearRestaruantMarkers
          )

          this.getStationNearByMarkers(
            'scenicSpot',
            this.getScenicSpot,
            this.nearScenicSpotMarkers
          )

          this.getStationNearByMarkers(
            'hotel',
            this.getHotel,
            this.nearHotelMarkers
          )
        }
      }
    },
    updateUserPosSelect: {
      deep: true,
      handler(val) {
        if (val) {
          this.getUserCurPosNearByStation(this.getCurNearByStation)
          this.getCurNearSelectMarker(this.getCurNearItem)
          this.isUpdateUserPosSelect(false)
        }
      }
    },
    getRestaruant: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'restaurant',
            this.getRestaruant,
            this.nearRestaruantMarkers
          )
        }
      }
    },
    getScenicSpot: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'scenicSpot',
            this.getScenicSpot,
            this.nearScenicSpotMarkers
          )
        }
      }
    },
    getHotel: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'hotel',
            this.getHotel,
            this.nearHotelMarkers
          )
        }
      }
    },
    isClearMarkers: {
      immediate: true,
      handler(val) {
        if (val) {
          this.clearOldMarkers(this.stationMarker)
          this.clearOldMarkers(this.nearRestaruantMarkers)
          this.clearOldMarkers(this.nearScenicSpotMarkers)
          this.clearOldMarkers(this.nearHotelMarkers)
          this.isClearInfoMarker(false)
        }
      }
    },
    isClearBikePath: {
      immediate: true,
      handler(val) {
        if (val) {
          this.clearBikePath()
          this.isClearInfoBikePath(false)
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'changeBasicSelect',
      'isClearInfoMarker',
      'isClearInfoBikePath',
      'getAllStation',
      'isUpdateUserPosSelect',
      'isLoadingSource'
    ]),
    async initMapBox() {
      this.mapInstance = await new this.$map.Map({
        accessToken: 'pk.eyJ1IjoiYmVubGFpIiwiYSI6ImNrdzRib2FzYTAydTQyb3JoaHU4MGVzcWoifQ.j-bTKoCaWwbV4Ldqvy2Vrg',
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [120.9738819, 23.97565],
        zoom: 7
      })

      this.mapMarker = await new this.$map.Marker()
      this.mapPopup = await new this.$map.Popup()

      setTimeout(() => { this.isLoadingSource(true) }, 2000)
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
    clearOldMarkers(targets) {
      if (targets.length > 0) {
        targets.forEach(item => item.remove())
        targets = []
      } return
    },
    clearBikePath() {
      // update / remove source and layer
      const sourceTargets = ['route', 'point-start', 'point-end']
      sourceTargets.forEach(item => {
        this.mapInstance.getLayer(item) && this.mapInstance.removeLayer(item)
        this.mapInstance.getSource(item) && this.mapInstance.removeSource(item)
      })
    },
    createCustomPoint(type, item, num = '') {
      const el = document.createElement('div')
      const childText = document.createElement('div')
  
      if (item === 'SELF') {
        childText.innerHTML = item
        el.classList.add('marker', type)
        childText.classList.add('textBlock', type)
      } else {
        childText.innerHTML = item.name.length > 8 ? `${item.name.slice(0, 7)}...` : item.name
        el.classList.add('marker', type, 'hidden')
        childText.classList.add('textBlock', type, `${type}-${num}`)
      }

      el.appendChild(childText)

      return el
    },
    getStationNearByMarkers(type, markersInfo, markersArray) {
      if (markersArray.length > 0) {
        markersArray.forEach(item => item.remove())
        markersArray = []
      }

      const result = markersInfo.slice()
      result.forEach((item, idx) => {
        const el = this.createCustomPoint(type, item, idx)
        const markers = new this.$map.Marker(el)
        const markerInfo = { type: type, idx: idx, info: item  }

        markers.setLngLat(item.pos).addTo(this.mapInstance)
        this.nearRestaruantMarkers.push(markers)

        this.addEventListenerToMarker(markerInfo)
      })
    },
    getUserCurPosNearByStation(nearByAry) {
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
      const el = this.createCustomPoint('self', 'SELF')

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
      this.clearOldMarkers(this.stationMarker)

      this.mapMarker
        .setLngLat([target.pos.PositionLon, target.pos.PositionLat])
        .setPopup(this.mapPopup.setHTML(target.address))
        .addTo(this.mapInstance)
        .togglePopup(true)

      this.stationMarker.push(this.mapMarker)

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
      // clear bike path
      this.clearBikePath()

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
      await this.getAllStation(city)
      this.station = this.$store.state.station
    },
    getCurMarkerDetailInfo(type, info) {
      this.curMarkerDetailInfo = info
      this.curModalType = type
      this.$store.dispatch('isOpenModal', true)
    },
    addEventListenerToMarker(targetMarker) {
      const { type, idx, info } = targetMarker
      const targetEl = document.querySelector(`.${type}-${idx}`)

      targetEl.addEventListener('click', () => this.getCurMarkerDetailInfo(type, info))
    },
    removeEventListenerToMarker() {
      const getAllMarker = document.querySelectorAll('.marker')
      getAllMarker.forEach(
        item => item.removeEventListener('click', this.getCurMarkerDetailInfo(this.curMarkerDetailInfo))
      )
    },
  },
  mounted() {
    this.initMapBox()
  },
  beforeDestroyed() {
    this.removeEventListenerToMarker()
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
  +setSize(12px)
  border-radius: 50%
  position: absolute
  border: 3px solid #a3a3a3
  transition: 0.3s
  z-index: 1
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
  +setPosAbs(-42px,null,null,50%)
  width: 50px
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
    +setPosAbs(null,null,-8px,50%)
    +setSize(0)
    border-style: solid
    border-width: 8px 5px 0 5px
    border-color: #000 transparent transparent transparent
    transform: translateX(-50%)

</style>
