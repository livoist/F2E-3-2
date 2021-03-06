<template lang="pug">
div
  .bikePathInfos(:class="{ 'active': isOpenBikePath }")
    .selectBox
      p 單車路線搜尋
      p.slash BikePathSearch
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
        @click="getCurBikeInfo(item)"
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
    :class="{ 'active': (isOpenBikePathDetail && !isOpenBikePath) }"
  )
    div(v-if="curSelectBikePathInfo.city")
      | 城市 / City : 
      span {{ curSelectBikePathInfo.city }}

    div(v-if="curSelectBikePathInfo.name")
      | 路線 / PathName : 
      span {{ curSelectBikePathInfo.name }}

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
import { mapActions } from 'vuex'

export default {
  name: 'BikePathInfo',
  props: {
    isOpenBikePath: {
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
      curCycling: [],
      curSelectBikePathInfo: {},
      curBikePathCity: '',
      isOpenBikePathDetail: false
    }
  },
  watch: {
    curBikePathCity: {
      immediate: true,
      handler(val) {
        if (val) this.getAllCyclingShape(val)
      }
    },
    // 是否清除舊的Info
    isClearInfo: {
      immediate: true,
      handler(val) {
        if (val) {
          this.isOpenBikePathDetail = false
        }
      }
    },
    isOpenBikePath: {
      immediate: true,
      handler(val) {
        if (val) this.isClearInfoMarker(true)
      }
    }
  },
  methods: {
    ...mapActions([
      'isLoading',
      'getCyclingShape',
      'getCurBikePath',
      'isClearInfoMarker'
    ]),
    getCurBikeCity(val) {
      this.curBikePathCity = val
    },
    async getAllCyclingShape(city) {
      this.isLoading(true)

      await this.getCyclingShape(city)
      this.curCycling = await this.$store.state.cyclingShape

      this.isLoading(false)
    },
    getCurBikeInfo(item) {
      this.isOpenBikePathDetail = true
      this.$emit('isOpenBikePath', false)

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
  
      this.getCurBikePath(handlePathMap())
    },
  }
}
</script>

<style lang="sass" scoped>
.selectBox.mb-30 > p
  margin-top: 8px
  @media (max-width: 575px)
    margin-top: 2vmin

.bikePathInfos
  +setPosAbs(0,null,null,100%)
  background: rgba(#172532,0.9)
  min-width: 400px
  padding: 20px
  transform: translateY(-300%)
  transition: 0.5s
  @media (max-width: 575px)
    min-width: auto
    width: 70vw
    padding: 2vmin 3vmin 2.5vmin 4vmin
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
    +setPosAbs(0,null,null,0)
    +setSize(24px)
    color: #172532
    background: #a3a3a3
    border-radius: 0 0 8px 0
    text-align: center
    line-height: 24px
    font-weight: bold
    font-size: 14px
    @media (max-width: 575px)
      +setSize(5vmin)
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
  left: 51%
  top: 0
  transform: translateX(-50%)
  display: flex
  opacity: 0
  visibility: hidden
  transition: 0.3s
  @media (max-width: 575px)
    flex-direction: column
    padding: 3vmin 2vmin
    left: 61.4%
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
      font-size: 3.25vmin
      white-space: initial
      margin: 1vmin 2vmin
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
        +setSize(10px)
        +setPosAbs(3px,null,null,-20px)
        border: 2px solid #3A5A69
        border-radius: 50%
        @media (max-width: 575px)
          +setSize(2vmin)
          top: 1vmin
          left: -4vmin
    &.start:before
      background: #FEC804
    &.end:before
      background: #C2E3F4

</style>
