<template lang="pug">
#map

</template>

<script>
export default {
  name: 'map',
  data() {
    return {
      station: '',
      target: '',
      mapInstance: null,
      mapMarker: null,
      mapPopup: null,
      nearMarkers: [],
      selfMarkers: [],
      removeMarker: false
    }
  },
  computed: {
    getCurTarget() {
      return this.$store.state.curTarget
    },
    getCurBikeGeometry() {
      return this.$store.state.curBikePath
    },
    getCurStationNearBy() {
      return this.$store.state.stationNearBy
    },
    getUserPosition() {
      return this.$store.state.userPos
    }
  },
  watch: {
    getCurBikeGeometry: {
      deep: true,
      handler(val) {
        if (val !== []) {
          this.getBikePath(val)
        }
      }
    },
    getCurTarget: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val !== '') {
          this.getMarker(val)
        }
      }
    },
    getCurStationNearBy: {
      deep: true,
      handler(val) {
        if (val) {
          this.getUserCurStationNearBy(val)
        }
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
    async getUserCurStationNearBy(nearByAry) {
      // remove old nearMarker
      if (this.nearMarkers.length > 0) {
        this.nearMarkers.forEach(item => item.remove())
      }

      // remove old selfMarker
      if (this.selfMarkers.length > 0) {
        this.selfMarkers.forEach(item => item.remove())
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
    getMarker(target) {
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

      // get current zoomSize
      let zoomSize = middlePoint > 30 ? 11 : 13

      // jump to current bikePath middle point
      this.mapInstance.jumpTo({
        center: [path[middlePoint][0], path[middlePoint][1]],
        zoom: zoomSize,
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
  },
  async fetch() {
    this.initMapBox()
  }
}
</script>

<style lang="sass">
.selfMarker
  background: #172532
  border: 3px solid #a3a3a3
  width: 12px
  height: 12px
  border-radius: 50%
  position: relative

.textBlock
  position: absolute
  top: -50px
  width: 60px
  height: 30px
  left: 50%
  transform: translateX(-50%)
  font-size: 14px
  text-align: center
  line-height: 30px
  background: #000
  color: #fff
  border-radius: 6px

</style>