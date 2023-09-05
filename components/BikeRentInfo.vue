<template lang="pug">
div
  .fixedBikeRentInfo(
    :class="{ 'active': isOpenFixedInfo && !isOpenLocation }"
  )
    div
      | 可租借 / balance:
      span {{ canRent }}
    div
      | 未歸還 / not return:
      span {{ notReturn }}

    div.checkboxBlock
      div(v-for="(item, idx) in checkboxs" :key="item.id")
        label(:for="item.type") {{ item.name }}
        input(
          type="checkbox"
          :name="item.type"
          :id="item.type"
          v-model="item.modelTarget"
          @change="isShowStationNearByInfos(item.modelTarget, item.type)"
        )

  .bikeRentInfos(:class="{ 'active': isOpenLocation }")
    .selectionContainer.basicSearch
      .selectBox
        p.mb-1 基本搜尋
        p BasicSearch
        .slash
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
      .detailInfo.basic
        div
          p
            | 可租借
            br
            | balance
          p {{ canRent }}
        div
          p
            | 未歸還
            br
            | not eturn
          p {{ notReturn }}

    .selectionContainer.advance(:class="{ 'active': isOpenLocation }")
      .selectBox
        p.mb-1 進階搜尋
        p AdvanceSearch
        .slash
      .selectBox
        p 搜尋範圍 / Distance
        CustomSelect.advance(
          :selectList="ranges"
          @defVal="getCurMeters"
        )
      .result(v-if="getCurNearByStation.length !== 0")
        p 租借站 / Near Station {{ getCurNearByStation.length }}
      .detailInfo(v-if="getCurNearByStation.length !== 0")
        div(
          v-for="(item, index) in getCurNearByStation"
          :key="item.id"
          :data-idx="index + 1"
          @click="getCurNearNameItemInfo(item)"
        )
          p
            | 中文站名 / name-zh :
            br
            |
            span {{ item.name.Zh_tw }}
          p
            | 英文站名 / name-en :
            br
            |
            span {{ item.name.En }}
          p
            | 中文地址 / address-zh :
            br
            |
            span {{ item.address.Zh_tw }}
          p
            | 英文地址 / address-en :
            br
            |
            span {{ item.address.En }}

          template(v-if="getDynamicNearByArray.length !== 0")
            p
              | 可租借 / balance : 
              span {{ getDynamicNearByInfo(item.id, 'AvailableRentBikes') }}
            p
              | 未歸還 / not return : 
              span {{ getDynamicNearByInfo(item.id, 'AvailableReturnBikes') }}
            p
              | 資料更新時間 / update times :
              br
              |
              span {{ getDynamicNearByInfo(item.id, 'UpdateTime') }}
      .notSelect(v-else-if="curMeters === 0") 尚未選擇距離
      .notFound(v-else)
        | 此範圍內沒有租借站
        br
        | (Station Not Found)

</template>

<script>
import { mapActions } from 'vuex'

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
    },
    isOpenRentDetailInfo: {
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
      isReloading: false,
      canRent: 0,
      curRents: '',
      notReturn: 0,
      curMeters: 0,
      dynamicNearByInfo: {},
      isOpenFixedInfo: false,
      checkboxs: [
        {
          name: '餐廳 / restaurant',
          type: 'restaurant',
          modelTarget: false
        },
        {
          name: '景點 / attractions',
          type: 'scenicSpot',
          modelTarget: false
        },
        {
          name: '住宿 / hotel',
          type: 'hotel',
          modelTarget: false
        }
      ]
    }
  },
  watch: {
    isOpenRentDetailInfo: {
      immediate: true,
      handler(val) {
        if (val) this.isOpenFixedInfo = true
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
      immediate: true,
      handler(val) {
        if (val) {
          this.isOpenFixedInfo = false
          this.getResultNearByPos(val)
          this.isOpenModal(false)
        }
      }
    },
    curCity: {
      immediate: true,
      handler(val) {
        if (val) {
          this.canRent = 0
          this.notReturn = 0
          this.isOpenModal(false)
          this.getAllStationInfo()
        }
      }
    },
    curSelect: {
      immediate: true,
      handler(val) {
        if (val) {
          this.canRent = 0
          this.notReturn = 0
          this.checkboxs.forEach(item => item.modelTarget = false)
          this.isOpenModal(false)

          this.getCurCityMap()
          this.getRestaurantNearByPosInfo(this.curCity, this.curTarget.pos)
          this.getScenicSpotNearByPosInfo(this.curCity, this.curTarget.pos)
          this.getHotelNearByPosInfo(this.curCity, this.curTarget.pos)

          setTimeout(() => {
            this.canRent = this.curRent.AvailableRentBikes
            this.notReturn = this.curRent.AvailableReturnBikes
          }, 500)
        }
      }
    },
    isOpenLocation: {
      immediate: true,
      handler(val) {
        if (val) {
          this.$store.dispatch('isClearInfoBikePath', true)
          this.checkboxs.forEach(item => item.modelTarget = false)
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
    ...mapActions([
      'isLoading',
      'changeBasicSelect',
      'getRestaurantNearByPos',
      'getScenicSpotNearByPos',
      'getHotelNearByPos',
      'getCurNearItem',
      'getAvailabilityNearBy',
      'getStationNearBy',
      'getAllStation',
      'getAvailability',
      'getCurTarget',
      'isUpdateUserPosSelect',
      'isOpenModal'
    ]),
    getCurCity(val) {
      this.curCity = val
    },
    getCurSelect(val) {
      this.curSelect = val
      this.changeBasicSelect(true)
    },
    getCurMeters(val) {
      this.curMeters = val
    },
    getRestaurantNearByPosInfo(city, pos) {
      this.getRestaurantNearByPos({ city, pos })
    },
    getScenicSpotNearByPosInfo(city, pos) {
      this.getScenicSpotNearByPos({ city, pos })
    },
    getHotelNearByPosInfo(city, pos) {
      this.getHotelNearByPos({ city, pos })
    },
    getCurNearNameItemInfo(item) {
      this.isOpenFixedInfo = false
      this.$emit('isOpenLocation', false)
      this.getCurNearItem(item)
      this.isUpdateUserPosSelect(true)
    },
    getDynamicNearBy(condition) {
      this.getAvailabilityNearBy(condition)
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

          this.getStationNearBy(searchCondition)
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
    isShowStationNearByInfos(val, type) {
      const infos = document.querySelectorAll(`.marker.${type}`)

      if (!val) {
        infos.forEach(item => item.classList.add('hidden'))
      } else {
        infos.forEach(item => item.classList.remove('hidden'))
      }
    },
    async getAllStationInfo() {
      this.isReloading = true
      this.isLoading(true)

      await this.getAllStation(this.curCity)
      this.stationNames = await this.$store.state.allStationName
      await this.getAllStationRentBike()

      this.isReloading = false
      this.isLoading(false)
    },
    async getAllStationRentBike() {
      await this.getAvailability(this.curCity)
      this.curRents = this.$store.state.availability
    },
    async getCurCityMap() {
      const cityMap = this.$store.state.curCityMap

      const target = cityMap.filter(item => item.name === this.curSelect)
      this.curTarget = target[0]

      await this.getCurTarget(this.curTarget)
      this.getCurRent()
    },
  }
}
</script>

<style lang="sass">
.slash
  width: 85%
  height: 1px
  background: #a3a3a3
  margin: 14.5px auto
  @media (max-width: 575px)
    margin: 2.5vmin auto

.mb-1
  margin-bottom: 4px

.line-h-1-3
  line-height: 1.3

.bikeRentInfos
  +setPosAbs(0,null,null,100%,-1)
  transform: translateY(-300%)
  transition: 0.5s ease-in-out
  &.active
    transform: translateY(0)

.selectionContainer
  +setFlex
  background: rgba(#172532,0.9)
  width: 290px
  max-width: 100%
  flex-direction: column
  padding: 20px 0
  transform: translateY(-300%)
  transition: 0.5s ease-in-out
  @media (max-width: 575px)
    width: 64vw
  &.active
    transform: translateY(0)
  &.advance,&.basicSearch
    padding: 14px 20px 20px
    transform: translateY(0)
    @media (max-width: 575px)
      padding: 3vmin 6.5vmin 4vmin 6.5vmin
  &.basicSearch
    .detailInfo
      margin-top: 10px
      @media (max-width: 575px)
        margin-top: 2vmin
  &.advance
    margin-bottom: 20px
    position: relative
    z-index: -1
    .result
      font-size: 14px
      color: #fff
      text-align: center
      margin: 0px auto 10px
      @media (max-width: 575px)
        margin: 0px auto 2vmin
    .notFound,.notSelect
      color: #a3a3a3
      text-align: center
      line-height: 1.5
      font-size: 12px
    .detailInfo
      flex-direction: column
      overflow-y: scroll
      max-height: 35vh
      margin-top: 0
      @media (max-width: 575px)
        max-height: 26vh
      div
        +setFlex(center,flex-start)
        border-top: 1px solid #fff
        padding: 10px
        flex-direction: column
        position: relative
        cursor: pointer
        > *
            pointer-events: none
        &:after
          content: attr(data-idx)
          +setSize(16px)
          +setPosAbs(-1px,null,null,-12px)
          text-align: center
          line-height: 16px
          background: #fff
          color: #172532
          font-size: 12px
        p
          font-weight: normal
          font-size: 14px
          color: #a3a3a3
          text-align: left
          margin: 0 0 10px
        span
          color: rgba(#fff,0.9)

.selectBox
  +setFlex
  flex-direction: column
  width: 100%
  &.mb-30
    margin-bottom: 30px
    @media (max-width: 575px)
      margin-bottom: 4vmin
  > p
      color: #a3a3a3
      font-weight: bold
      font-size: 12px
      letter-spacing: 2px
      position: relative
      @media (max-width: 575px)
        font-size: 3vmin
      &.fz-14
        font-size: 14px

.detailInfo
  display: flex
  margin-top: 30px
  font-size: 14px
  > div
      +setFlex
      flex-direction: column
      text-align: center
      color: #a3a3a3
      margin: 0 20px
      @media (max-width: 575px)
        margin: 0 3vmin
      p
        line-height: 1.5
        &:nth-of-type(1)
          font-weight: bold
        &:nth-of-type(2)
          margin-top: 6px
          font-weight: bold
          color: rgba(#fff,0.85)
          @media (max-width: 575px)
            margin-top: 1vmin
  &.basic p
    &:nth-child(1)
      line-height: 1.3
    &:nth-child(2)
      line-height: 1


.fixedBikeRentInfo
  position: fixed
  top: 0
  left: 50%
  transform: translateX(-50%)
  display: flex
  align-items: center
  background: rgba(#08111A,0.75)
  padding: 6px 4px 8px
  border-radius: 0 0 4px 4px
  opacity: 0
  visibility: hidden
  transition: 0.3s
  white-space: nowrap
  @media (max-width: 575px)
    padding: 3vmin 4vmin
    flex-direction: column
    align-items: flex-start
    right: 0
    transform: translateX(0)
  &.active
    opacity: 1
    visibility: visible
  div
    margin: 0 10px
    color: rgba(#fff,0.6)
    font-size: 14px
    @media (max-width: 575px)
      display: inline-block
      font-size: 3.3vmin
      margin: 0
      &:nth-child(1)
        margin-bottom: 1vmin
    &.checkboxBlock
      display: flex
      @media (max-width: 1024px)
        flex-direction: column
        align-items: flex-start
      @media (max-width: 575px)
        margin-top: 2vmin
      > div
          +setFlex
          position: relative
          margin: 0 14px
          @media (max-width: 575px)
            margin-bottom: 0.5vmin
          &:nth-of-type(1):before
            background: #EE3239
          &:nth-of-type(2):before
            background: #5EAA5F
          &:nth-of-type(3):before
            background: #FECE00
          &:before
            content: ''
            +setSize(10px)
            +setPosAbs(50%,null,null,-16px)
            border: 2px solid #3A5A69
            border-radius: 50%
            transform: translateY(-50%)
    span
      color: rgba(#fff,0.95)
      margin-left: 10px

</style>