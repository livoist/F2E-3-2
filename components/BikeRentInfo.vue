<template lang="pug">
div
  .fixedBikeRentInfo(
    :class="{ 'active': (isOpenFixedInfo && !isOpenLocation) }"
  )
    div
      | 可租借 / CanRent:
      span {{ canRent }}
    div
      | 未歸還 / NotReturn:
      span {{ notReturn }}
    div.checkboxBlock
      div
        | 餐廳 / Restaurant:
        input(type="checkbox" v-model="isOpenRestaurant")
      div
        | 景點 / ScenicSpot:
        input(type="checkbox" v-model="isOpenScenicSpot")
      div
        | 住宿 / Hotel:
        input(type="checkbox" v-model="isOpenHotel")


  .bikeRentInfos(:class="{ 'active': isOpenLocation }")
    .selectionContainer.basicSearch
      .selectBox
        p 基本搜尋
        p.slash BasicSearch
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
            | 可租借
            br
            | CanRent
          p {{ canRent }}
        div
          p
            | 未歸還
            br
            | NotReturn
          p {{ notReturn }}

    .selectionContainer.advance(:class="{ 'active': isOpenLocation }")
      .selectBox
        p 進階搜尋
        p.slash AdvanceSearch
      .selectBox
        p 搜尋範圍 / distance
        CustomSelect.advance(
          :selectList="ranges"
          @defVal="getCurMeters"
        )
      .result
        p {{ getCurNearByStation.length }} 租借站
        p {{ getCurNearByStation.length }} Near Station

      .detailInfo(v-if="getCurNearByStation.length !== 0")
        div(
          v-for="(item, index) in getCurNearByStation"
          :key="item.id"
          :data-idx="index + 1"
          @click="getCurNearNameItem(item)"
        )
          p
            | 中文站名 / Name-zh :
            br
            |
            span {{ item.name.Zh_tw }}
          p
            | 英文站名 / Name-en :
            br
            |
            span {{ item.name.En }}
          p
            | 中文地址 / Address-zh :
            br
            |
            span {{ item.address.Zh_tw }}
          p
            | 英文地址 / Address-en :
            br
            |
            span {{ item.address.En }}

          template(v-if="getDynamicNearByArray.length !== 0")
            p
              | 可租借 / CanRent : 
              span {{ getDynamicNearByInfo(item.id, 'AvailableRentBikes') }}
            p
              | 未歸還 / NotReturn : 
              span {{ getDynamicNearByInfo(item.id, 'AvailableReturnBikes') }}
            p
              | 資料更新時間 / UpdateTimes :
              br
              |
              span {{ getDynamicNearByInfo(item.id, 'UpdateTime') }}

      .notSelect(v-else-if="curMeters === 0") 尚未選擇距離

      .notFound(v-else)
        | 此距離範圍沒有租借站
        br
        | ( Not found match condition result )

</template>

<script>
export default {
  name: 'BikeRentInfo',
  props: {
    isOpenLocation: {
      type: Boolean,
      default: false
    },
    isClearInfo: {
      type: Boolean,
      default: false
    }
  },
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
      ranges: [250, 500, 750, 1000],
      stationNames: [],
      curCity: '',
      curSelect: '',
      curTarget: '',
      stationNames: [],
      isLoading: false,
      isReloading: false,
      canRent: 0,
      curRents: '',
      notReturn: 0,
      curMeters: 0,
      dynamicNearByInfo: {},
      isOpenFixedInfo: false,
      isOpenRestaurant: false,
      isOpenScenicSpot: false,
      isOpenHotel: false
    }
  },
  watch: {
    isOpenRestaurant: {
      handler(val) {
        const allRestaurant = document.querySelectorAll('.marker.restaurant')
        if (!val) {
          allRestaurant.forEach(item => item.classList.add('hidden'))
        } else {
          allRestaurant.forEach(item => item.classList.remove('hidden'))
        }
      }
    },
    isOpenScenicSpot: {
      handler(val) {
        const allScenicSpot = document.querySelectorAll('.marker.scenicSpot')
        if (!val) {
          allScenicSpot.forEach(item => item.classList.add('hidden'))
        } else {
          allScenicSpot.forEach(item => item.classList.remove('hidden'))
        }
      }
    },
    isOpenHotel: {
      handler(val) {
        const allHotel = document.querySelectorAll('.marker.hotel')
        if (!val) {
          allHotel.forEach(item => item.classList.add('hidden'))
        } else {
          allHotel.forEach(item => item.classList.remove('hidden'))
        }
      }
    },
    // 是否清除舊的Info
    isClearInfo: {
      immediate: true,
      handler(val) {
        if(val) {
          this.isOpenFixedInfo = false
        }
      }
    },
    curMeters: {
      handler(val) {
        if (val) this.getResultNearByPos(val)
      }
    },
    curCity: {
      immediate: true,
      handler(val) {
        if (val) {
          this.canRent = 0
          this.notReturn = 0
          this.$emit('isLoading', true)
          this.isReloading = true
          this.getAllStationInfo()

          setTimeout(() => {
            this.isReloading = false
            this.$emit('isLoading', false)
          }, 1000)
        }
      }
    },
    curSelect: {
      immediate: true,
      handler(val) {
        if (val) {
          this.canRent = 0
          this.notReturn = 0
          this.getCurCityMap()
          this.getRestaurantNearPos(this.curCity, this.curTarget.pos)
          this.getScenicSpotNearByPos(this.curCity, this.curTarget.pos)
          this.getHotelNearByPos(this.curCity, this.curTarget.pos)
          setTimeout(() => {
            this.canRent = this.curRent.AvailableRentBikes
            this.notReturn = this.curRent.AvailableReturnBikes
          }, 500)
        }
      }
    }
  },
  computed: {
    getCurNearByStation() {
      return this.$store.state.stationNearBy.map(item => {
        return {
          name: item.StationName,
          address: item.StationAddress,
          rent: item.BikesCapacity,
          id: item.StationUID,
          pos: item.StationPosition
        }
      })
    },
    getDynamicNearByArray() {
      return this.$store.state.availabilityNearBy
    }
  },
  methods: {
    getCurCity(val) {
      this.curCity = val
    },
    getCurSelect(val) {
      this.curSelect = val
    },
    getCurMeters(val) {
      this.curMeters = val
    },
    getRestaurantNearPos(city, pos) {
      this.$store.dispatch('getRestaurantNearByPos', { city, pos })
    },
    getScenicSpotNearByPos(city, pos) {
      this.$store.dispatch('getScenicSpotNearByPos', { city, pos })
    },
    getHotelNearByPos(city, pos) {
      this.$store.dispatch('getHotelNearByPos', { city, pos })
    },
    getCurNearNameItem(item) {
      this.isOpenFixedInfo = false
      this.$emit('isOpenLocation', false)
      this.$store.dispatch('getCurNearItem', item)
    },
    getDynamicNearBy(condition) {
      this.$store.dispatch('getAvailabilityNearBy', condition)
    },
    getDynamicNearByInfo(id, key) {
      const targets = this.getDynamicNearByArray
      const target = targets.filter(item => {
        return item.StationUID === id
      })

      if (target[0] !== undefined) return target[0][key]
    },
    getResultNearByPos(meter) {
      let searchCondition = {}

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords
          searchCondition = {
            lat: latitude,
            lon: longitude,
            distance: meter
          }

          this.$store.dispatch('getStationNearBy', searchCondition)
          this.getDynamicNearBy(searchCondition)
        })
      }
    },
    getCurRent() {
      this.isOpenFixedInfo = true

      this.$emit('isOpenLocation', false)
      const resource = this.curRents.filter(item => {
        return item.StationID === this.curTarget.id
      })

      this.curRent = resource[0]
    },
    async getAllStationInfo() {
      await this.$store.dispatch('getAllStation', this.curCity)
      this.stationNames = await this.$store.state.allStationName
      await this.getAllStationRentBike()
    },
    async getAllStationRentBike() {
      await this.$store.dispatch('getAvailability', this.curCity)
      this.curRents = this.$store.state.availability
    },
    async getCurCityMap() {
      const cityMap = this.$store.state.curCityMap

      const target = cityMap.filter(item => item.name === this.curSelect)
      this.curTarget = target[0]

      await this.$store.dispatch('getCurTarget', this.curTarget)
      this.getCurRent()
    },
  }
}
</script>

<style lang="sass">
.bikeRentInfos
  position: absolute
  left: 120%
  top: 0
  z-index: -1
  transform: translateY(-300%)
  transition: 0.5s ease-in-out
  &.active
    transform: translateY(0)

.selectionContainer
  background: #172532
  width: 290px
  max-width: 100%
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column
  padding: 20px 0
  transform: translateY(-300%)
  transition: 0.5s ease-in-out
  @media (max-width: 575px)
    width: auto
  &.active
    transform: translateY(0)
  &.advance,&.basicSearch
    padding: 14px 20px 20px
    transform: translateY(0)
    @media (max-width: 575px)
      padding: 3vmin 9vmin 4vmin 9vmin
  &.basicSearch
    .detailInfo
      margin-top: 10px
  &.advance
    margin-bottom: 20px
    position: relative
    z-index: -1
    .result
      font-size: 14px
      color: #fff
      margin-bottom: 20px
      text-align: center
    .notFound,.notSelect
      color: #a3a3a3
      text-align: center
      line-height: 1.5
    .detailInfo
      flex-direction: column
      overflow-y: scroll
      max-height: 35vh
      margin-top: 0
      @media (max-width: 575px)
        max-height: 26vh
      div
        border-top: 1px solid #fff
        padding: 10px
        display: flex
        flex-direction: column
        justify-content: center
        align-items: flex-start
        position: relative
        cursor: pointer
        > *
            pointer-events: none
        &:after
          content: attr(data-idx)
          position: absolute
          text-align: center
          line-height: 16px
          width: 16px
          height: 16px
          background: #fff
          color: #172532
          font-size: 12px
          left: -16px
          top: -1px
        p
          font-weight: normal
          font-size: 14px
          color: #a3a3a3
          text-align: left
          margin: 0 0 10px
        span
          color: rgba(#fff,0.9)

.selectBox
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  margin: 10px 0
  @media (max-width: 575px)
    margin: 2vmin 0
  &.mb-30
    margin-bottom: 30px
    @media (max-width: 575px)
      margin-bottom: 4vmin
  > p
      color: #a3a3a3
      font-weight: bold
      font-size: 14px
      letter-spacing: 4px
      position: relative
      @media (max-width: 575px)
        font-size: 3vmin
      &.fz-14
        font-size: 14px
      &.slash
        &:after
          content: ''
          position: absolute
          left: 50%
          bottom: -50%
          transform: translateX(-50%)
          width: 220px
          height: 1px
          background: #fff

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
          line-height: 1.5
        &:nth-of-type(2)
          margin-top: 6px
          font-size: 18px
          font-weight: bold
          color: rgba(#fff,0.85)


.fixedBikeRentInfo
  position: fixed
  top: 0
  left: 50%
  transform: translateX(-50%)
  display: flex
  background: rgba(#08111A,0.75)
  padding: 6px 4px 8px
  border-radius: 0 0 4px 4px
  opacity: 0
  visibility: hidden
  transition: 0.3s
  white-space: nowrap
  @media (max-width: 575px)
    padding: 2vmin 1vmin
    flex-direction: column
    width: 46%
    left: 76%
  &.active
    opacity: 1
    visibility: visible
  div
    margin: 0 10px
    color: rgba(#fff,0.6)
    font-size: 14px
    &.checkboxBlock
      display: flex
      @media (max-width: 575px)
        flex-direction: column
        align-items: flex-start
      > div
        display: flex
        justify-content: center
        align-items: center
        position: relative
        margin: 0 14px
        &:nth-of-type(1):before
          background: #EE3239
        &:nth-of-type(2):before
          background: #5EAA5F
        &:nth-of-type(3):before
          background: #FECE00
        &:before
          content: ''
          width: 10px
          height: 10px
          border: 2px solid #3A5A69
          border-radius: 50%
          position: absolute
          left: -16px
          top: 50%
          transform: translateY(-50%)
    @media (max-width: 575px)
      display: inline-block
      font-size: 3.5vmin
    span
      color: rgba(#fff,0.95)
      margin-left: 10px
      @media (max-width: 575px)
        font-size: 4vmin

</style>