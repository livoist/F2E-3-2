<template lang="pug">
#map

</template>

<script>
export default {
  data() {
    return {
      station: '',
      target: ''
    }
  },
  computed: {
    getCurTarget() {
      return this.$store.state.curTarget
    }
  },
  watch: {
    getCurTarget: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val !== '') {
          this.target = val
          const { getMarker } = this.initMapBox()

          getMarker(val)
        }
      }
    }
  },
  methods: {
    initMapBox() {
      const map = new this.$map.Map({
        accessToken: 'pk.eyJ1IjoiYmVubGFpIiwiYSI6ImNrdzRib2FzYTAydTQyb3JoaHU4MGVzcWoifQ.j-bTKoCaWwbV4Ldqvy2Vrg',
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [120.9738819, 23.97565],
        zoom: 7
      })

      const marker = new this.$map.Marker()
      const popup = new this.$map.Popup()

      function getMarker(target) {
        console.log('getMarker done')
        marker
          .setLngLat([target.pos.PositionLon, target.pos.PositionLat])
          .setPopup(popup.setHTML(target.name))
          .addTo(map)
          .togglePopup(true)

        map.jumpTo(
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
      }

      return {
        getMarker
      }
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
