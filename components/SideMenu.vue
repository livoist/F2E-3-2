<template lang="pug">
.sideMenu
  .searchBtns
    .location
      img(src="@img/location.png")
      .selectionContainer
        CustomSelect(:selectList="citys" @defVal="getCurCity")
        CustomSelect(:selectList="stationNames" @defVal="getCurSelect")
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
          console.log('cit', val)
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
    getCurCity(val) {
      console.log('c val', val)
      this.curCity = val
    },
    getCurSelect(val) {
      this.curSelect = val
    },
    getCurCityMap() {
      const cityMap = this.$store.state.curCityMap

      const target = cityMap.filter(item => item.name === this.curSelect)
      this.curTarget = target[0]

      this.$store.dispatch('getCurTarget', this.curTarget)
    },
    async stationInfo() {
      await this.$store.dispatch('getAllStation', this.curCity)
      this.stationNames = await this.$store.state.allStationName
      console.log('this.sta', this.stationNames)
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
    left: 200%
    background: #172532
    width: 300px
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column
    padding: 50px 0
    top: -20px
</style>