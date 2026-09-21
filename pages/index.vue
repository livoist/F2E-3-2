<template lang="pug">
#map
  LoadingPage
  EnterAnimation
  MarkerDetailModal(
    :modalType="curModalType"
    :info="curMarkerDetailInfo"
  )

</template>

<script>
import { mapState, mapActions } from 'vuex'

const escapeHtml = text => {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

  return String(text).replace(/[&<>"']/g, char => entities[char])
}

// popup card for a bike station, same look as the marker detail modal
const createBikePopupHtml = ({ title, stats = [], rows = [] }) => {
  const statsHtml = stats.map(({ label, value }) => `
    <div class="bikePopup-stat">
      <span class="bikePopup-value">${escapeHtml(value)}</span>
      <span class="bikePopup-label">${escapeHtml(label)}</span>
    </div>
  `).join('')

  const rowsHtml = rows.map(({ label, value }) => `
    <div class="bikePopup-row">
      <span class="bikePopup-label">${escapeHtml(label)}</span>
      <span class="bikePopup-text">${escapeHtml(value)}</span>
    </div>
  `).join('')

  return `
    <span class="bikePopup-badge">單車站</span>
    <h3 class="bikePopup-title">${escapeHtml(title)}</h3>
    ${stats.length ? `<div class="bikePopup-stats">${statsHtml}</div>` : ''}
    ${rowsHtml}
  `
}

// "2026-09-21T12:33:56+08:00" -> "2026-09-21 12:33"
const formatUpdateTime = time => String(time).replace('T', ' ').slice(0, 16)

export default {
  data() {
    return {
      station: '',
      target: '',
      mapInstance: null,
      mapMarker: null,
      mapPopup: null,
      selfPosMarker: [],
      stationMarker: [],
      nearStationMarkers: [],
      nearRestaruantMarkers: [],
      nearScenicSpotMarkers: [],
      nearHotelMarkers: [],
      nearEventMarkers: [],
      nearServiceSiteMarkers: [],
      nearMetroMarkers: [],
      curMarkerDetailInfo: {},
      curModalType: ''
    }
  },
  computed: {
    ...mapState({
      getCurStationTarget: 'curTarget',
      getCurBikeGeometry: 'curBikePath',
      getCurNearByStation: 'stationNearBy',
      getUserPosition: 'userPos',
      getCurNearItem: 'nearNameItem',
      getAvailabilityNearByArray: 'availabilityNearBy',
      getStationRents: 'availability',
      getRestaruant: 'restaurantNearBy',
      getScenicSpot: 'scenicSpotNearBy',
      getHotel: 'hotelNearBy',
      getEvent: 'eventNearBy',
      getServiceSite: 'serviceSiteNearBy',
      getMetro: 'metroNearBy',
      isClearMarkers: 'isClearMakers',
      isClearBikePath: 'isClearBikePath',
      getBasicSelect: 'basicSelect',
      updateUserPosSelect: 'updateUserPosSelect'
    })
  },
  watch: {
    getCurBikeGeometry: {
      deep: true,
      handler(val) {
        if (val.length !== 0) this.getBikePath(val)
      }
    },
    getBasicSelect: {
      deep: true,
      handler(val) {
        if (val) {
          this.getBikeStationMarker(this.getCurStationTarget)
          this.changeBasicSelect(false)

          this.getStationNearByMarkers(
            'restaurant',
            this.getRestaruant,
            this.nearRestaruantMarkers
          )

          this.getStationNearByMarkers(
            'scenicSpot',
            this.getScenicSpot,
            this.nearScenicSpotMarkers
          )

          this.getStationNearByMarkers(
            'hotel',
            this.getHotel,
            this.nearHotelMarkers
          )

          this.getStationNearByMarkers(
            'event',
            this.getEvent,
            this.nearEventMarkers
          )

          this.getStationNearByMarkers(
            'serviceSite',
            this.getServiceSite,
            this.nearServiceSiteMarkers
          )

          this.getStationNearByMarkers(
            'metro',
            this.getMetro,
            this.nearMetroMarkers
          )
        }
      }
    },
    // switching the search distance loads a new set of stations, keep the map in sync with it
    getCurNearByStation(val) {
      // no user position means the advanced search was cleared, not that this range has no stations
      if (this.mapInstance && this.getUserPosition.length > 0) this.getUserCurPosNearByStation(val)
    },
    updateUserPosSelect: {
      deep: true,
      handler(val) {
        if (val) {
          this.getUserCurPosNearByStation(this.getCurNearByStation)
          this.getCurNearSelectMarker(this.getCurNearItem)
          this.isUpdateUserPosSelect(false)
        }
      }
    },
    getRestaruant: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'restaurant',
            this.getRestaruant,
            this.nearRestaruantMarkers
          )
        }
      }
    },
    getScenicSpot: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'scenicSpot',
            this.getScenicSpot,
            this.nearScenicSpotMarkers
          )
        }
      }
    },
    getHotel: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'hotel',
            this.getHotel,
            this.nearHotelMarkers
          )
        }
      }
    },
    getEvent: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'event',
            this.getEvent,
            this.nearEventMarkers
          )
        }
      }
    },
    getServiceSite: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'serviceSite',
            this.getServiceSite,
            this.nearServiceSiteMarkers
          )
        }
      }
    },
    getMetro: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.getStationNearByMarkers(
            'metro',
            this.getMetro,
            this.nearMetroMarkers
          )
        }
      }
    },
    isClearMarkers: {
      immediate: true,
      handler(val) {
        if (val) {
          this.clearOldMarkers(this.stationMarker)
          this.clearOldMarkers(this.nearRestaruantMarkers)
          this.clearOldMarkers(this.nearScenicSpotMarkers)
          this.clearOldMarkers(this.nearHotelMarkers)
          this.clearOldMarkers(this.nearEventMarkers)
          this.clearOldMarkers(this.nearServiceSiteMarkers)
          this.clearOldMarkers(this.nearMetroMarkers)
          // markers of the advanced search
          this.clearOldMarkers(this.nearStationMarkers)
          this.clearOldMarkers(this.selfPosMarker)
          this.isClearInfoMarker(false)
        }
      }
    },
    isClearBikePath: {
      immediate: true,
      handler(val) {
        if (val) {
          this.clearBikePath()
          this.isClearInfoBikePath(false)
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'changeBasicSelect',
      'isClearInfoMarker',
      'isClearInfoBikePath',
      'getAllStation',
      'isUpdateUserPosSelect',
      'isLoadingSource'
    ]),
    async initMapBox() {
      this.mapInstance = await new this.$map.Map({
        accessToken: 'pk.eyJ1IjoiYmVubGFpIiwiYSI6ImNrdzRib2FzYTAydTQyb3JoaHU4MGVzcWoifQ.j-bTKoCaWwbV4Ldqvy2Vrg',
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [120.9738819, 23.97565],
        zoom: 6.5
      })

      this.mapMarker = await new this.$map.Marker()
      this.mapPopup = this.createBikePopup()

      setTimeout(() => { this.isLoadingSource(true) }, 2000)
    },
    createBikePopup() {
      return new this.$map.Popup({
        className: 'bikePopup',
        closeButton: false,
        maxWidth: '260px'
      })
    },
    // fade every near station except the one whose popup is open, restore them all once no popup is open
    updateNearStationsFade() {
      const active = this.nearStationMarkers.find(marker => marker.getPopup().isOpen())

      this.nearStationMarkers.forEach(marker => {
        marker.getElement().classList.toggle('faded', Boolean(active) && marker !== active)
      })
    },
    // full popup content of a near station, the availability is matched by station uid
    // (it only covers the nearest stations, so it can be missing)
    getNearStationPopupHtml(station) {
      const title = station.StationName.Zh_tw
      const address = { label: '地址 / Address', value: station.StationAddress.Zh_tw }
      const availability = this.getAvailabilityNearByArray.find(item => item.StationUID === station.StationUID)

      if (!availability) return createBikePopupHtml({ title, rows: [address] })

      return createBikePopupHtml({
        title,
        stats: [
          { label: '可租借 / Balance', value: availability.AvailableRentBikes },
          { label: '未歸還 / Not return', value: availability.AvailableReturnBikes }
        ],
        rows: [
          address,
          { label: '更新時間 / Updated', value: formatUpdateTime(availability.UpdateTime) }
        ]
      })
    },
    getCurNearSelectMarker(target) {
      const { pos, name } = target

      // get target index
      const targetMarker = this.getCurNearByStation.findIndex(item => {
        return item.StationName.Zh_tw === name.Zh_tw
      })

      // open the popup of the selected marker
      const marker = this.nearStationMarkers[targetMarker]

      if (!marker.getPopup().isOpen()) marker.togglePopup()

      // jump to select marker
      this.mapInstance.jumpTo(
        {
          center: [pos.PositionLon, pos.PositionLat],
          zoom: 14,
          speed: 2,
          curve: 1,
          duration: 5000,
          easing(t) {
            return t
          }
        }
      )
    },
    clearOldMarkers(targets) {
      // empty the array in place, reassigning the parameter would only change the local copy
      targets.splice(0).forEach(item => item.remove())
    },
    clearBikePath() {
      // update / remove source and layer
      const sourceTargets = ['route', 'point-start', 'point-end']
      sourceTargets.forEach(item => {
        this.mapInstance.getLayer(item) && this.mapInstance.removeLayer(item)
        this.mapInstance.getSource(item) && this.mapInstance.removeSource(item)
      })
    },
    createCustomPoint(type, item, num = '') {
      const el = document.createElement('div')
      const childText = document.createElement('div')
  
      if (item === 'SELF') {
        childText.innerHTML = item
        el.classList.add('marker', type)
        childText.classList.add('textBlock', type)
      } else {
        childText.innerHTML = item.name.length > 8 ? `${item.name.slice(0, 7)}...` : item.name
        el.classList.add('marker', type, 'hidden')
        childText.classList.add('textBlock', type, `${type}-${num}`)
      }

      el.appendChild(childText)

      return el
    },
    getStationNearByMarkers(type, markersInfo, markersArray) {
      this.clearOldMarkers(markersArray)

      const result = markersInfo.slice()
      result.forEach((item, idx) => {
        const el = this.createCustomPoint(type, item, idx)
        const markers = new this.$map.Marker(el)
        const markerInfo = { type: type, idx: idx, info: item  }

        markers.setLngLat(item.pos).addTo(this.mapInstance)
        markersArray.push(markers)

        this.addEventListenerToMarker(markerInfo)
      })
    },
    getUserCurPosNearByStation(nearByAry) {
      // remove old nearMarker
      if (this.nearStationMarkers.length > 0) {
        this.nearStationMarkers.forEach(item => item.remove())
        this.nearStationMarkers = []
      }
      // remove old selfMarker
      if (this.selfPosMarker.length > 0) {
        this.selfPosMarker.forEach(item => item.remove())
        this.selfPosMarker = []
      }

      // custom selfMarker style
      const el = this.createCustomPoint('self', 'SELF')

      // add selfMarker on map
      const selfMarker = new this.$map.Marker(el)
      selfMarker.setLngLat(this.getUserPosition).addTo(this.mapInstance)
      this.selfPosMarker.push(selfMarker)

      // add all nearMarker on map
      nearByAry.forEach(item => {
        const { StationPosition } = item
        const nearMarker = new this.$map.Marker()
        // every marker needs its own popup, a shared one is moved around by whichever marker updated last
        const popup = this.createBikePopup().setHTML(this.getNearStationPopupHtml(item))

        popup.on('open', () => {
          // the availability is loaded by a separate request, so read it again when the popup is shown
          popup.setHTML(this.getNearStationPopupHtml(item))
          this.updateNearStationsFade()
        })
        popup.on('close', this.updateNearStationsFade)

        nearMarker
          .setLngLat([StationPosition.PositionLon, StationPosition.PositionLat])
          .setPopup(popup)
          .addTo(this.mapInstance)

        // save all nearMarker
        this.nearStationMarkers.push(nearMarker)
      })

      // jump to self position
      this.mapInstance.jumpTo(
        {
          center: this.getUserPosition,
          zoom: 14,
          speed: 2,
          curve: 1,
          duration: 5000,
          easing(t) {
            return t
          }
        }
      )
    },
    getBikeStationMarker(target) {
      this.clearOldMarkers(this.stationMarker)

      this.mapMarker
        .setLngLat([target.pos.PositionLon, target.pos.PositionLat])
        .setPopup(this.mapPopup.setHTML(createBikePopupHtml({
          title: target.name,
          rows: [{ label: '地址 / Address', value: target.address }]
        })))
        .addTo(this.mapInstance)
        .togglePopup(true)

      this.stationMarker.push(this.mapMarker)

      this.mapInstance.jumpTo(
        {
          center: [target.pos.PositionLon, target.pos.PositionLat],
          zoom: 14,
          speed: 2,
          curve: 1,
          duration: 5000,
          easing(t) {
            return t
          }
        }
      )
    },
    getBikePath(path) {
      // clear bike path
      this.clearBikePath()

      // bikePath source
      this.mapInstance.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
              type: "LineString",
              coordinates: path
          }
        }
      })

      // startPoint source
      this.mapInstance.addSource("point-start", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                description: "Start"
              },
              geometry: {
                type: "Point",
                coordinates: [path[0][0], path[0][1]]
              }
            }
          ]
        }
      })

      // endPoint source
      this.mapInstance.addSource("point-end", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                description: "End"
              },
              geometry: {
                type: "Point",
                coordinates: [path[path.length - 1][0], path[path.length - 1][1]]
              }
            }
          ]
        }
      })

      // add souce in layer
      this.mapInstance.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#CC8A4D",
          "line-width": 4,
          "line-opacity": 0.6
        }
      })

      this.mapInstance.addLayer({
        id: "point-start",
        type: "circle",
        source: "point-start",
        paint: {
          "circle-color": "#FEC804",
          'circle-stroke-width': 2,
          'circle-stroke-color': "#3A5A69",
          "circle-radius": 5
        }
      })

      this.mapInstance.addLayer({
        id: "point-end",
        type: "circle",
        source: "point-end",
        paint: {
          "circle-color": "#C2E3F4",
          'circle-stroke-width': 2,
          'circle-stroke-color': "#3A5A69",
          "circle-radius": 5
        }
      })

      // get current bikePath middlePoint
      const middlePoint = Math.floor(path.length / 2)
      const { innerWidth } = window

      const getZoomSize = () => {
        if ((middlePoint > 40 && innerWidth > 575)) {
          return 11
        } else if ((middlePoint > 40 && innerWidth < 575 )) {
          return 9
        } else if(middlePoint < 40) return 13
      }

      // jump to current bikePath middle point
      this.mapInstance.jumpTo({
        center: [path[middlePoint][0], path[middlePoint][1]],
        zoom: getZoomSize(),
        speed: 2,
        curve: 1,
        duration: 5000,
        easing(e) {
          return e
        }
      })
    },
    async getBikeStation(city) {
      await this.getAllStation(city)
      this.station = this.$store.state.station
    },
    async getCurMarkerDetailInfo(type, info) {
      const loading = '載入中...'

      this.curMarkerDetailInfo = { ...info, add: loading, open: loading, phone: loading, fee: loading }
      this.curModalType = type
      this.$store.dispatch('isOpenModal', true)

      const detail = await this.$store.dispatch('getTourismDetail', { type, id: info.id })

      // the user may have clicked another marker while this one was loading
      if (this.curMarkerDetailInfo.id === info.id) {
        this.curMarkerDetailInfo = { ...info, ...detail }
      }
    },
    addEventListenerToMarker(targetMarker) {
      const { type, idx, info } = targetMarker
      const targetEl = document.querySelector(`.${type}-${idx}`)

      targetEl.addEventListener('click', () => this.getCurMarkerDetailInfo(type, info))
    },
  },
  mounted() {
    this.initMapBox()
  },
  beforeDestroy() {
    this.clearOldMarkers(this.stationMarker)
    this.clearOldMarkers(this.nearStationMarkers)
    this.clearOldMarkers(this.selfPosMarker)
    this.clearOldMarkers(this.nearRestaruantMarkers)
    this.clearOldMarkers(this.nearScenicSpotMarkers)
    this.clearOldMarkers(this.nearHotelMarkers)
    this.clearOldMarkers(this.nearEventMarkers)
    this.clearOldMarkers(this.nearServiceSiteMarkers)
    this.clearOldMarkers(this.nearMetroMarkers)

    if (this.mapInstance) this.mapInstance.remove()
  }
}
</script>

<style lang="sass">
// bike station popup (mapbox popup, so it lives outside the component scope)
$popup-bg: rgba(#0F1A24, 0.92)
$popup-accent: #22B8CF

.bikePopup
  z-index: 2
  .mapboxgl-popup-content
    position: relative
    overflow: hidden
    min-width: 200px
    padding: 14px 16px 10px
    color: #fff
    font-weight: normal
    background: $popup-bg
    border: 1px solid rgba(#fff, 0.08)
    border-radius: 14px
    box-shadow: 0 16px 40px rgba(#000, 0.4), 0 2px 6px rgba(#000, 0.3)
    backdrop-filter: blur(10px)
    // colour bar on top of the card
    &:before
      content: ''
      position: absolute
      top: 0
      left: 0
      right: 0
      height: 3px
      background: $popup-accent
  // the global tip colours use !important, so these have to as well
  &.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip
    border-top-color: $popup-bg !important
  &.mapboxgl-popup-anchor-top .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip,
  &.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip
    border-bottom-color: $popup-bg !important
  &.mapboxgl-popup-anchor-left .mapboxgl-popup-tip
    border-right-color: $popup-bg !important
  &.mapboxgl-popup-anchor-right .mapboxgl-popup-tip
    border-left-color: $popup-bg !important

// near stations that are not the selected one
.mapboxgl-marker svg
  transition: opacity 0.25s ease
.mapboxgl-marker.faded svg
  opacity: 0.3

.bikePopup-badge
  display: inline-flex
  align-items: center
  padding: 2px 10px 2px 8px
  font-size: 12px
  font-weight: bold
  letter-spacing: 1px
  color: $popup-accent
  background: rgba($popup-accent, 0.16)
  border-radius: 999px
  &:before
    content: ''
    width: 6px
    height: 6px
    margin-right: 6px
    border-radius: 50%
    background: $popup-accent

.bikePopup-title
  margin: 10px 0 12px
  font-size: 16px
  font-weight: bold
  line-height: 1.4
  word-break: break-word

.bikePopup-stats
  display: flex
  margin-bottom: 4px
  border-top: 1px solid rgba(#fff, 0.08)

.bikePopup-stat
  display: flex
  flex-direction: column
  flex: 1
  padding: 10px 0
  &:nth-of-type(2)
    padding-left: 14px
    border-left: 1px solid rgba(#fff, 0.08)
  .bikePopup-value
    font-size: 24px
    font-weight: bold
    line-height: 1.2
    color: $popup-accent

.bikePopup-row
  display: flex
  flex-direction: column
  padding: 9px 0
  border-top: 1px solid rgba(#fff, 0.08)
  .bikePopup-text
    margin-top: 3px
    font-size: 13px
    line-height: 1.5
    color: rgba(#fff, 0.92)
    word-break: break-word

.bikePopup-label
  font-size: 11px
  font-weight: bold
  letter-spacing: 1px
  color: rgba(#fff, 0.5)

@keyframes userPoint
  0%
    box-shadow: 0 0 0 rgba(#a3a3a3,0.7)
  60%
    opacity: 1
  100%
    box-shadow: 0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3, 0 0 4px #a3a3a3,0 0 4px #a3a3a3,0 0 4px #a3a3a3

.marker
  +setSize(12px)
  border-radius: 50%
  position: absolute
  border: 3px solid #a3a3a3
  // only fade in / out, a transition on transform would make the marker lag behind while the map is moved
  transition: opacity 0.3s, visibility 0.3s
  z-index: 1
  &.hidden
    opacity: 0
    visibility: hidden
  &.self
    background: #172532
    animation: userPoint 0.5s both infinite alternate
  &.restaurant
    background: #EE3239
  &.scenicSpot
    background: #5EAA5F
  &.hotel
    background: #FECE00
  &.event
    background: #8E6BBF
  &.serviceSite
    background: #F08A3C
  &.metro
    background: #2E86DE

.textBlock
  +setPosAbs(-42px,null,null,50%)
  width: 50px
  transform: translateX(-50%)
  font-size: 12px
  text-align: center
  line-height: 26px
  background: #000
  color: #fff
  border-radius: 6px
  &.self
    width: 50px
  &.restaurant,&.scenicSpot,&.hotel,&.event,&.serviceSite,&.metro
    min-width: 100px
    padding: 0 5px
  &:after
    content: ''
    +setPosAbs(null,null,-8px,50%)
    +setSize(0)
    border-style: solid
    border-width: 8px 5px 0 5px
    border-color: #000 transparent transparent transparent
    transform: translateX(-50%)

</style>
