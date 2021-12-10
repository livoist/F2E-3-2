<template lang="pug">
#map

</template>

<script>
export default {
  data() {
    return {
      station: '',
      target: '',
      mapInstance: null,
      mapMarker: null,
      mapPopup: null,
      nearMarkers: [],
      selfMarkers: []
    }
  },
  computed: {
    getCurStationTarget() {
      return this.$store.state.curTarget
    },
    getCurBikeGeometry() {
      return this.$store.state.curBikePath
    },
    getCurNearByStation() {
      return this.$store.state.stationNearBy
    },
    getUserPosition() {
      return this.$store.state.userPos
    },
    getCurNearItem() {
      return this.$store.state.nearNameItem
    },
    getAvailabilityNearByArray() {
      return this.$store.state.availabilityNearBy
    }
  },
  watch: {
    getCurBikeGeometry: {
      deep: true,
      handler(val) {
        if (val !== []) this.getBikePath(val)
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
      this.nearMarkers[targetMarker]
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
    async getUserCurPosNearByStation(nearByAry) {
      // remove old nearMarker
      if (this.nearMarkers.length > 0) {
        this.nearMarkers.forEach(item => item.remove())
        this.nearMarkers = []
      }

      // remove old selfMarker
      if (this.selfMarkers.length > 0) {
        this.selfMarkers.forEach(item => item.remove())
        this.selfMarkers = []
      }
  
      // custom selfMarker style
      const el = document.createElement('div')
      const childText = document.createElement('div')
      childText.innerHTML = 'SELF'

      childText.classList.add('textBlock')
      el.classList.add('selfMarker')
      el.appendChild(childText)

      // add selfMarker on map
      const selfMarker = new this.$map.Marker(el)
      selfMarker.setLngLat(this.getUserPosition).addTo(this.mapInstance)
      this.selfMarkers.push(selfMarker)

      // add all nearMarker on map
      nearByAry.forEach(item => {
        const { StationName, StationPosition } = item
        const nearMarker = new this.$map.Marker()

        nearMarker
          .setLngLat([StationPosition.PositionLon, StationPosition.PositionLat])
          .setPopup(this.mapPopup.setHTML(StationName.Zh_tw))
          .addTo(this.mapInstance)

        // save all nearMarker
        this.nearMarkers.push(nearMarker)
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
          zoom: 18,
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

.selfMarker
  background: #172532
  border: 3px solid #a3a3a3
  width: 12px
  height: 12px
  border-radius: 50%
  position: relative
  animation: userPoint 0.5s both infinite alternate
  // &:before
  //   content: ''
  //   position: absolute
  //   left: 50%
  //   top: 50%
  //   transform: translate(-50%,-50%)
  //   width: 1000px
  //   height: 1000px
  //   border-radius: 50%
  //   background: rgba(#000,0.3)

.textBlock
  position: absolute
  top: -42px
  width: 50px
  height: 26px
  left: 50%
  transform: translateX(-50%)
  font-size: 12px
  text-align: center
  line-height: 26px
  background: #000
  color: #fff
  border-radius: 6px
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
