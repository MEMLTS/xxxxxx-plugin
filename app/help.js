import _ from 'lodash'
import { Render } from '#components'
import { helpCfg, helpsList, style } from '../config/help.js'

export class Help extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]帮助',
      dsc: '[xxxxxx-plugin]帮助',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?(xxxxxx)(帮助|help|菜单|幫助|菜單)(列表|list)?$/i,
          fnc: 'help'
        }
      ]
    })
  }

  async help (e) {
    this.handleHelp(e, helpsList)
  }

  async handleHelp (e, helpList) {
    const helpGroup = helpList.map(group => {
      group.list.forEach(help => {
        const icon = help.icon * 1
        help.css = icon ? `background-position:-${((icon - 1) % 10) * 50}px -${Math.floor((icon - 1) / 10) * 50}px` : 'display:none'
      })
      return group
    })

    const themeData = await getThemeData(helpCfg, helpCfg)
    await Render.render(
      'help/index',
      { helpCfg, helpGroup, ...themeData, element: 'default' },
      { e, scale: 1.6 }
    )
  }
}

async function getThemeCfg () {
  const resPath = '{{_res_path}}/image/'
  return {
    main: `${resPath}/help.png`,
    style
  }
}

async function getThemeData (diyStyle, sysStyle) {
  const helpConfig = { ...sysStyle, ...diyStyle }
  const colCount = Math.min(5, Math.max(parseInt(helpConfig.colCount) || 3, 2))
  const colWidth = Math.min(500, Math.max(100, parseInt(helpConfig.colWidth) || 265))
  const width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
  const theme = await getThemeCfg()
  const themeStyle = theme.style || {}

  const css = (sel, cssProp, key, def, fn) => {
    let val = getDef(themeStyle[key], diyStyle[key], sysStyle[key], def)
    if (fn) val = fn(val)
    return `${sel} { ${cssProp}: ${val}; }`
  }

  const ret = [
    `body { background-image: url(${theme.main}); width: ${width}px; }`,
    `.container { background-image: url(${theme.main}); width: ${width}px; }`,
    `.help-table .td, .help-table .th { width: ${100 / colCount}%; }`,
    css('.help-title, .help-group', 'color', 'fontColor', '#ceb78b'),
    css('.help-title, .help-group', 'text-shadow', 'fontShadow', 'none'),
    css('.help-desc', 'color', 'descColor', '#eee'),
    css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)'),
    css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, n => diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`),
    css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)'),
    css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, .2)'),
    css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, .4)')
  ]

  return {
    style: `<style>${ret.join('\n')}</style>`,
    colCount
  }
}

function getDef (...args) {
  return args.find(arg => !_.isUndefined(arg))
}
