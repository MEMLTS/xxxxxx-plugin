import * as cheerio from 'cheerio'
import { Request } from '#utils'

function calculateRating (bgPosition) {
  if (!bgPosition) return '暂无评分'
  const [xPos, yPos] = bgPosition.split(' ').map(val => parseInt(val.replace('px', '')))

  if (xPos === 0 && yPos === -1) return '5.0'
  if (xPos === -16 && yPos === -1) return '4.5'
  if (xPos === -32 && yPos === -1) return '4.0'
  if (xPos === -48 && yPos === -1) return '3.5'
  if (xPos === -32 && yPos === -21) return '3.0'
  if (xPos === -32 && yPos === -1) return '2.5'
  if (xPos === -48 && yPos === -1) return '2.0'
  if (xPos === -64 && yPos === -1) return '1.5'
  if (xPos === -80 && yPos === -1) return '1.0'
  if (xPos === 0 && yPos === -21) return '4.5'
  if (xPos === -96 && yPos === -1) return '0.5'
  if (xPos === -112 && yPos === -1) return '0.0'

  return '评分未知'
}

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
    if (!global.xxxxxx.ehentai.enable) {
      return logger.warn('[xxxxxx] Ehentai未启用！')
    }
    const keyword = e.msg.replace(/^(e)(hentai|站)(search|搜索)/i, '').trim()
    if (!keyword) return e.reply('请输入关键词', true)

    let url = `https://e-hentai.org/?f_search=${encodeURIComponent(keyword)}`
    const response = await Request.request({ url })
    let html = response.data
    const $ = cheerio.load(html)

    const result = {
      data: $('.gltc tr').map((i, tr) => {
        const title = $(tr).find('.gl3c .glink').text().trim()
        if (!title) return null

        const link = $(tr).find('.gl3c a').attr('href')
        const uploader = $(tr).find('.gl4c a')?.text().trim()
        const pages = $(tr).find('.gl4c div:nth-child(2)').text().trim()
        const cover = $(tr).find('.glthumb img').attr('data-src') || $(tr).find('.glthumb img').attr('src')
        const tags = $(tr).find('.gt').map((i, el) => $(el).text().trim()).get().join(', ')

        const date = $(tr).find('div[id^="posted_"]').text().trim()
        const type = $(tr).find('.gl1c .cn').text().trim()
        const rating = calculateRating($(tr).find('.ir').css('background-position'))

        return {
          type,
          title,
          link,
          uploader,
          pages,
          cover,
          tags,
          date,
          rating
        }
      }).get().filter(item => item !== null) // 过滤掉标题为null的项
    }

    const common = { user_id: e.user_id || 451345424, nickname: e.nickname || '克鲁青山外' }
    const msgPromises = result.data.map(async item => {
      const imageData = await Request.request({ url: item.cover })
      return {
        ...common,
        ...item,
        message: [
      `📖 标题: ${item.title}\n👤 作者: ${item.uploader}\n📚 类型: ${item.type}\n📄 页数: ${item.pages}\n🔗 链接: ${item.link}\n🏷️ 标签: ${item.tags}\n📅 日期: ${item.date}\n⭐ 评分: ${item.rating}`,
      segment.image(`base64://${Buffer.from(imageData.data).toString('base64')}`)
        ]
      }
    })
    const msg = await Promise.all(msgPromises)

    return e.reply(await Bot.makeForwardMsg(msg))
  }
}
