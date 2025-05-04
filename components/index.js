import Version from './Version.js'
import YamlReader from './YamlReader.js'
import Config from './Config.js'
import {
  PluginPath,
  PluginName
} from './Path.js'

import Render from './Render.js'

const BotName = Version.isTrss
  ? 'TRSS-Yunzai'
  : Version.isMiao
    ? 'Miao-Yunzai'
    : 'Yunzai-Bot'

export {
  Version,
  YamlReader,
  Config,
  PluginPath,
  BotName,
  PluginName,
  Render
}
