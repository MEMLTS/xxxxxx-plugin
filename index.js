import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginDir = path.join(__dirname, 'app')

const loadPlugins = async () => {
  const start = Date.now()
  const apps = {}
  let success = 0
  let failure = 0

  logger.info('开始加载「xxxxxx-plugin」...')

  const scan = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const tasks = []
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        tasks.push(...(await scan(fullPath)))
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        tasks.push({
          name: entry.name.replace(/\.js$/, ''),
          path: fullPath
        })
      }
    }
    return tasks
  }

  try {
    const modules = await scan(pluginDir)
    const results = await Promise.allSettled(
      modules.map(m => import(pathToFileURL(m.path).href))
    )

    results.forEach((result, index) => {
      const { name } = modules[index]
      if (result.status === 'fulfilled') {
        apps[name] = result.value.default || result.value[Object.keys(result.value)[0]]
        success++
      } else {
        logger.error(`[xxxxxx-plugin]\x1b[31m✗\x1b[0m ${name.padEnd(15)} 加载失败: ${result.reason.message.slice(0, 30)}`)
        failure++
      }
    })

    const elapsed = Date.now() - start
    logger.info('「---------- xxxxxx-plugin ------------」')
    logger.info(`#   \x1b[16m[🍀] 成功加载 ${success} 个插件`)
    logger.info(`#   \x1b[86m[💥] 失败加载 ${failure} 个插件`)
    logger.info((`#   \x1b[36m[⏳] 启动耗时: ${elapsed}ms\x1b[0m`).trim())
    logger.info('「---------- xxxxxx-plugin ------------」')
    return apps
  } catch (error) {
    logger.error(`\x1b[48;5;196m\x1b[38;5;231m FATAL ERROR \x1b[0m\x1b[31m${error.message}\x1b[0m`.trim())
    return {}
  }
}

export const apps = await loadPlugins()
