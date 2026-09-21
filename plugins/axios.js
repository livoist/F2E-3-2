const TOKEN_URL = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token'


// refresh a little before the real expiry so an in-flight request never carries a dead token
const EXPIRY_MARGIN_MS = 60 * 1000

export default function({ $axios, $config }) {
  const { tdxClientId, tdxClientSecret } = $config

  let token = ''
  let expiresAt = 0
  let pending = null

  const requestToken = async () => {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: tdxClientId,
        client_secret: tdxClientSecret
      })
    })

    if (!res.ok) throw new Error(`TDX token request failed: ${res.status}`)

    const data = await res.json()
    token = data.access_token
    expiresAt = Date.now() + data.expires_in * 1000 - EXPIRY_MARGIN_MS

    return token
  }

  // concurrent requests share one token request (token endpoint is limited to 20 calls/min/IP)
  const getToken = () => {
    if (token && Date.now() < expiresAt) return Promise.resolve(token)
    if (!pending) pending = requestToken().finally(() => { pending = null })

    return pending
  }

  $axios.defaults.baseURL = 'https://tdx.transportdata.tw/api/'
  $axios.onRequest(async config => {
    config.headers.common.Authorization = `Bearer ${await getToken()}`
    return config
  })
}
