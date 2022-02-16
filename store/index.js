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

const getStationNearByUrl = (type, city, lat, lon) => {
  const endpoint = `Tourism/${type}/${city}`
  const url = `${endpoint}?$top=10&$spatialFilter=nearby(${lat},${lon}, 3000)&$format=JSON`

  return url
}

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
  isClearMakers: false,
  isClearBikePath: false,
  basicSelect: false,
  updateUserPosSelect: false,
  loading: false
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
  }
}

const actions = {
  isLoading({ commit }, bool) {
    commit(IS_LOADING, bool)
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
    const url = 'Bike/Station'
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
    const url = 'Bike/Availability'
    const res = await this.$axios.$get(`${url}/${city}?$format=JSON`)

    commit(GET_BIKE_AVAILABILITY, res)
  },
  async getCyclingShape({ commit }, city) {
    const url = 'Cycling/Shape'
    const res = await this.$axios.$get(`${url}/${city}?$format=JSON`)

    commit(GET_BIKE_CYCLING_SHAPE, res)
  },
  async getStationNearBy({ commit }, condition) {
    const url = 'Bike/Station/NearBy'
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
    const url = 'Bike/Availability/NearBy'
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
  async getRestaurantNearByPos({ commit }, condition) {
    const { PositionLat, PositionLon } = condition.pos
    const city = condition.city

    const result = getStationNearByUrl('Restaurant', city, PositionLat, PositionLon)
    const res = await this.$axios.$get(result)

    const newResultMap = res.map(item => {
      const { Position, Address, RestaurantName, Phone, OpenTime } = item
      const { PositionLat, PositionLon } = Position

      return {
        pos: [PositionLon, PositionLat],
        add: Address,
        name: RestaurantName,
        phone: Phone,
        open: OpenTime
      }
    })

    commit(GET_NEAR_RESTAURANT, newResultMap)
  },
  async getScenicSpotNearByPos({ commit }, condition) {
    const { PositionLat, PositionLon } = condition.pos
    const city = condition.city

    const result = getStationNearByUrl('ScenicSpot', city, PositionLat, PositionLon)
    const res = await this.$axios.$get(result)

    const newResultMap = res.map(item => {
      const { Position, Address, ScenicSpotName, Phone, OpenTime } = item
      const { PositionLat, PositionLon } = Position

      return {
        pos: [PositionLon, PositionLat],
        add: Address,
        name: ScenicSpotName,
        phone: Phone,
        open: OpenTime
      }
    })

    commit(GET_NEAR_SCENICSPOT, newResultMap)
  },
  async getHotelNearByPos({ commit }, condition) {
    const { PositionLat, PositionLon } = condition.pos
    const city = condition.city

    const result = getStationNearByUrl('Hotel', city, PositionLat, PositionLon)
    const res = await this.$axios.$get(result)

    const newResultMap = res.map(item => {
      const { Position, Address, HotelName, Phone, OpenTime } = item
      const { PositionLat, PositionLon } = Position

      return {
        pos: [PositionLon, PositionLat],
        add: Address,
        name: HotelName,
        phone: Phone,
        open: OpenTime
      }
    })

    commit(GET_NEAR_HOTEL, newResultMap)
  }
}

export default {
  state,
  mutations,
  actions
}