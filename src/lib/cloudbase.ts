import cloudbase from '@cloudbase/js-sdk'

const env = import.meta.env.VITE_CLOUDBASE_ENV_ID
const clientId = import.meta.env.VITE_CLOUDBASE_CLIENT_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION || 'ap-shanghai'

export const cloudbaseConfigured = Boolean(env && clientId)

export const cloudbaseApp = cloudbaseConfigured
  ? cloudbase.init({
      env: env as string,
      clientId: clientId as string,
      region,
    })
  : null

export function getAuth() {
  return cloudbaseApp?.auth() ?? null
}

export function getDb() {
  return cloudbaseApp?.database() ?? null
}
