import { Request } from '#utils'

export class PixivNovel extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]Pixiv解析-novel',
      dsc: 'Pixiv解析-小说',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^(?:https?:\/\/)?www\.pixiv\.net\/novel\/show\.php\?id=(\d+)|^#pixiv(?:查看|阅读)(小说)(\d+)/,
          fnc: 'novel'
        }
      ]
    })
  }

  async novel (e) {
    e.reply('Pixiv正在解析中...', true)
    let id
    const urlMatch = e.msg.match(
      /(?:https?:\/\/)?www\.pixiv\.net\/novel\/show\.php\?id=(\d+)/
    )
    if (urlMatch) {
      id = urlMatch[1]
    }

    const pixivMatch = e.msg.match(/^#pixiv(?:查看|阅读)(小说)(\d+)/)
    if (pixivMatch) {
      id = pixivMatch[2]
    }
    let url = `https://www.pixiv.net/ajax/novel/${id}?lang=zh`
    const response = await Request.request({
      url,
      cookie: undefined
    })

    const novelData = JSON.parse(response.data).body
    const novelDetail = novelData.content.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')

    const common = { user_id: e.user_id || 451345424, nickname: e.nickname || '克鲁青山外' }
    const msg = [
      { message: `📖 标题: ${novelData.title}\n👤 作者: ${novelData.userName}` },
      { message: `❤️ 收藏数: ${novelData.bookmarkCount}\n👍 点赞数: ${novelData.likeCount}\n👀 阅读数: ${novelData.viewCount}` },
      { message: `🕒 创建时间: ${novelData.createDate}\n🔄 更新时间: ${novelData.uploadDate}` },
      {
        message: `📝 内容:\n${novelDetail}`
      },
      {
        message: ['🖼️ 封面:', segment.image(`base64://${Buffer.from((await Request.request({
          url: novelData.coverUrl,
          headers: {
            Referer: 'https://i.pximg.net'
          }
        })).data).toString('base64')}`)]
      },
      {
        message: `🏷️ 标签: ${novelData.tags.tags
          .map((tag) => tag.tag)
          .join(', ')}`
      }
    ].map(item => ({ ...common, ...item }))
    return e.reply(await Bot.makeForwardMsg(msg))
  }
}
