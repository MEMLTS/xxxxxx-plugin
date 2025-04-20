import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginDir = path.join(__dirname, 'app')
const app = {}
const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

let successCount = 0
let failureCount = 0

// 生成彩色分割线
const generateDashes = () => {
  return Array.from({ length: 23 }, () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    return chalk[randomColor]('-')
  }).join('')
}

const loadPlugins = async () => {
  const startTime = Date.now()
  logger.info(chalk.cyan('xxxxxx插件载入中...'))

  // 改进后的并行扫描函数
  const scanDirectory = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const results = []

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name)

        if (entry.isDirectory()) {
          // 并行处理子目录
          results.push(...(await scanDirectory(fullPath)))
        } else if (
          entry.isFile() &&
          path.extname(entry.name) === '.js' &&
          !entry.name.startsWith('_') // 忽略以下划线开头的文件
        ) {
          results.push({
            name: path.basename(entry.name, '.js'),
            filePath: pathToFileURL(fullPath).href,
            dirPath: directory
          })
        }
      })
    )

    return results
  }

  try {
    const modules = await scanDirectory(pluginDir)
    logger.debug(`发现 ${modules.length} 个待加载模块`)

    // 使用allSettled保证完整加载统计
    const results = await Promise.allSettled(
      modules.map(({ filePath }) => import(filePath))
    )

    results.forEach((result, index) => {
      const { name, filePath, dirPath } = modules[index]
      try {
        if (result.status === 'rejected') throw result.reason

        const exportObj =
          result.value.default ||
          result.value[Object.keys(result.value)[0]] ||
          result.value

        if (!exportObj) {
          logger.warn(`🟡 空导出: ${chalk.yellow(name)} @ ${dirPath}`)
          return
        }

        // 处理重复命名
        const uniqueName = app[name] ? `${name}_${Date.now()}` : name
        app[uniqueName] = exportObj
        successCount++
      } catch (error) {
        logger.error(
          chalk.red`✗ ${name.padEnd(15)}` +
            chalk.dim`[${error.code || 'ERROR'}] ${error.message}`
        )
        logger.debug(`文件路径: ${filePath}`)
        failureCount++
      }
    })

    const elapsedTime = Date.now() - startTime
    const dashLine = generateDashes()

    logger.info(dashLine)
    logger.info('[xxxxxx-plugin] 载入完成!')
    logger.info(`成功加载: ${chalk.bold.green(successCount)} 个`)
    logger.info(`加载失败: ${chalk.bold.red(failureCount)} 个`)
    // logger.info(`扫描深度: ${chalk.bold.blue(pluginDir)}`)
    logger.info(`总耗时: ${chalk.bold.yellow(elapsedTime + 'ms')}`)
    logger.info(dashLine)
  } catch (error) {
    logger.error(chalk.red.bold`[核心错误] 插件系统初始化失败:`)
    logger.error(error.stack)
    process.exit(1)
  }

  return app
}

export const apps = await loadPlugins()
