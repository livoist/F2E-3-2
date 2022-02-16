<template lang="pug">
.enterAnim(:class="{ 'enter': pageIn }")
  p Welcome to BikeMap
  p(:class="{ 'isAnText': !isLadongSource }") waiting loading...

</template>

<script>

export default ({
  name: 'EnterAnimation',
  data() {
    return {
      pageIn: false
    }
  },
  computed: {
    isLadongSource() {
      return this.$store.state.loadingSource
    }
  },
  watch: {
    immediate: true,
    isLadongSource: {
      handler(val) {
        if (val) setTimeout(() => { this.pageIn = true }, 1000)
      }
    }
  }
})
</script>

<style lang="sass" scoped>
@keyframes fadeText
  0%
    opacity: 0
  100%
    opacity: 1

.enterAnim
  background: #fff
  width: 100vw
  height: 100vh
  position: fixed
  top: 0
  left: 0
  z-index: 10
  +setFlex
  flex-direction: column
  transition: 0.5s
  &.enter
    opacity: 0
    visibility: hidden
  &:before
    content: ''
    position: absolute
    +setSize(92%,85%)
    border: 1px solid #000
    @media (max-width: 575px)
      +setSize(85%, 93%)
  p
    line-height: 2
    font-family: "LiHei Pro", "黑體-繁", "微軟正黑體", sans-serif
    font-weight: bold
    &:nth-of-type(1)
      font-size: 40px
      position: relative
      @media (max-width: 575px)
        font-size: 6vmin
      &:before,&:after
        content: ''
        position: absolute
        background: #000
        +setSize(40px,6px)
        top: 50%
        transform: translateY(-50%)
        @media (max-width: 575px)
          +setSize(8vmin,1.25vmin)
      &:before
        left: -25%
      &:after
        right: -25%
    &:nth-of-type(2)
      font-size: 20px
      letter-spacing: 4px
      animation: fadeText 1s both infinite alternate linear
      @media (max-width: 575px)
        font-size: 4vmin
</style>