const GET_BIKE_STATION = 'GET_BIKE_STATION'
const GET_BIKE_AVAILABILITY = 'GET_BIKE_AVAILABILITY'
const GET_BIKE_CYCLING_SHAPE = 'GET_BIKE_CYCLING_SHAPE'

const GET_ALL_STATION_NAME = 'GET_ALL_STATION_NAME'
const GET_CUR_CITY_MAP = 'GET_CUR_CITY_MAP'

const GET_CUR_TARGET = 'GET_CUR_TARGET'

// advanced
const GET_BIKE_STATION_NEAR_BY = 'GET_BIKE_STATION_NEAR_BY'
const GET_BIKE_AVAILABILITY_NEAR_BY = 'GET_BIKE_AVAILABILITY_NEAR_BY'

const state = () => ({
  station: '',
  availability: '',
  cyclingShape: '',
  stationNearBy: '',
  availabilityNearBy: '',
  allStationName: '',
  curCityMap: [],
  initMapBox: '',
  curTarget: ''
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
  }
}

const actions = {
  getCurTarget({ commit }, curTarget) {
    console.log('store', curTarget)
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
  async getStationNearBy({ commit }) {
    const url = 'Bike/Station/NearBy'
    const res = await this.$axios.$get(`${url}?$format=JSON`)

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