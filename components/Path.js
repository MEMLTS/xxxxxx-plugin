import path from 'path'

const Path = path.resolve(process.cwd(), 'plugins')

const PluginName = 'xxxxxx-plugin' // 我就写死怎么了

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
