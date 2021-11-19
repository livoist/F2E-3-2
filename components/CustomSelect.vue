<template lang="pug">
.customSelect(
  :data-value="defaultValue"
  :class="{ 'select': true }"
)
  .selector(@click="toggleList")
    .label
      span(v-html="defaultValue")

    .toggleArrow(:class="{ 'expanded': visible }")

    div(:class="{ 'hidden': !visible }")
      ul
        li(
          v-for="item in selectList"
          :key="item.id"
          :class="{ 'current': item === defaultValue }"
          v-html="item"
          @click="selectEvent(item)"
        )

</template>

<script>

export default {
  name: 'CustomSelect',
  props: {
    selectList: {

    }
  },
  data() {
    return {
      visible: false,
      defaultValue: '請選擇'
    }
  },
  methods: {
    toggleList() {
      this.visible = !this.visible
    },
    selectEvent(item) {
      this.defaultValue = item
      this.$emit('defVal', this.defaultValue)
    }
  },
  mounted() {
    console.log('selectList', this.selectList)
  }
}
</script>

<style lang="sass" scoped>
.selector
  position: relative
  text-align: center
  cursor: pointer
  width: 200px
  .toggleArrow
    position: absolute
    top: 35%
    right: -10%
    width: 0
    height: 0
    border-left: 7px solid transparent
    border-right: 7px solid transparent
    border-top: 14px solid #fff
    transform: rotateZ(0deg) translateY(0px)
    transition: 0.3s cubic-bezier(0.59, 1.39, 0.37, 1.01)
    // +iphone-width
    //   border-left-width: 1.5vmin
    //   border-right-width: 1.5vmin
    //   border-top-width: 3vmin
    &.expanded
      transform: rotateZ(180deg) translateY(2px)
  .label
    display: block
    padding: 9px
    font-size: 14px
    color: #a3a3a3
    font-weight: bold
    // +iphone-width
    //   font-size: 3vmin
  ul
    width: 100%
    list-style-type: none
    padding: 0
    margin: 0
    font-size: 16px
    position: absolute
    z-index: 1
    background: #fff
  li
    padding: 12px
    color: #7e7e7e
    font-weight: bold
    font-size: 14px
    border-bottom: 1px solid #7e7e7e
    // +iphone-width
    //   font-size: 3vmin
    &:hover
      background: #7e7e7e
      color: #fff
  .current
    background: #7e7e7e
    color: #fff
  .hidden
    visibility: hidden
  .visible
    visibility: visible

</style>
