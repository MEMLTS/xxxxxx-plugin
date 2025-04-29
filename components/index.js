import Version from './Version.js'
import YamlReader from './YamlReader.js'
import Config from './Config.js'
import {
  PluginPath
} from './Path.js'

import Render from './Render.js'

const BotName = Version.isTrss
  ? 'Trss-Yunzai'
  : Version.isMiao
    ? 'Miao-Yunzai'
    : 'Yunzai-Bot'

const PluginName = 'xxxxxx-plugin'

export {
  Version,
  YamlReader,
  Config,
  PluginPath,
  BotName,
  PluginName,
  Render
}
