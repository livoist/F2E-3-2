<template lang="pug">
.markerDetail(
  role="dialog"
  aria-label="地點資訊"
  :class="[`${modalType}`, { 'open': isOpenModal }]"
)
  .header
    span.badge {{ typeLabel }}
    button.closeModal(type="button" aria-label="關閉" @click="closeModal()")

  h2.title {{ checkContent(info.name) }}

  dl.rows
    .row(v-for="row in rows" :key="row.label")
      dt {{ row.label }}
      dd(:class="{ 'empty': row.empty }") {{ row.value }}

</template>

<script>
const EMPTY_TEXT = '尚未提供'

const TYPE_LABELS = {
  restaurant: '餐廳',
  scenicSpot: '景點',
  hotel: '住宿',
  event: '活動',
  serviceSite: '旅遊服務站',
  metro: '捷運站'
}

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
    },
    typeLabel() {
      return TYPE_LABELS[this.modalType] || ''
    },
    rows() {
      const rows = [
        { label: '地址 / Address', content: this.info.add },
        { label: '營業時間 / Time', content: this.info.open },
        { label: '電話 / Phone', content: this.info.phone }
      ]

      if (this.modalType === 'scenicSpot') rows.push({ label: '票價 / Fee', content: this.info.fee })

      return rows.map(({ label, content }) => ({
        label,
        value: this.checkContent(content),
        empty: this.isEmpty(content)
      }))
    }
  },
  methods: {
    closeModal() {
      this.$store.dispatch('isOpenModal', false)
    },
    isEmpty(content) {
      return content === undefined || content === null || content === ''
    },
    checkContent(content) {
      return this.isEmpty(content) ? EMPTY_TEXT : content
    }
  }
})
</script>

<style lang="sass" scoped>
.markerDetail
  --accent: #fff
  --accent-soft: #{rgba(#fff, 0.12)}
  position: absolute
  left: 50%
  top: 50%
  transform: translate(-50%, -46%)
  z-index: 8
  width: 340px
  max-width: 86vw
  max-height: 72vh
  overflow-y: auto
  padding: 16px 20px 8px
  color: #fff
  font-family: "LiHei Pro", "黑體-繁", "微軟正黑體", sans-serif
  background: rgba(#0F1A24, 0.92)
  border: 1px solid rgba(#fff, 0.08)
  border-radius: 14px
  box-shadow: 0 20px 50px rgba(#000, 0.45), 0 2px 6px rgba(#000, 0.3)
  backdrop-filter: blur(10px)
  opacity: 0
  visibility: hidden
  transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s
  // colour bar on top of the card
  &:before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    height: 3px
    background: var(--accent)
  &.open
    opacity: 1
    visibility: visible
    transform: translate(-50%, -50%)
  &.restaurant
    --accent: #EE3239
    --accent-soft: #{rgba(#EE3239, 0.16)}
  &.scenicSpot
    --accent: #5EAA5F
    --accent-soft: #{rgba(#5EAA5F, 0.16)}
  &.hotel
    --accent: #FECE00
    --accent-soft: #{rgba(#FECE00, 0.16)}
  &.event
    --accent: #8E6BBF
    --accent-soft: #{rgba(#8E6BBF, 0.2)}
  &.serviceSite
    --accent: #F08A3C
    --accent-soft: #{rgba(#F08A3C, 0.16)}
  &.metro
    --accent: #2E86DE
    --accent-soft: #{rgba(#2E86DE, 0.18)}

.header
  display: flex
  align-items: center
  justify-content: space-between

.badge
  display: inline-flex
  align-items: center
  padding: 3px 10px 3px 8px
  font-size: 12px
  font-weight: bold
  letter-spacing: 1px
  color: var(--accent)
  background: var(--accent-soft)
  border-radius: 999px
  &:before
    content: ''
    width: 6px
    height: 6px
    margin-right: 6px
    border-radius: 50%
    background: var(--accent)

.closeModal
  position: relative
  width: 28px
  height: 28px
  padding: 0
  border: none
  border-radius: 50%
  background: rgba(#fff, 0.08)
  cursor: pointer
  transition: background 0.2s
  &:hover
    background: rgba(#fff, 0.18)
  &:focus-visible
    outline: 2px solid var(--accent)
    outline-offset: 2px
  &:before,&:after
    content: ''
    position: absolute
    top: 50%
    left: 50%
    width: 12px
    height: 1.5px
    border-radius: 1px
    background: rgba(#fff, 0.85)
  &:before
    transform: translate(-50%, -50%) rotate(45deg)
  &:after
    transform: translate(-50%, -50%) rotate(-45deg)

.title
  margin: 12px 0 14px
  font-size: 18px
  font-weight: bold
  line-height: 1.4
  word-break: break-word

.rows
  margin: 0

.row
  padding: 11px 0
  border-top: 1px solid rgba(#fff, 0.08)
  dt
    font-size: 11px
    font-weight: bold
    letter-spacing: 1px
    color: rgba(#fff, 0.5)
  dd
    margin: 4px 0 0
    font-size: 14px
    line-height: 1.6
    color: rgba(#fff, 0.92)
    word-break: break-word
    &.empty
      color: rgba(#fff, 0.35)

</style>
