import * as cheerio from 'cheerio'
import { Request } from '#utils'

export class EHentaiSearch extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]Ehentai-Gallery',
      dsc: 'Ehentai-Gallery',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^https?:\/\/e-hentai\.org\/g\/\d+\/[a-z0-9]+/i,
          fnc: 'gallery'
        }
      ]
    })
  }

  async gallery (e) {
    if (!global.xxxxxx?.ehentai?.enable) return logger.warn('[xxxxxx] Ehentai未启用')

    const url = e.msg.trim()
    e.reply('EHentai正在解析中...', true, { recallMsg: 5 })

    const html = (await Request.request({ url })).data
    const $ = cheerio.load(html)

    const galleryData = {
      title: $('#gn').text(),
      uploader: $('#gdn a').first().text(),
      posted: $('#gdd .gdt2').eq(0).text(),
      language: $('#gdd .gdt2').eq(3).text(),
      fileSize: $('#gdd .gdt2').eq(4).text(),
      length: $('#gdd .gdt2').eq(5).text(),
      favorited: $('#gdd .gdt2').eq(6).text(),
      rating: $('#rating_label').text(),
      cover: $('#gd1 img').attr('src'),
      tags: {},
      images: [],
      originals: []
    }

    $('#taglist tr').each((_, tr) => {
      const category = $(tr).find('.tc').text().replace(':', '')
      const tags = $(tr).find('td:not(.tc) div a').map((_, a) => $(a).text().trim()).get()
      galleryData.tags[category] = tags
    })

    const getPageImages = async (pageUrl) => {
      const html = (await Request.request({ url: pageUrl })).data
      const $ = cheerio.load(html)
      $('#gdt a').each((_, a) => {
        const $a = $(a); const $div = $a.find('div')
        galleryData.images.push({
          href: $a.attr('href'),
          title: $div.attr('title'),
          thumbnail: $div.css('background')?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || ''
        })
      })
    }

    await getPageImages(url)
    logger.debug(`[xxxxxx] 初始页获取完成，共获取 ${galleryData.images.length} 张图片`)

    const totalImages = parseInt(galleryData.length.match(/\d+/)?.[0] || '0')
    const totalPages = Math.ceil(totalImages / 20)

    logger.debug(`[xxxxxx] 总页数: ${totalPages}, 总图片数: ${totalImages}`)
    let currentPage = 1
    while (galleryData.images.length < totalImages && currentPage < totalPages) {
      const pageUrl = `${url}?p=${currentPage}`
      logger.debug(`[xxxxxx] 获取第 ${currentPage + 1} 页: ${pageUrl}`)
      const prevLen = galleryData.images.length
      await getPageImages(pageUrl)
      const newLen = galleryData.images.length
      logger.debug(`[xxxxxx] 当前共 ${newLen} 张，新增 ${newLen - prevLen} 张`)
      currentPage++
    }

    const tagEmojis = {
      language: '🌐',
      parody: '🎮',
      character: '👥',
      artist: '🎨',
      male: '♂️',
      female: '♀️',
      mixed: '🔄',
      other: '🔍'
    }

    const tagString = Object.entries(galleryData.tags).map(([cat, tags]) => {
      const emoji = tagEmojis[cat.toLowerCase()] || '🏷️'
      return `${emoji} ${cat}:\n   ${tags.join(' ⋄ ')}`
    }).join('\n\n')

    const common = { user_id: e.user_id || 451345424, nickname: e.nickname || '克鲁青山外' }
    const infoMsg = {
      ...common,
      message: [
        `📖 标题: ${galleryData.title}\n` +
        `👤 上传者: ${galleryData.uploader}\n` +
        `📅 发布时间: ${galleryData.posted}\n` +
        `🌐 语言: ${galleryData.language}\n` +
        `📦 文件大小: ${galleryData.fileSize}\n` +
        `📄 页数: ${galleryData.length}\n` +
        `⭐ 收藏数: ${galleryData.favorited}\n` +
        `💯 评分: ${galleryData.rating}\n\n` +
        `🏷️ 标签:\n${tagString}\n`
      ]
    }

    await e.reply(await Bot.makeForwardMsg([infoMsg]))

    for (const item of galleryData.images) {
      try {
        const pageHtml = (await Request.request({ url: item.href })).data
        const $$ = cheerio.load(pageHtml)
        const fullImg = $$('#img').attr('src')
        galleryData.originals.push({ title: item.title, src: fullImg })
      } catch (err) {
        logger.error(`[xxxxxx] 图片页出错: ${item.href}`, err)
        galleryData.originals.push({ title: item.title, src: null })
      }
    }

    const imageMessages = await Promise.all(galleryData.originals.map(async ({ title, src }, i) => {
      const msg = [`📄 第 ${i + 1} 页${title ? ` - ${title}` : ''}`]
      if (src) {
        try {
          const imgData = await Request.request({ url: src })
          msg.push(segment.image(`base64://${Buffer.from(imgData.data).toString('base64')}`))
        } catch {
          msg.push(`❌ 图片加载失败: ${src}`)
        }
      } else {
        msg.push('❌ 图片地址无效')
      }
      return { ...common, message: msg }
    }))

    await e.reply(await Bot.makeForwardMsg(imageMessages))
  }
}
