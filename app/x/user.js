import { getReq } from './request.js'

export class XUser extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]x-user',
      dsc: '推特用户相关接口',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?(x|推特|twitter)(use(r)?|用户)(info|信息)(.+)$/i,
          fnc: 'xUser'
        }
      ]
    })
  }

  async xUser (e) {
    const match = e.msg.match(/^#?(x|推特|twitter)(use(r)?|用户)(info|信息)\s+(.+)$/i)
    if (!match || !match[5]) return e.reply('用户名不能为空！！！', true)
    const userName = match[5].trim()

    const url = `https://x.com/i/api/graphql/32pL5BWe9WKeSK1MoPvFQQ/UserByScreenName?variables=${encodeURIComponent(JSON.stringify({ screen_name: userName }))}&features=${encodeURIComponent(JSON.stringify({
      hidden_profile_subscriptions_enabled: true,
      profile_label_improvements_pcf_label_in_post_enabled: true,
      rweb_tipjar_consumption_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      subscriptions_verification_info_is_identity_verified_enabled: true,
      subscriptions_verification_info_verified_since_enabled: true,
      highlights_tweets_tab_ui_enabled: true,
      responsive_web_twitter_article_notes_tab_enabled: true,
      subscriptions_feature_can_gift_premium: true,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      responsive_web_graphql_timeline_navigation_enabled: true
    }))}&fieldToggles=${encodeURIComponent(JSON.stringify({ withAuxiliaryUserLabels: true }))}`

    try {
      const data = await getReq(url)
      e.reply(data.data, true)
    } catch (error) {
      logger.error('请求失败:', error.message)
      e.reply('获取用户信息失败，请检查控制台输出', true)
    }
  }
}
