import lodash from 'lodash'
import config from './config.js'
import cookie from './cookie.js'
import x from './x.js'
import { Config } from '#components'

export const schemas = [config, cookie, x].flat()

export function getConfigData () {
  return {
    config: Config.getDefOrConfig('config'),
    cookie: Config.getDefOrConfig('cookie'),
    x: Config.getDefOrConfig('x')
  }
}

export async function setConfigData (data, { Result }) {
  const configFiles = {
    config: Config.getDefOrConfig('config'),
    cookie: Config.getDefOrConfig('cookie'),
    x: Config.getDefOrConfig('x')
  }

  for (const [key, value] of Object.entries(data)) {
    const [rootKey, ...split] = key.split('.')
    const configFile = configFiles[rootKey]

    if (!configFile) continue

    let currentConfig = configFile
    for (let i = 0; i < split.length - 1; i++) {
      if (currentConfig[split[i]] === undefined) {
        currentConfig[split[i]] = {}
      }
      currentConfig = currentConfig[split[i]]
    }

    const lastKey = split[split.length - 1]
    if (!lodash.isEqual(currentConfig[lastKey], value)) {
      currentConfig[lastKey] = value
      Config.modify(rootKey, split.slice(1).join('.'), value)
    }
  }

  return Result.ok({}, '𝑪𝒊𝒂𝒍𝒍𝒐～(∠・ω< )⌒★')
}
