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
  p
    line-height: 2
    font-family: "LiHei Pro", "黑體-繁", "微軟正黑體", sans-serif
    font-weight: bold
    letter-spacing: 2px
    &:nth-of-type(1)
      font-size: 24px
      position: relative
      @media (max-width: 575px)
        font-size: 4vmin
    &:nth-of-type(2)
      font-size: 16px
      letter-spacing: 2px
      animation: fadeText 1s both infinite alternate linear
      @media (max-width: 575px)
        font-size: 3vmin
</style>