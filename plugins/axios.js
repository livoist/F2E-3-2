import jsSHA from "jssha"

const getAuthorizationHeader = () => {
  const AppID = 'd090fe07190b465593810b508ab5ead9'
  const AppKey = 'Lv0hXoTjqY-ihoCgosZNAbcab2o'

  const GMTString = new Date().toGMTString()
  const ShaObj = new jsSHA('SHA-1', 'TEXT')
  ShaObj.setHMACKey(AppKey, 'TEXT')
  ShaObj.update(`x-date: ${GMTString}`)

  const HMAC = ShaObj.getHMAC('B64')
  const Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"'

  return { 'Authorization': Authorization, 'X-Date': GMTString }
}

export default function({ $axios }) {
  $axios.defaults.baseURL = `https://ptx.transportdata.tw/MOTC/v2/`
  $axios.defaults.headers = getAuthorizationHeader()
  // $axios.onRequest((config) => {
  //   console.log('Making request to ' + config.url)
  // })
}