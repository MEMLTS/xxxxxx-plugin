import { getReq } from './request.js'
import { Request } from '#utils'

export class PixivComicStrip extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]Pixiv解析-ComicStrip',
      dsc: 'Pixiv解析-漫画',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^(?:https?:\/\/)?www\.pixiv\.net\/artworks\/(\d+)|^#pixiv(?:查看|阅读)(漫画)(\d+)/i,
          fnc: 'comicStrip'
        }
      ]
    })
  }

  async comicStrip (e) {
    if (!global.xxxxxx.pixiv.enable) {
      return logger.warn('[xxxxxx] Pixiv解析未启用！')
    }
    if (!e.msg || typeof e.msg !== 'string') {
      return e.reply('无效的消息内容！')
    }

    e.reply('Pixiv正在解析中...', true, { recallMsg: 5 })
    let id
    const urlMatch = e.msg.match(
      /^(?:https?:\/\/)?www\.pixiv\.net\/artworks\/(\d+)/i
    )
    if (urlMatch) {
      id = urlMatch[1]
    }

    const pixivMatch = e.msg.match(/^#pixiv(?:查看|阅读)(漫画)(\d+)/)
    if (pixivMatch) {
      id = pixivMatch[2]
    }

    if (!id) {
      return e.reply('未找到有效的Pixiv漫画ID', true)
    }

    let res = await getReq(`https://www.pixiv.net/ajax/illust/${id}/pages?lang=zh`)
    let data = JSON.parse(res.data)
    if (data.error) {
      return e.reply('Pixiv解析失败: ' + data.message, true)
    }

    const common = { user_id: e.user_id || 451345424, nickname: e.nickname || '克鲁青山外' }

    const msg = [
      { message: `🎨 Pixiv漫画解析\n共找到${data.body.length}张图片` },
      ...(await Promise.all(data.body.map(async (item, index) => {
        const imageBuffer = await Request.request({
          url: item.urls.original,
          headers: {
            Referer: 'https://i.pximg.net'
          }
        })

        const base64Image = `base64://${Buffer.from(imageBuffer.data).toString('base64')}`

        return {
          message: segment.image(base64Image)
        }
      })))
    ].map(item => ({ ...common, ...item }))

    return e.reply(await Bot.makeForwardMsg(msg))
  }
}
