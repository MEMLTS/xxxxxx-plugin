/* eslint-disable camelcase */

//* 评论,懒得写了
//! https://www.pixiv.net/ajax/illusts/comments/roots?illust_id=${id}&offset=0&limit=3&lang=zh

import { Request } from '#utils'
import { Config } from '#components'

export async function getReq (url) {
  try {
    const { pixiv_PHPSESSID, pixiv_cookie } = global.xxxxxx.cookie

    let response = await Request.request({
      url,
      cookie: pixiv_cookie
    })

    if (response.statusCode === 403) {
      logger.error('请求失败，正在自动更新Pixiv令牌...')

      const res = await Request.request({
        url: 'https://www.pixiv.net/ajax/street/access',
        cookie: `PHPSESSID=${pixiv_PHPSESSID};`
      })

      const setCookies = res.headers['set-cookie']
      if (setCookies && setCookies.length > 0) {
        const allCookies = setCookies.join('; ')
        Config.modify('cookie', 'pixiv_cookie', allCookies)
        logger.info('刷新Cookie成功，重试请求...')

        response = await Request.request({
          url,
          cookie: allCookies,
          headers: {}
        })
      }
    }

    return response
  } catch (error) {
    logger.error('请求失败:', error.message)
    return null
  }
}
