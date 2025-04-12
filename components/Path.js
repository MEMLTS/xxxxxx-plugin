import path from 'path'

const Path = path.resolve(process.cwd(), 'plugins')
const PluginName = 'xxxxxx-plugin'
const PluginPath = path.resolve(Path, PluginName)
const PluginTemp = path.join(PluginPath, 'temp')
const PluginData = path.join(PluginPath, 'data')

export {
  Path,
  PluginPath,
  PluginTemp,
  PluginData,
  PluginName
}
