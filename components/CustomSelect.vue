<template lang="pug">
.customSelect(:data-value="defaultState")
  .selector(
    @click="toggleList"
    :class="{ 'event-none': selectList.length === 0 }"
  )
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
          return '台北市 / '
        case 'NewTaipei':
          return '新北市 / '
        case 'Taoyuan':
          return '桃園市 / '
        case 'Taichung':
          return '台中市 / '
        case 'ChanghuaCounty':
          return '彰化縣 / '
        case 'Tainan':
          return '台南市 / '
        case 'Kaohsiung':
          return '高雄市 / '
        case 'Hsinchu':
          return '新竹市 / '
        case 'HsinchuCounty':
          return '新竹縣 / '
        case 'MiaoliCounty':
          return '苗栗縣 / '
        case 'Chiayi':
          return '嘉義市 / '
        case 'PingtungCounty':
          return '屏東縣 / '
        case 'KinmenCounty':
          return '金門縣 / '
        case 'Keelung':
          return '基隆市 / '
        case 'NantouCounty':
          return '南投縣 / '
        case 'YunlinCounty':
          return '雲林縣 / '
        case 'ChiayiCounty':
          return '嘉義縣 / '
        case 'YilanCounty':
          return '宜蘭縣 / '
        case 'HualienCounty':
          return '花蓮縣 / '
        case 'TaitungCounty':
          return '台東縣 / '
        case 'PenghuCounty':
          return '澎湖縣 / '
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
.customSelect
  &.location ul, &.bikePath ul
    max-height: 65vh
  &.advance
    .selector
      width: 80px

.selector
  position: relative
  text-align: center
  cursor: pointer
  width: 210px
  @media (max-width: 575px)
    width: 47vmin
  &.event-none
    pointer-events: none
  .toggleArrow
    +setPosAbs(50%,-10%,null,null)
    +setSize(0)
    border-left: 4px solid transparent
    border-right: 4px solid transparent
    border-top: 9px solid #a3a3a3
    transform: translateY(-50%) rotateZ(0deg) translateY(0px)
    transition: 0.3s cubic-bezier(0.59, 1.39, 0.37, 1.01)
    &.expanded
      transform: rotateZ(180deg) translateY(50%)
  .label
    display: block
    padding: 9px
    font-size: 14px
    color: rgba(#fff,0.85)
    font-weight: bold
    @media (max-width: 575px)
      font-size: 3.25vmin
  ul
    width: 100%
    overflow-y: scroll
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
    &:last-of-type
      border: none
    @media (max-width: 575px)
      font-size: 3.25vmin
      padding: 2.25vmin
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
