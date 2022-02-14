<template lang="pug">
.sideMenu
  LoadingPage(:isLoading="isLoading")

  .searchBtns
    .locationIcon(
      @click.self="changeInfo('location')"
      :class="{ 'active': curMenu === 'location' && isOpenLocation }"
    )
      .icon

    .bikePathIcon(
      @click.self="changeInfo('bikePath')"
      :class="{ 'active': curMenu === 'bikePath' && isOpenBikePath }"
    )
      .icon

  BikeRentInfo(
    :isOpenLocation="isOpenLocation"
    :isClearInfo="isOpenBikePath"
    :isOpenRentDetailInfo="isOpenRentDetailInfo"
    @isOpenLocation="getLocationState"
    @isLoading="getIsLoading"
  )

  BikePathInfo(
    :isOpenBikePath="isOpenBikePath"
    :isClearInfo="isOpenLocation"
    @isOpenBikePath="getBikePathState"
  )
  
</template>

<script>
import BikePathInfo from './BikePathInfo.vue'
import BikeRentInfo from './BikeRentInfo.vue'

export default {
  name: 'SideMenu',
  components: {
    BikePathInfo,
    BikeRentInfo
  },
  data() {
    return {
      isOpenLocation: false,
      isOpenBikePath: false,
      isLoading: false,
      isOpenRentDetailInfo: false,
      curMenu: ''
    }
  },
  watch: {
    getIsChangeBasicSelect: {
      immediate: true,
      handler(val) {
        if (val) {
          this.isOpenLocation = false
          this.isOpenBikePath = false
          this.isOpenRentDetailInfo = true
        } else {
          this.isOpenRentDetailInfo = false
        }
      }
    }
  },
  computed: {
    getIsChangeBasicSelect() {
      return this.$store.state.basicSelect
    }
  },
  methods: {
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
    getIsLoading(val) {
      this.isLoading = val
    },
    getBikePathState(val) {
      this.isOpenBikePath = val
    },
    getLocationState(val) {
      this.isOpenLocation = val
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
  +setFlex
  flex-direction: column

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
    +setSize(34px,28px)
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

</style>
