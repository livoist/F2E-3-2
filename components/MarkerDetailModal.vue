<template lang="pug">
.markerDetail(:class="[`${modalType}`, { 'open': isOpenModal }]")
  .closeModal(@click="closeModal()" :class="`${modalType}`")
  p 名稱 / Name: {{ checkContent(info.name) }}
  p 地址 / Address: {{ checkContent(info.add) }}
  p 營業時間 / Time: {{ checkContent(info.open) }}
  p 電話 / Phone: {{ checkContent(info.phone) }}

</template>

<script>
export default ({
  name: 'MarkerDetailModal',
  props: {
    modalType: {
      type: String,
      default: ''
    },
    info: {
      type: Object,
      default: () =>({})
    }
  },
  computed: {
    isOpenModal() {
      return this.$store.state.openModal
    }
  },
  methods: {
    closeModal() {
      this.$store.dispatch('isOpenModal', false)
    },
    checkContent(content) {
      return content === undefined || content === null || content === '' ? '尚未提供' : content
    }
  }
})
</script>

<style lang="sass" scoped>
.markerDetail
  position: absolute
  left: 50%
  top: 50%
  transform: translate(-50%,-50%)
  z-index: 8
  background: rgba(#000, 0.85)
  color: #fff
  padding: 0 20px
  font-size: 14px
  font-weight: bold
  font-family: "LiHei Pro", "黑體-繁", "微軟正黑體", sans-serif
  opacity: 0
  visibility: hidden
  transition: 0.3s
  border-radius: 4px
  @media (max-width: 575px)
    width: 68%
    font-size: 3.5vmin
    padding: 0 5.5vmin
  &:before
    position: absolute
    left: -24px
    top: -30px
    font-size: 20px
    @media (max-width: 575px)
      font-size: 4.5vmin
  &.restaurant
    border: 4px solid #EE3239
    &:before
      content: 'Restaurant'
      color: #EE3239
  &.scenicSpot
    border: 4px solid #5EAA5F
    &:before
      content: 'ScenicSpot'
      color: #5EAA5F
  &.hotel
    border: 4px solid #FECE00
    &:before
      content: 'Hotel'
      color: #FECE00
  &.open
    opacity: 1
    visibility: visible
  > p
      margin: 16px 0
      line-height: 1.5

.closeModal
  +setSize(24px)
  border-radius: 50%
  background: #000
  position: absolute
  right: -30px
  top: -30px
  cursor: pointer
  @media (max-width: 575px)
    right: -7vmin
    top: -7vmin
  &:before,&:after
    content: ''
    position: absolute
    width: 70%
    height: 2px
    background: #fff
    left: 50%
    top: 50%
  &:before
    transform: translate(-50%,-50%) rotate(45deg)
  &:after
    transform: translate(-50%,-50%) rotate(-45deg)
  &.restaurant
    border: 2px solid #EE3239
    &:before,&:after
      background: #EE3239
  &.scenicSpot
    border: 2px solid #5EAA5F
    &:before,&:after
      background: #5EAA5F
  &.hotel
    border: 2px solid #FECE00
    &:before,&:after
      background: #FECE00

</style>