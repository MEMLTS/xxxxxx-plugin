import lodash from 'lodash'
import config from './config.js'
import cookie from './cookie.js'
import x from './x.js'
import ehentai from './ehentai.js'
import pixiv from './pixiv.js'
import { Config } from '#components'

export const schemas = [
  config,
  cookie,
  x,
  pixiv,
  ehentai
].flat()

export function getConfigData () {
  return {
    config: Config.getDefOrConfig('config'),
    cookie: Config.getDefOrConfig('cookie'),
    x: Config.getDefOrConfig('x'),
    pixiv: Config.getDefOrConfig('pixiv'),
    ehentai: Config.getDefOrConfig('ehentai')
  }
}

export async function setConfigData (data, { Result }) {
  const configFiles = new Map([
    ['config', Config.getDefOrConfig('config')],
    ['cookie', Config.getDefOrConfig('cookie')],
    ['x', Config.getDefOrConfig('x')],
    ['pixiv', Config.getDefOrConfig('pixiv')],
    ['ehentai', Config.getDefOrConfig('ehentai')]
  ])

  for (const [key, value] of Object.entries(data)) {
    const split = key.split('.')
    const rootKey = split[0]
    const configFile = configFiles.get(rootKey)

    if (!configFile) continue

    let currentConfig = configFile
    for (let i = 1; i < split.length - 1; i++) {
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
