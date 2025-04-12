import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ansiEscapes from 'ansi-escapes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginDir = path.join(__dirname, 'app')

const cyber = {
  rainbow: (text, offset = 0) => [...text].map((c, i) => {
    const hue = 30 * ((i + offset) % 12)
    return `\x1b[38;5;${200 + hue}m${c}`
  }).join(''),

  glitch: (text) => text.split('').map(c =>
    Math.random() < 0.2 ? `\x1b[38;5;${Math.random() < 0.5 ? 124 : 21}m${c}` : c
  ).join(''),

  progress: (percent) => {
    const bar = Array(20).fill('▓').map((c, i) =>
      i < percent / 5 ? `\x1b[38;5;${213 - i * 10}m${c}` : '░'
    ).join('')
    return `\x1b[36m[${bar}]\x1b[0m ${Math.round(percent)}%`
  },

  spinner: (() => {
    const frames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']
    let index = 0
    return () => frames[index++ % frames.length]
  })()
}

const loadPlugins = async () => {
  const start = Date.now()
  const apps = {}
  let success = 0; let failure = 0
  let loading = true

  const animate = () => {
    let frame = 0
    const render = () => {
      if (!loading) return
      process.stdout.write(ansiEscapes.cursorHide + ansiEscapes.cursorMove(0, 0))

      // 那咋了
      console.log(`
        ${cyber.glitch('██╗  ██╗███████╗██╗   ██╗███████╗')}
        ${cyber.glitch('██║  ██║██╔════╝╚██╗ ██╔╝██╔════╝')}  ${cyber.spinner()} ${cyber.rainbow('XXXXXX PLUGIN SYSTEM', frame)}
        ${cyber.glitch('███████║█████╗   ╚████╔╝ ███████╗')}
        ${cyber.glitch('██╔══██║██╔══╝    ╚██╔╝  ╚════██║')}  ${cyber.progress((Date.now() - start) % 100)}
        ${cyber.glitch('██║  ██║███████╗   ██║   ███████║')}
        ${cyber.glitch('╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝')}
      `)

      frame++
      setTimeout(render, 100)
    }
    render()
  }

  const stopAnimation = () => {
    loading = false
    console.log(ansiEscapes.cursorShow)
  }

  try {
    animate()

    // 扫描插件
    const scan = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      let tasks = []
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          tasks.push(...await scan(fullPath))
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          tasks.push({ name: entry.name.replace(/\.js$/, ''), path: fullPath })
        }
      }
      return tasks
    }

    const modules = await scan(pluginDir)
    const results = await Promise.allSettled(modules.map(m => import(pathToFileURL(m.path).href)))

    // 处理结果
    results.forEach((result, index) => {
      const { name } = modules[index]
      if (result.status === 'fulfilled') {
        const exports = result.value
        apps[name] = exports.default || exports[Object.keys(exports)[0]]
        success++
        console.log(`\x1b[32m✓\x1b[0m \x1b[36m${name.padEnd(15)}\x1b[0m \x1b[38;5;105mLOADED\x1b[0m`)
      } else {
        failure++
        console.log(`\x1b[31m✗\x1b[0m \x1b[33m${name.padEnd(15)}\x1b[0m \x1b[38;5;196mFAIL\x1b[0m \x1b[38;5;240m${result.reason.message.slice(0, 30)}\x1b[0m`)
      }
    })

    // 最终显示
    stopAnimation()
    const elapsed = Date.now() - start
    console.log(`
      \x1b[38;5;51m╔══════════════════════════════════╗
      \x1b[38;5;51m║ \x1b[38;5;213mSYSTEM STATUS   成功\x1b[32m ${success} \x1b[33m失败\x1b[31m ${failure} \x1b[38;5;51m║
      \x1b[38;5;51m║ \x1b[38;5;117mBOOT TIME       ${elapsed}ms\x1b[38;5;51m              ║
      \x1b[38;5;51m╚══════════════════════════════════╝\x1b[0m
    `)

    return apps
  } catch (error) {
    stopAnimation()
    console.log(`\x1b[48;5;196m\x1b[38;5;231m FATAL ERROR \x1b[0m \x1b[31m${error.message}\x1b[0m`)
    return {}
  }
}

export const apps = await loadPlugins()
