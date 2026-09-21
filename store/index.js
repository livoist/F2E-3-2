const GET_BIKE_STATION = 'GET_BIKE_STATION'
const GET_BIKE_AVAILABILITY = 'GET_BIKE_AVAILABILITY'
const GET_BIKE_CYCLING_SHAPE = 'GET_BIKE_CYCLING_SHAPE'

const GET_ALL_STATION_NAME = 'GET_ALL_STATION_NAME'
const GET_CUR_CITY_MAP = 'GET_CUR_CITY_MAP'

const GET_CUR_TARGET = 'GET_CUR_TARGET'
const GET_CUR_BIKE_PATH = 'GET_CUR_BIKE_PATH'
const GET_USER_POSITION = 'GET_USER_POSITION'
const GET_CUR_NEAR_ITEM = 'GET_CUR_NEAR_ITEM'

// ---Advanced--- //
const GET_BIKE_STATION_NEAR_BY = 'GET_BIKE_STATION_NEAR_BY'
const GET_BIKE_AVAILABILITY_NEAR_BY = 'GET_BIKE_AVAILABILITY_NEAR_BY'

// get nearBy restaurant
const GET_NEAR_RESTAURANT = 'GET_NEAR_RESTAURANT'

// get nearBy scenicSpot
const GET_NEAR_SCENICSPOT = 'GET_NEAR_SCENICSPOT'

// get nearBy hotel
const GET_NEAR_HOTEL = 'GET_NEAR_HOTEL'

// get nearBy event
const GET_NEAR_EVENT = 'GET_NEAR_EVENT'

// get nearBy tourism service site
const GET_NEAR_SERVICE_SITE = 'GET_NEAR_SERVICE_SITE'

// get nearBy metro station
const GET_NEAR_METRO = 'GET_NEAR_METRO'

// is clear other markers
const IS_CLEAR_OTHER_MARKERS = 'IS_CLEAR_OTHER_MARKERS'

// is clear bike path
const IS_CLEAR_BIKE_PATH = 'IS_CLEAR_BIKE_PATH'

// is change basic station select
const IS_CHANGE_BASIC_SELECT = 'IS_CHANGE_BASIC_SELECT'

// is update user pos select
const IS_UPDATE_USER_POS_SELECT = 'IS_UPDATE_USER_POS_SELECT'

// is loading
const IS_LOADING = 'IS_LOADING'

// is loadingSource
const IS_LOADING_SOURCE = 'IS_LOADING_SOURCE'

// is open modal
const IS_OPEN_MODAL = 'IS_OPEN_MODAL'

const TOURISM_ENDPOINT = 'tourism/service/odata/V2/Tourism'
const TOURISM_NEARBY_ENDPOINT = `${TOURISM_ENDPOINT}/Nearby`
const NEAR_BY_DISTANCE = 1000
const MAX_NEAR_BY_ITEMS = 10

// Nearby only returns id, name and position for each place (no address / phone / opening hours),
// keep the id so the details can be looked up from the per-type endpoints later
const normalizeNearBy = (list, idKey, nameKey) => {
  return (list || []).slice(0, MAX_NEAR_BY_ITEMS).map(item => ({
    id: item[idKey],
    pos: [item.PositionLon, item.PositionLat],
    name: item[nameKey]
  }))
}

// ---Tourism detail (looked up by the ids from Nearby)--- //
const joinAddress = address => {
  if (!address) return ''

  return [address.City, address.Town, address.StreetAddress].filter(Boolean).join('')
}

const joinPhones = phones => {
  return (phones || [])
    .map(item => item.Ext ? `${item.Tel} #${item.Ext}` : item.Tel)
    .filter(Boolean)
    .join(', ')
}

const formatDate = iso => iso ? iso.slice(0, 10) : ''

// the API glues the weekdays together ("星期一: 休息星期二: 11:00 – 14:00星期三: ..."), split them apart again
const formatServiceTimeInfo = text => (text || '').replace(/(.)(星期[一二三四五六日]:)/g, '$1；$2')

// address / phone / opening time exist on the detail of every type
const normalizeDetail = res => ({
  add: joinAddress(res.PostalAddress),
  phone: joinPhones(res.Telephones),
  open: formatServiceTimeInfo(res.ServiceTimeInfo)
})

const TOURISM_DETAIL = {
  restaurant: {
    path: id => `Restaurant/${id}`,
    normalize: normalizeDetail
  },
  scenicSpot: {
    path: id => `Attraction/${id}`,
    normalize: res => ({
      ...normalizeDetail(res),
      fee: res.FeeInfo || (res.IsAccessibleForFree ? '免費' : '')
    })
  },
  hotel: {
    path: id => `Hotel/${id}`,
    normalize: normalizeDetail
  },
  serviceSite: {
    path: id => `TourismServiceSite/${id}`,
    normalize: normalizeDetail
  },
  event: {
    path: id => `Event/${id}`,
    normalize: res => ({
      ...normalizeDetail(res),
      // events have a running period instead of opening hours
      open: res.StartDateTime ? `${formatDate(res.StartDateTime)} ~ ${formatDate(res.EndDateTime)}` : ''
    })
  }
}

// the API is strictly rate limited, so a detail is only requested once per place
const detailCache = {}

// types without an entry in TOURISM_DETAIL (metro stations) only have what Nearby returns
const NO_DETAIL = {}

const state = () => ({
  station: '',
  availability: '',
  cyclingShape: '',
  stationNearBy: [],
  availabilityNearBy: [],
  allStationName: '',
  curCityMap: [],
  curTarget: '',
  curBikePath: [],
  userPos: [],
  nearNameItem: '',
  restaurantNearBy: [],
  scenicSpotNearBy: [],
  hotelNearBy: [],
  eventNearBy: [],
  serviceSiteNearBy: [],
  metroNearBy: [],
  isClearMakers: false,
  isClearBikePath: false,
  basicSelect: false,
  updateUserPosSelect: false,
  loading: false,
  loadingSource: false,
  openModal: false
})

const mutations = {
  [GET_BIKE_STATION](state, station) {
    state.station = station
  },
  [GET_BIKE_AVAILABILITY](state, availability) {
    state.availability = availability
  },
  [GET_BIKE_CYCLING_SHAPE](state, shape) {
    state.cyclingShape = shape
  },
  [GET_BIKE_STATION_NEAR_BY](state, stationNear) {
    state.stationNearBy = stationNear
  },
  [GET_BIKE_AVAILABILITY_NEAR_BY](state, availabilityNear) {
    state.availabilityNearBy = availabilityNear
  },
  [GET_ALL_STATION_NAME](state, names) {
    state.allStationName = names
  },
  [GET_CUR_CITY_MAP](state, map) {
    state.curCityMap = map
  },
  [GET_CUR_TARGET](state, target) {
    state.curTarget = target
  },
  [GET_CUR_BIKE_PATH](state, path) {
    state.curBikePath = path
  },
  [GET_USER_POSITION](state, pos) {
    state.userPos = pos
  },
  [GET_CUR_NEAR_ITEM](state, item) {
    state.nearNameItem = item
  },
  [GET_NEAR_RESTAURANT](state, result) {
    state.restaurantNearBy = result
  },
  [GET_NEAR_SCENICSPOT](state, result) {
    state.scenicSpotNearBy = result
  },
  [GET_NEAR_HOTEL](state, result) {
    state.hotelNearBy = result
  },
  [GET_NEAR_EVENT](state, result) {
    state.eventNearBy = result
  },
  [GET_NEAR_SERVICE_SITE](state, result) {
    state.serviceSiteNearBy = result
  },
  [GET_NEAR_METRO](state, result) {
    state.metroNearBy = result
  },
  [IS_CLEAR_OTHER_MARKERS](state, bool) {
    state.isClearMakers = bool
  },
  [IS_CLEAR_BIKE_PATH](state, bool) {
    state.isClearBikePath = bool
  },
  [IS_CHANGE_BASIC_SELECT](state, bool) {
    state.basicSelect = bool
  },
  [IS_LOADING](state, bool) {
    state.loading = bool
  },
  [IS_UPDATE_USER_POS_SELECT](state, bool) {
    state.updateUserPosSelect = bool
  },
  [IS_LOADING_SOURCE](state, bool) {
    state.loadingSource = bool
  },
  [IS_OPEN_MODAL](state, bool) {
    state.openModal = bool
  }
}

const actions = {
  isLoading({ commit }, bool) {
    commit(IS_LOADING, bool)
  },
  isOpenModal({ commit }, bool) {
    commit(IS_OPEN_MODAL, bool)
  },
  isLoadingSource({ commit }, bool) {
    commit(IS_LOADING_SOURCE, bool)
  },
  isUpdateUserPosSelect({ commit }, bool) {
    commit(IS_UPDATE_USER_POS_SELECT, bool)
  },
  changeBasicSelect({ commit }, bool) {
    commit(IS_CHANGE_BASIC_SELECT, bool)
  },
  isClearInfoBikePath({ commit }, bool) {
    commit(IS_CLEAR_BIKE_PATH, bool)
  },
  isClearInfoMarker({ commit }, bool) {
    commit(IS_CLEAR_OTHER_MARKERS, bool)
  },
  // forget everything the advanced (near by) search produced
  clearNearByStation({ commit }) {
    commit(GET_USER_POSITION, [])
    commit(GET_BIKE_STATION_NEAR_BY, [])
    commit(GET_BIKE_AVAILABILITY_NEAR_BY, [])
    commit(GET_CUR_NEAR_ITEM, '')
  },
  getCurNearItem({ commit }, item) {
    commit(GET_CUR_NEAR_ITEM, item)
  },
  getCurBikePath({ commit }, path) {
    commit(GET_CUR_BIKE_PATH, path)
  },
  getCurTarget({ commit }, curTarget) {
    commit(GET_CUR_TARGET, curTarget)
  },
  async getAllStation({ commit }, city) {
    const url = 'basic/v2/Bike/Station/City'
    const res = await this.$axios.$get(`${url}/${city}?&$format=JSON`)

    const curCityMap = res.map(item => {
      return {
        name: item.StationName.Zh_tw,
        address: item.StationAddress.Zh_tw,
        id: item.StationID,
        pos: item.StationPosition
      }
    })

    const nameMap = curCityMap.map(item => item.name)

    commit(GET_BIKE_STATION, res)
    commit(GET_ALL_STATION_NAME, nameMap)
    commit(GET_CUR_CITY_MAP, curCityMap)
  },
  async getAvailability({ commit }, city) {
    const url = 'basic/v2/Bike/Availability/City'
    const res = await this.$axios.$get(`${url}/${city}?$format=JSON`)

    commit(GET_BIKE_AVAILABILITY, res)
  },
  async getCyclingShape({ commit }, city) {
    const url = 'basic/v2/Cycling/Shape/City'
    const res = await this.$axios.$get(`${url}/${city}?$format=JSON`)

    commit(GET_BIKE_CYCLING_SHAPE, res)
  },
  async getStationNearBy({ commit }, condition) {
    const url = 'advanced/v2/Bike/Station/NearBy'
    const { lat, lon, distance } = condition
    // console.log('lat: ', lat)
    // console.log('lon: ', lon)
    // console.log('distance: ', distance)

    // const testOb = {
    //   lat: 25.047675,
    //   lon: 121.517055,
    //   pos: [121.517055, 25.047675]
    // }

    const res = await this.$axios.$get(
      `${url}?$spatialFilter=nearby(${lat}, ${lon}, ${distance})&$format=JSON`
    )

    const userPos = [lon, lat]

    commit(GET_USER_POSITION, userPos)
    commit(GET_BIKE_STATION_NEAR_BY, res)
  },
  async getAvailabilityNearBy({ commit }, condition) {
    const url = 'advanced/v2/Bike/Availability/NearBy'
    const { lat, lon, distance } = condition
    // console.log('lat: ', lat)
    // console.log('lon: ', lon)
    // console.log('distance: ', distance)

    // const testOb = {
    //   lat: 25.047675,
    //   lon: 121.517055
    // }

    const res = await this.$axios.$get(
      `${url}?$top=10&$spatialFilter=nearby(${lat}, ${lon}, ${distance})&$format=JSON`
    )

    commit(GET_BIKE_AVAILABILITY_NEAR_BY, res)
  },
  async getTourismDetail(context, { type, id }) {
    const key = `${type}:${id}`

    if (!TOURISM_DETAIL[type]) return NO_DETAIL

    if (!detailCache[key]) {
      const { path, normalize } = TOURISM_DETAIL[type]

      detailCache[key] = this.$axios.$get(`${TOURISM_ENDPOINT}/${path(id)}`)
        // single-item endpoints return the object itself, list endpoints wrap it in { value: [] }
        .then(res => normalize(res.value ? res.value[0] || {} : res))
        .catch(err => {
          // 404 means the place has no such data, which is final; anything else may work next time
          if (!err.response || err.response.status !== 404) {
            delete detailCache[key]
            console.warn(`Failed to load ${type} detail`, err)
          }

          return {}
        })
    }

    return detailCache[key]
  },
  async getTourismNearBy({ commit }, pos) {
    const { PositionLat, PositionLon } = pos
    let res = {}

    try {
      // this endpoint rejects $format, so it is intentionally not sent
      res = await this.$axios.$get(
        `${TOURISM_NEARBY_ENDPOINT}?X=${PositionLon}&Y=${PositionLat}&Distance=${NEAR_BY_DISTANCE}`
      )
    } catch (err) {
      // tourism data is optional extra info, don't break the station search when it fails
      console.warn('Failed to load tourism near by', err)
    }

    commit(GET_NEAR_RESTAURANT, normalizeNearBy(res.RelatedRestaurants, 'RestaurantID', 'RestaurantName'))
    commit(GET_NEAR_SCENICSPOT, normalizeNearBy(res.RelatedAttractions, 'AttractionID', 'AttractionName'))
    commit(GET_NEAR_HOTEL, normalizeNearBy(res.RelatedHotels, 'HotelID', 'HotelName'))
    commit(GET_NEAR_EVENT, normalizeNearBy(res.RelatedEvents, 'EventID', 'EventName'))
    commit(GET_NEAR_SERVICE_SITE, normalizeNearBy(res.RelatedTourismServiceSites, 'TourismServiceSiteID', 'TourismServiceSiteName'))
    commit(GET_NEAR_METRO, normalizeNearBy(res.RelatedMetroStations, 'StationUID', 'StationName'))
  }
}

export default {
  state,
  mutations,
  actions
}