<template lang="pug">
.customSelect(
  :data-value="defaultState"
  :class="{ 'select': true }"
)
  .selector(@click="toggleList")
    .label
      span(v-html="defaultState")

    .toggleArrow(:class="{ 'expanded': visible }")

    div(:class="{ 'hidden': !visible }")
      ul
        li(
          v-for="(item, idx) in selectList"
          :key="item.id"
          :class="{ 'current': item === defaultState }"
          @click="selectEvent(item)"
          v-html="`${cnList(item)}${item}`"
        )

</template>

<script>

export default {
  name: 'CustomSelect',
  props: {
    selectList: {
      type: Array,
      default: []
    },
    reloading: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      visible: false,
      defaultValue: '請選擇',
      userSelect: ''
    }
  },
  computed: {
    defaultState() {
      return this.reloading ? this.defaultValue = '請選擇' : this.defaultValue
    }
  },
  methods: {
    cnList(name) {
      switch (name) {
        case 'Taipei':
          return '台北 / '
        case 'NewTaipei':
          return '新北 / '
        case 'Taoyuan':
          return '桃園 / '
        case 'Taichung':
          return '台中 / '
        case 'Tainan':
          return '台南 / '
        case 'Kaohsiung':
          return '高雄 / '
        case 'Hsinchu':
          return '新竹 / '
        case 'MiaoliCounty':
          return '苗栗 / '
        case 'Chiayi':
          return '嘉義 / '
        case 'PingtungCounty':
          return '屏東 / '
        case 'KinmenCounty':
          return '金門 / '
        default:
          return ''
      }
    },
    toggleList() {
      this.visible = !this.visible
    },
    selectEvent(item) {
      this.defaultValue = `${this.cnList(item)}${item}`
      this.userSelect = item
      this.$emit('defVal', this.userSelect)
    }
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
    border-left: 5px solid transparent
    border-right: 5px solid transparent
    border-top: 10px solid #a3a3a3
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
