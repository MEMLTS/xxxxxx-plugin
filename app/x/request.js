import { Request, getCookieValue } from '#utils'
import { Config } from '#components'

export async function getReq (url) {
  const config = await Config.getDefOrConfig('cookie')
  let retried = false

  const baseRequest = () => {
    const cookie = `auth_token=${config.x_auth_token};ct0=${config.x_ct0};`
    return {
      url,
      cookie,
      headers: {
        authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-csrf-token': config.x_ct0
      }
    }
  }
  try {
    const response = await Request.request(baseRequest())
    if (response.statusCode === 403) {
      logger.error('「xxxxxx-plugin」请求失败，正在自动更新CSRF令牌...')
      const newCt0 = getCookieValue(response.headers['set-cookie'], 'ct0')
      if (newCt0 && !retried) {
        Config.modify('cookie', 'x_ct0', newCt0)
        retried = true
        logger.info('「xxxxxx-plugin」刷新Cookie成功，正在重试请求...')
        return getReq(url)
      }
    }
    return response
  } catch (error) {
    logger.error('请求失败:', error.message)
    return null
  }
}
