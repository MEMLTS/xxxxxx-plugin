import * as cheerio from 'cheerio'
import { Request } from '#utils'

export class EHentaiSearch extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]Ehentai-Search',
      dsc: 'Ehentai-Search',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^(e)(hentai|站)(search|搜索)/i,
          fnc: 'search'
        }
      ]
    })
  }

  async search (e) {
    const keyword = e.msg.replace(/^(e)(hentai|站)(search|搜索)/i, '').trim()
    if (!keyword) return e.reply('请输入关键词', true)

    let url = `https://e-hentai.org/?f_search=${encodeURIComponent(keyword)}`
    logger.info(`搜索关键词: ${url}`)

    const response = await Request.request({ url })
    let html = response.data
    const $ = cheerio.load(html)
    const result = {
      data: $('.gltc tr').map((i, tr) => ({
        type: $(tr).find('.gl1c .cn').text().trim(),
        title: $(tr).find('.gl3c .glink').text().trim(),
        link: $(tr).find('.gl3c a').attr('href'),
        uploader: $(tr).find('.gl4c a')?.text().trim(),
        pages: $(tr).find('.gl4c div:nth-child(2)').text().trim(),
        cover: $(tr).find('.glthumb img').attr('src'),
        tags: $(tr).find('.gt').map((i, el) => $(el).text().trim()).get().join(', '),
        date: $(tr).find('.glcut div:nth-child(2)').text().trim(),
        rating: $(tr).find('.ir').css('background-position').split(' ')[1]
      })).get()
    }
    const common = { user_id: e.user_id || 451345424, nickname: e.nickname || '克鲁青山外' }
    const msg = result.data.map(item => ({
      message: `📖 标题: ${item.title}\n👤 作者: ${item.uploader}\n📚 类型: ${item.type}\n📄 页数: ${item.pages}\n🔗 链接: ${item.link}\n🖼️ 封面: ${item.cover}\n🏷️ 标签: ${item.tags}\n📅 日期: ${item.date}\n⭐ 评分: ${item.rating}`
    })).map(item => ({ ...common, ...item }))
    return e.reply(await Bot.makeForwardMsg(msg))
  }
}
