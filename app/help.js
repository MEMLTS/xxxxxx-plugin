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
    e.reply('你好', true)
  }
}
