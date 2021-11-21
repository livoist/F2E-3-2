<template lang="pug">
.sideMenu
  LoadingPage(:isLoading="isLoading")

  .searchBtns
    .location(@click.self="isOpenLocation = !isOpenLocation")
      img(src="@img/location.png")

      .selectionContainer(:class="{ 'active': isOpenLocation }")
        .selectBox
          p 城市 / City
          CustomSelect.citys(
            :selectList="citys"
            @defVal="getCurCity"
          )
        .selectBox
          p 地點 / Location
          CustomSelect.location(
            :selectList="stationNames"
            :reloading="isReloading"
            @defVal="getCurSelect"
          )
        .detailInfo
          div
            p
              | 尚餘車位
              br
              | CanRent
            p {{ canRent }}
          div
            p
              | 未歸還
              br
              | NotReturn
            p {{ notReturn }}

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
      stationNames: [],
      curSelect: '',
      curCity: '',
      curTarget: '',
      isOpenLocation: false,
      isLoading: false,
      isReloading: false,
      curRents: '',
      curRent: 0,
      notReturn: 0,
      canRent: 0
    }
  },
  watch: {
    curCity: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.canRent = 0
          this.notReturn = 0
          this.isLoading = true
          this.isReloading = true
          this.stationInfo()

          setTimeout(() => {
            this.isReloading = false
            this.isLoading = false
          }, 1000)
        }
      }
    },
    curSelect: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.canRent = 0
          this.notReturn = 0
          this.getCurCityMap()

          setTimeout(() => {
            this.canRent = this.curRent.AvailableRentBikes
            this.notReturn = this.curRent.AvailableReturnBikes
          }, 500)
        }
      }
    }
  },
  methods: {
    getCurRent() {
      const resource = this.curRents.filter(item => {
        return item.StationID === this.curTarget.id
      })

      this.curRent = resource[0]
    },
    getCurCity(val) {
      this.curCity = val
    },
    getCurSelect(val) {
      this.curSelect = val
    },
    async getAllStationRentBike() {
      await this.$store.dispatch('getAvailability', this.curCity)
      this.curRents = this.$store.state.availability
    },
    async getCurCityMap() {
      const cityMap = await this.$store.state.curCityMap

      const target = cityMap.filter(item => item.name === this.curSelect)
      this.curTarget = target[0]

      await this.$store.dispatch('getCurTarget', this.curTarget)
      this.getCurRent()
    },
    async stationInfo() {
      await this.$store.dispatch('getAllStation', this.curCity)
      this.stationNames = await this.$store.state.allStationName
      await this.getAllStationRentBike()
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
  z-index: 100

.searchBtns
  display: flex
  flex-direction: column
  align-items: center
  > div
      margin: 20px auto

.location,.bike,.path
  cursor: pointer

.location
  position: relative
  > img
      pointer-events: none
  .selectionContainer
    position: absolute
    left: 200%
    z-index: -1
    background: #172532
    width: 300px
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column
    padding: 20px 0
    top: -20px
    transform: translateY(-300%)
    transition: 0.5s ease-in-out
    &.active
      transform: translateY(0)

  .selectBox
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    margin: 10px 0
    > p
        color: #a3a3a3
        font-weight: bold
        font-size: 20px
        letter-spacing: 4px
        margin-bottom: 14px
        &.fz-14
          font-size: 14px

  .detailInfo
    display: flex
    margin-top: 30px
    > div
        display: flex
        justify-content: center
        align-items: center
        flex-direction: column
        text-align: center
        color: #a3a3a3
        margin: 0 20px
        p
          &:nth-of-type(1)
            font-weight: bold
          &:nth-of-type(2)
            margin-top: 12px
            font-size: 18px
</style>