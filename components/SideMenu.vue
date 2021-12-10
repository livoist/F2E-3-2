<template lang="pug">
.sideMenu
  LoadingPage(:isLoading="isLoading")

  .searchBtns
    .locationIcon(
      @click.self="changeInfo('location')"
      :class="{ 'active': curMenu === 'location' }"
    )
      .icon

    .bikePathIcon(
      @click.self="changeInfo('bikePath')"
      :class="{ 'active': curMenu === 'bikePath' }"
    )
      .icon

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
      


  .bikePathInfos(:class="{ 'active': isOpenBikePath }")
    .selectBox.mb-30
      p 城市 / City
      CustomSelect.bikePath(
        :selectList="bikeCitys"
        @defVal="getCurBikeCity"
      )
      .routeDetail
        p 路線總數量 / TotalRoute : {{ curCycling.length }}
    .bakcInfoInner
      .bikePathInfo(
        v-for="(item, idx) in curCycling"
        :key="item.id"
        :data-idx="idx + 1"
        @click="getCurBikePath(item)"
      )
        .pathNam(v-if="item.RouteName")
          p 路線名稱 / RouteName
          p {{ item.RouteName }}
        .pathStart(v-if="item.RoadSectionStart")
          p 路線起點 / RoadSectionStart
          p {{ item.RoadSectionStart }}
        .pathEnd(v-if="item.RoadSectionEnd")
          p 路線終點 / RoadSectionEnd
          P {{ item.RoadSectionEnd }}
        .pathDirection(v-if="item.Direction")
          p 路線方向 / Direction
          p {{ item.Direction }}
        .pathLength(v-if="item.CyclingLength")
          p 路線總長 / CyclingLength
          p {{ item.CyclingLength / 1000 }}km

  .userSelectPathInfo(
    :class="{ 'active': isOpenBikeDetail }"
  )
    div(v-if="curSelectBikePathInfo.city")
      | 城市 / City : 
      span {{ curSelectBikePathInfo.city }}

    div(v-if="curSelectBikePathInfo.name")
      | 路線 / PathName : 
      span
        br
        | {{ curSelectBikePathInfo.name }}

    div(v-if="curSelectBikePathInfo.length")
      | 總長 / Length : 
      span {{ curSelectBikePathInfo.length / 1000 }}km

    div.start(v-if="curSelectBikePathInfo.roadStart")
      | 起點 / StartPoint : 
      span {{ curSelectBikePathInfo.roadStart }}

    div.end(v-if="curSelectBikePathInfo.roadEnd")
      | 終點 / EndPoint : 
      span {{ curSelectBikePathInfo.roadEnd }}
  
</template>

<script>
export default {
  name: 'SideMenu',
  data() {
    return {
      bikeCitys: [
        'Taichung',
        'Keelung',
        'HsinchuCounty',
        'MiaoliCounty',
        'ChanghuaCounty',
        'NewTaipei',
        'NantouCounty',
        'YunlinCounty',
        'ChiayiCounty',
        'Chiayi',
        'PingtungCounty',
        'YilanCounty',
        'HualienCounty',
        'TaitungCounty',
        'KinmenCounty',
        'PenghuCounty',
        'Taoyuan',
        'Taipei',
        'Kaohsiung',
        'Tainan'
      ],
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
      curSelect: '',
      curCity: '',
      curMeters: 0,
      curBikePathCity: '',
      curTarget: '',
      isOpenLocation: false,
      isOpenBikePath: false,
      isLoading: false,
      isReloading: false,
      curRents: '',
      curRent: 0,
      notReturn: 0,
      canRent: 0,
      curCycling: [],
      curMenu: '',
      curSelectBikePathInfo: {},
      isOpenBikeDetail: false,
      dynamicNearByInfo: {}
    }
  },
  watch: {
    curBikePathCity: {
      immediate: true,
      handler(val) {
        if (val) this.getAllCyclingShape(val)
      }
    },
    curCity: {
      immediate: true,
      handler(val) {
        if (val) {
          this.canRent = 0
          this.notReturn = 0
          this.isLoading = true
          this.isReloading = true
          this.getAllStationInfo()

          setTimeout(() => {
            this.isReloading = false
            this.isLoading = false
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

          setTimeout(() => {
            this.canRent = this.curRent.AvailableRentBikes
            this.notReturn = this.curRent.AvailableReturnBikes
          }, 500)
        }
      }
    },
    curMeters: {
      handler(val) {
        if (val) this.getStationNearByDistance(val)
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
    getDynamicNearByInfo(id, key) {
      const targets = this.getDynamicNearByArray
      const target = targets.filter(item => {
        return item.StationUID === id
      })

      if (target[0] !== undefined) return target[0][key]
    },
    getCurNearNameItem(item) {
      this.isOpenLocation = false
      this.$store.dispatch('getCurNearItem', item)
    },
    changeInfo(type) {
      this.isOpenBikeDetail = false

      if (type === 'location') {
        this.isOpenLocation = !this.isOpenLocation
        if (this.isOpenBikePath) this.isOpenBikePath = false
        this.curMenu = type
      }

      if (type === 'bikePath') {
        this.isOpenBikePath = !this.isOpenBikePath
        if (this.isOpenLocation) this.isOpenLocation = false
        this.curMenu = type
      }
    },
    getCurRent() {
      this.isOpenLocation = false
      const resource = this.curRents.filter(item => {
        return item.StationID === this.curTarget.id
      })

      this.curRent = resource[0]
    },
    getCurBikeCity(val) {
      this.curBikePathCity = val
    },
    getCurCity(val) {
      this.curCity = val
    },
    getCurSelect(val) {
      this.curSelect = val
    },
    getCurMeters(val) {
      this.curMeters = val
    },
    getCurBikePath(item) {
      this.isOpenBikeDetail = true
      this.isOpenBikePath = false

      // get need result
      const {
        City,
        RouteName,
        CyclingLength,
        RoadSectionStart,
        RoadSectionEnd
      } = item

      // reassign to object
      this.curSelectBikePathInfo = {
        city: City,
        name: RouteName,
        length: CyclingLength,
        roadStart: RoadSectionStart,
        roadEnd: RoadSectionEnd
      }

      // handle origin data
      const len = item.Geometry.length
      const pathStr = item.Geometry.slice(18, len - 2)
      const splitStr = pathStr.split(',')

      const handlePathMap = () => {
        return splitStr.map(item => item.split(' '))
      }
  
      this.$store.dispatch('getCurBikePath', handlePathMap())
    },
    getDynamicNearBy(condition) {
      this.$store.dispatch('getAvailabilityNearBy', condition)
    },
    getStationNearByDistance(meter) {
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
    async getAllCyclingShape(city) {
      await this.$store.dispatch('getCyclingShape', city)
      this.curCycling = await this.$store.state.cyclingShape
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
    async getAllStationInfo() {
      await this.$store.dispatch('getAllStation', this.curCity)
      this.stationNames = await this.$store.state.allStationName
      await this.getAllStationRentBike()
    }
  }
}
</script>

<style lang="sass" scoped>
.sideMenu
  position: fixed
  left: 0
  top: 0
  z-index: 100
  @media (max-width: 768px)
    height: auto

.searchBtns
  display: flex
  flex-direction: column
  align-items: center

.locationIcon,.bikePathIcon
  position: relative
  cursor: pointer
  background: #a3a3a3
  transition: 0.3s
  padding: 16px
  @media (max-width: 575px)
    padding: 4vmin
  &:hover,&.active
    background: #172532
  .icon
    width: 34px
    height: 28px
    background-size: 100% 100%
    pointer-events: none
    @media (max-width: 575px)
      width: 7.5vmin
      height: 6vmin

.locationIcon
  .icon
    background-image: url('@img/location.png')
  &:hover .icon
    background-image: url('@img/location-h.png')

.bikePathIcon
  .icon
    background-image: url('@img/bike.png')
  &:hover .icon
    background-image: url('@img/bike-h.png')


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

.bikePathInfos
  background: #172532
  position: absolute
  left: 120%
  top: 0
  min-width: 400px
  padding: 20px
  border-radius: 0 0 8px 8px
  transform: translateY(-300%)
  transition: 0.5s
  @media (max-width: 575px)
    min-width: auto
    width: 70vw
    padding: 2vmin 3vmin 4vmin 4vmin
  &.active
    transform: translateY(0)

.bakcInfoInner
  overflow-y: scroll
  max-height: 70vh
  padding-right: 20px
  @media (max-width: 575px)
    padding-right: 2vmin
    max-height: 75vh

.routeDetail p
  color: #a3a3a3
  font-size: 14px
  @media (max-width: 575px)
    font-size: 3vmin

.bikePathInfo
  color: #a3a3a3
  border: 2px solid #a3a3a3
  border-radius: 8px
  margin-bottom: 20px
  padding: 28px 30px 4px
  position: relative
  cursor: pointer
  @media (max-width: 575px)
    padding: 5vmin 5vmin 1vmin 6vmin
  &:after
    content: attr(data-idx)
    color: #172532
    position: absolute
    left: 0
    top: 0
    background: #a3a3a3
    width: 24px
    height: 24px
    border-radius: 0 0 8px 0
    text-align: center
    line-height: 24px
    font-weight: bold
    font-size: 14px
    @media (max-width: 575px)
      width: 5vmin
      height: 5vmin
      font-size: 12px
      line-height: 1.5
  &:last-of-type
    margin-bottom: 0
  > div
    margin-bottom: 12px
  p
    &:nth-of-type(1)
      font-size: 18px
      font-weight: bold
      margin-bottom: 4px
      @media (max-width: 575px)
        font-size: 3.5vmin
    &:nth-of-type(2)
      font-size: 14px
      @media (max-width: 575px)
        font-size: 3vmin

.userSelectPathInfo
  background: rgba(#08111A,0.75)
  padding: 15px 40px
  position: fixed
  color: rgba(#fff,0.6)
  border-radius: 0 0 4px 4px
  left: 51%
  top: 0
  transform: translateX(-50%)
  display: flex
  opacity: 0
  visibility: hidden
  transition: 0.3s
  @media (max-width: 575px)
    flex-direction: column
    padding: 3vmin 3.5vmin
    left: 58.5%
    min-width: 73%
  &.active
    opacity: 1
    visibility: visible
  div
    white-space: nowrap
    font-size: 14px
    margin: 0 10px
    font-weight: bold
    position: relative
    @media (max-width: 575px)
      font-size: 3.5vmin
      white-space: initial
    br
      display: none
      @media (max-width: 575px)
        display: block
    span
      color: rgba(#fff,0.95)
    &.start,&.end
      margin-left: 20px
      @media (max-width: 575px)
        margin-left: 6.5vmin
      &:before
        content: ''
        width: 10px
        height: 10px
        border: 2px solid #3A5A69
        border-radius: 50%
        position: absolute
        left: -20px
        top: 3px
        @media (max-width: 575px)
          top: 1vmin
          width: 2vmin
          height: 2vmin
          left: -4vmin
    &.start:before
      background: #FEC804
    &.end:before
      background: #C2E3F4

</style>
