import fs from 'fs'
import { PluginPath } from './Path.js'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const readJsonFile = (filePath) => {
  try {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null
  } catch {
    return null
  }
}

const execAsync = promisify(exec)

export async function getCurrentCommitHash () {
  const { stdout } = await execAsync('git rev-parse HEAD')
  return stdout.trim()
}

const hash = await getCurrentCommitHash()
const packageJson = readJsonFile('package.json')
const pluginPackageJson = readJsonFile(path.join(PluginPath, 'package.json'))

const Version = {
  isMiao: Boolean(packageJson?.dependencies?.sequelize),
  isTrss: Array.isArray(Bot.uin),
  isXRK: Boolean(packageJson?.name == 'xrk-yunzai'),
  get latestVersion () {
    return pluginPackageJson?.version || null
  },
  get yunzai () {
    return packageJson?.version || null
  },
  get gitHash () {
    return hash
  }
}

export default Version
