/* eslint-disable camelcase */
import { Request, getCookieValue } from '#utils'
import { Config } from '#components'

export async function getReq (url) {
  try {
    const { x_auth_token, x_ct0 } = global.xxxxxx.cookie
    const response = await Request.request({
      url,
      cookie: `auth_token=${x_auth_token};ct0=${x_ct0};`,
      headers: {
        authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-csrf-token': x_ct0
      }
    })

    if (response.statusCode === 403) {
      logger.error('请求失败，正在自动更新x_ct0令牌...')
      const newCt0 = getCookieValue(response.headers['set-cookie'], 'ct0')

      if (newCt0) {
        Config.modify('cookie', 'x_ct0', newCt0)
        logger.info('刷新Cookie成功，重试请求...')
        return getReq(url) // 重试请求
      }
    }

    return response
  } catch (error) {
    logger.error('请求失败:', error.message)
    return null
  }
}
