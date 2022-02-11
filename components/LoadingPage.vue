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
  +setSize(100vw,100vh)
  +setFlex
  position: fixed
  top: 0
  left: 0
  background: rgba(255, 255, 255, 0.8)
  font-size: 30px
  opacity: 0
  visibility: hidden
  transition: 0.3s
  font-weight: bold
  letter-spacing: 8px
  color: #7e7e7e
  @media (max-width: 575px)
    font-size: 5.5vmin
  &.loading
    opacity: 1
    visibility: visible

</style>
