import { Version, PluginName, BotName } from './index.js'

function scale (pct = 1, customScale = 1) {
  const baseScale = Math.min(2, Math.max(0.5, global.xxxxxx.config.renderScale / 100))
  pct = pct * baseScale * customScale
  return `style=transform:scale(${pct})`
}

const Render = {
  async render (path, params, cfg = { retType: 'default', saveId: '' }) {
    const { e } = cfg
    return e.runtime.render(PluginName, path, params, {
      retType: cfg.retType,
      renderCfg: cfg.renderCfg || {},
      beforeRender ({ data }) {
        const resPath = data.pluResPath
        const saveId =
          (cfg.saveId || e?.user_id || data.saveId) +
          '_' +
          Math.random().toString().slice(-6)

        const customScale = cfg.renderCfg?.scale || 1

        return {
          ...data,
          saveId,
          _res_path: resPath,
          sys: {
            scale: scale(1, customScale)
          },
          copyright: `<div class="copyright"><div class="copyright-info">Created By ${BotName} <span class="version">${Version.yunzai}</span> & ${PluginName}<span class="version"> ${data.pluginVersion || Version.latestVersion}</span></div></div>`
        }
      }
    })
  }
}

export default Render
