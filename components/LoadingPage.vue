<template lang="pug">
.loading-page(:class="{ 'loading': isLoading }")
  p Loading...

</template>

<script>
export default {
  props: ['isLoading']
}
</script>

<style lang="sass" scoped>
.loading-page
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100vh
  line-height: 50vh
  background: rgba(255, 255, 255, 0.8)
  text-align: center
  padding-top: 200px
  font-size: 30px
  opacity: 0
  visibility: hidden
  transition: 0.3s
  font-weight: bold
  letter-spacing: 8px
  color: #7e7e7e
  &.loading
    opacity: 1
    visibility: visible
</style>