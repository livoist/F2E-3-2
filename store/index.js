const GET_BIKE_STATION = 'GET_BIKE_STATION'
const GET_BIKE_AVAILABILITY = 'GET_BIKE_AVAILABILITY'
const GET_BIKE_CYCLING_SHAPE = 'GET_BIKE_CYCLING_SHAPE'

const GET_ALL_STATION_NAME = 'GET_ALL_STATION_NAME'
const GET_CUR_CITY_MAP = 'GET_CUR_CITY_MAP'

const GET_CUR_TARGET = 'GET_CUR_TARGET'
const GET_CUR_BIKE_PATH = 'GET_CUR_BIKE_PATH'
const GET_USER_POSITION = 'GET_USER_POSITION'
const GET_CUR_NEAR_STATION_POS = 'GET_CUR_NEAR_STATION_POS'
const IS_CLEAR_NEAR_NAMES = 'IS_CLEAR_NEAR_NAMES'

// advanced
const GET_BIKE_STATION_NEAR_BY = 'GET_BIKE_STATION_NEAR_BY'
const GET_BIKE_AVAILABILITY_NEAR_BY = 'GET_BIKE_AVAILABILITY_NEAR_BY'

const state = () => ({
  station: '',
  availability: '',
  cyclingShape: '',
  stationNearBy: [],
  availabilityNearBy: '',
  allStationName: '',
  curCityMap: [],
  initMapBox: '',
  curTarget: '',
  curBikePath: [],
  userPos: [],
  nearNameIdx: 0,
  isClearNearNames: false
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
  [GET_CUR_NEAR_STATION_POS](state, idx) {
    state.nearNameIdx = idx
  },
  [IS_CLEAR_NEAR_NAMES](state, bool) {
    state.isClearNearNames = bool
  }
}

const actions = {
  getNearNamesState({ commit }, bool) {
    commit('IS_CLEAR_NEAR_NAMES', bool)
  },
  getCurNearNameIdx({ commit }, idx) {
    commit('GET_CUR_NEAR_STATION_POS', idx)
  },
  getCurBikePath({ commit }, path) {
    commit('GET_CUR_BIKE_PATH', path)
  },
  getCurTarget({ commit }, curTarget) {
    //console.log('store', curTarget)
    commit('GET_CUR_TARGET', curTarget)
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

    commit('GET_BIKE_STATION', res)
    commit('GET_ALL_STATION_NAME', nameMap)
    commit('GET_CUR_CITY_MAP', curCityMap)
  },
  async getAvailability({ commit }, city) {
    const url = 'Bike/Availability'
    const res = await this.$axios.$get(`${url}/${city}?$format=JSON`)

    commit('GET_BIKE_AVAILABILITY', res)
  },
  async getCyclingShape({ commit }, city) {
    const url = 'Cycling/Shape'
    const res = await this.$axios.$get(`${url}/${city}?$format=JSON`)

    commit('GET_BIKE_CYCLING_SHAPE', res)
  },
  async getStationNearBy({ commit }, condition) {
    const url = 'Bike/Station/NearBy'
    const { lat, lon, distance } = condition
    console.log('lat: ', lat)
    console.log('lon: ', lon)
    console.log('distance: ', distance)
    const res = await this.$axios.$get(
      `${url}?$top=10&$spatialFilter=nearby(${25.047675}, ${121.517055}, ${distance})&$format=JSON`
    )

    const pos = [121.517055, 25.047675]

    console.log('ressss', res)

    commit('GET_USER_POSITION', pos)
    commit('GET_BIKE_STATION_NEAR_BY', res)
  },
  async getAvailabilityNearBy({ commit }) {
    const url = 'Bike/Availability/NearBy'
    const res = await this.$axios.$get(`${url}?$format=JSON`)

    commit('GET_BIKE_AVAILABILITY_NEAR_BY', res)
  }
}

export default {
  state,
  mutations,
  actions
}