<template lang="pug">
.sideMenu
  .searchBtns
    .location
      img(src="@img/location.png")
      .selectionContainer
        select(v-model="curCity")
          option(v-for="name in citys" :value="name") {{ name }}

        select(v-model="curSelect")
          option(v-for="name in stationNames" :value="name") {{ name }}
    .bike
      img(src="@img/bike.png")
    .path
      img(src="@img/path.png")

</template>

<script>
export default {
  name: 'SideMenu',
  data() {
    return {
      citys: [
        'Taipei',
        'NewTaipei',
        'Taoyuan',
        'Taichung',
        'Tainan',
        'Kaohsiung',
        'Hsinchu',
        'MiaoliCounty',
        'Chiayi',
        'PingtungCounty',
        'KinmenCounty'
      ],
      stationNames: '',
      curSelect: '',
      curCity: '',
      curTarget: ''
    }
  },
  watch: {
    curCity: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.stationInfo()
        }
      }
    },
    curSelect: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.getCurCityMap()
        }
      }
    }
  },
  methods: {
    getCurCityMap() {
      const cityMap = this.$store.state.curCityMap

      const target = cityMap.filter(item => item.name === this.curSelect)

      this.curTarget = target[0]
      this.$store.dispatch('getCurTarget', this.curTarget)
      console.log('this', this.curTarget)

      // const marker = new this.$map.Marker()
  
      // marker
      //   .setLngLat([this.curTarget.pos.PositionLon, this.curTarget.pos.PositionLat])
      //   .setPopup(new this.$map.Popup().setHTML(this.curTarget.name))
      //   .addTo(map)

      // this.$map.flyTo(
      //   {
      //     center: [this.curTarget.pos.PositionLon, this.curTarget.pos.PositionLat],
      //     zoom: 13,
      //     speed: 2,
      //     curve: 1,
      //     easing(t) {
      //       return t
      //     }
      //   }
      // )
    },
    async stationInfo() {
      await this.$store.dispatch('getAllStation', this.curCity)
      this.stationNames = this.$store.state.allStationName
    }
  }
}
</script>

<style lang="sass" scoped>
.sideMenu
  width: 64px
  height: 100vh
  background: #172532
  position: fixed
  left: 0
  top: 0
  z-index: 10

.searchBtns
  display: flex
  flex-direction: column
  align-items: center
  > div
      margin: 20px auto
      cursor: pointer

.location
  position: relative
  .selectionContainer
    position: absolute
    right: -18vw
    background: #172532
    width: 300px
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column
    padding: 50px 0
    top: 0
</style>