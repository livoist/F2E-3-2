<template lang="pug">
.sideMenu
  .searchBtns
    .locationIcon(
      @click.self="changeInfo('location')"
      :class="{ 'active': curMenu === 'location' && isOpenLocation }"
    )
      .icon
      p Rent Bike

    .bikePathIcon(
      @click.self="changeInfo('bikePath')"
      :class="{ 'active': curMenu === 'bikePath' && isOpenBikePath }"
    )
      .icon
      p Bike Path

  BikeRentInfo(
    :isOpenLocation="isOpenLocation"
    :isClearInfo="isOpenBikePath"
    :isOpenRentDetailInfo="isOpenRentDetailInfo"
    @isOpenLocation="getLocationState"
  )

  BikePathInfo(
    :isOpenBikePath="isOpenBikePath"
    :isClearInfo="isOpenLocation"
    @isOpenBikePath="getBikePathState"
  )
  
</template>

<script>
export default {
  name: 'SideMenu',
  data() {
    return {
      isOpenLocation: false,
      isOpenBikePath: false,
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
        this.$store.dispatch('isOpenModal', false)
        this.curMenu = type
      }
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
  z-index: 9
  @media (max-width: 768px)
    height: auto

.searchBtns
  +setFlex
  flex-direction: column

.locationIcon,.bikePathIcon
  position: relative
  cursor: pointer
  background: rgba(#000,0.8)
  transition: 0.3s
  padding: 16px
  +setFlex
  flex-direction: column
  @media (max-width: 575px)
    padding: 4vmin
    width: 15vmin
  &:hover,&.active
    background: rgba(#172532,0.9)
  .icon
    +setSize(34px,28px)
    background-size: 100% 100%
    pointer-events: none
    margin-bottom: 6px
    @media (max-width: 575px)
      width: 8vmin
      height: 6.5vmin
      margin-bottom: 1.5vmin
  p
    font-size: 12px
    color: #f2eadf
    font-weight: bold
    pointer-events: none
    transition: 0.3s

.locationIcon
  .icon
    background-image: url('@img/location.png')

.bikePathIcon
  .icon
    background-image: url('@img/bike.png')

</style>
