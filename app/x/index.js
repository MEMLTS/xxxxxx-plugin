import { getReq } from '../../model/x/index.js'
import { Config } from '#components'
import { addTrailingSlash } from '#utils'

export class XDetails extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]x-user',
      dsc: '推特解析相关接口',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?(x|推特|twitter)(解析)(推文|文章)(.+)?$/i,
          fnc: 'XDetail'
        },
        {
          reg: /(?:https?:\/\/)?x\.com\/([^/]+)\/status\/(\d+)/i,
          fnc: 'XDetailFromUrl'
        }
      ]
    })
  }

  async XDetailFromUrl (e) {
    const match = e.msg.match(/(?:https?:\/\/)?x\.com\/([^/]+)\/status\/(\d+)/i)
    if (!match || !match[2]) return e.reply('链接格式错误！', true)

    const tweetId = match[2].trim()

    return this.getTweetDetails(tweetId, e)
  }

  async XDetail (e) {
    const match = e.msg.match(/^#?(x|推特|twitter)(解析)(推文|文章)(.+)?$/i)
    if (!match || !match[4]) return e.reply('不能为空！！！', true)

    const tweetId = match[4].trim()

    return this.getTweetDetails(tweetId, e)
  }

  // 获取推文详情
  async getTweetDetails (tweetId, e) {
    const x = await Config.getDefOrConfig('x')
    if (!x.enable) {
      logger.warn('[xxxxxx] X解析未启用！')
      return false
    }
    await e.reply('检测到X链接，正在解析中...')
    const config = await Config.getDefOrConfig('cookie')
    let commonUrl
    if (config.common && config.commonUrl) {
      commonUrl = addTrailingSlash(config.commonUrl)
    }
    const variables = {
      focalTweetId: tweetId,
      referrer: 'search',
      controller_data: 'DAACDAAFDAABDAABDAABCgABAAAAAAACAAAAAAwAAgoAAQAAAAAAAAAACgAC4BsF21Eg96ILAAMAAAAM6LWk5r2u5ri45oiPCgAFCSKCzM%2Bw%2F2IIAAYAAAASCgAHwPQqsmK9tqEAAAAAAA%3D%3D',
      with_rux_injections: false,
      rankingMode: 'Relevance',
      includePromotedContent: true,
      withCommunity: true,
      withQuickPromoteEligibilityTweetFields: true,
      withBirdwatchNotes: true,
      withVoice: true
    }

    const features = {
      rweb_video_screen_enabled: false,
      profile_label_improvements_pcf_label_in_post_enabled: true,
      rweb_tipjar_consumption_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      premium_content_api_read_enabled: false,
      communities_web_enable_tweet_community_results_fetch: true,
      c9s_tweet_anatomy_moderator_badge_enabled: true,
      responsive_web_grok_analyze_button_fetch_trends_enabled: false,
      responsive_web_grok_analyze_post_followups_enabled: true,
      responsive_web_jetfuel_frame: false,
      responsive_web_grok_share_attachment_enabled: true,
      articles_preview_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: true,
      tweet_awards_web_tipping_enabled: false,
      responsive_web_grok_show_grok_translated_post: false,
      responsive_web_grok_analysis_button_from_backend: true,
      creator_subscriptions_quote_tweet_preview_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_grok_image_annotation_enabled: true,
      responsive_web_enhance_cards_enabled: false
    }

    const fieldToggles = {
      withArticleRichContentState: true,
      withArticlePlainText: false,
      withGrokAnalyze: false,
      withDisallowedReplyControls: false
    }

    const url = `https://x.com/i/api/graphql/b9Yw90FMr_zUb8DvA8r2ug/TweetDetail?variables=${encodeURIComponent(
      JSON.stringify(variables)
    )}&features=${encodeURIComponent(
      JSON.stringify(features)
    )}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`

    try {
      const response = await getReq(url)
      const data = JSON.parse(response.data)

      const entries = data?.data?.threaded_conversation_with_injections_v2?.instructions?.flatMap(
        (inst) => inst.entries || []
      ) || []

      for (const entry of entries) {
        if (
          entry?.content?.entryType === 'TimelineTimelineItem' &&
          entry?.content?.itemContent?.itemType === 'TimelineTweet'
        ) {
          const tweet = entry.content.itemContent.tweet_results.result
          const legacy = tweet?.legacy || {}

          const tweetId = tweet?.rest_id || '未知'
          const userName = tweet?.core?.user_results?.result?.legacy?.name || '未知'
          const userScreenName = tweet?.core?.user_results?.result?.legacy?.screen_name || '未知'
          const createdAt = legacy.created_at
          const fullText = legacy.full_text || legacy.text || ''
          const retweetCount = legacy.retweet_count || 0
          const favoriteCount = legacy.favorite_count || 0
          const replyCount = legacy.reply_count || 0
          const quoteCount = legacy.quote_count || 0
          const viewCount = tweet?.views?.count || 'N/A'

          const mediaList = (legacy?.extended_entities?.media || []).map((m, index) => {
            try {
              if (m.type === 'video' || m.type === 'animated_gif') {
                const variants = m.video_info?.variants
                  ?.filter(v => v.bitrate && v.content_type === 'video/mp4')
                  ?.sort((a, b) => b.bitrate - a.bitrate) || []

                if (variants.length > 0) {
                  return segment.video(config.common ? [commonUrl + variants[0].url] : variants[0].url)
                }
                return segment.text('[视频暂不支持]')
              }

              if (m.type === 'photo') {
                const sizes = m.sizes?.large || m.sizes?.medium || m.sizes?.small
                const url = sizes ? `${m.media_url_https}?format=jpg&name=large` : m.media_url_https
                return segment.image(config.common ? [commonUrl + url] : url)
              }

              return segment.text(`[未知媒体类型: ${m.type}]`)
            } catch (err) {
              logger.error(`媒体处理错误[${index}]:`, err)
              return segment.text('[媒体解析失败]')
            }
          }) || [segment.text('无媒体')]

          const formattedContent = [
            `🐦 推文解析结果
ID: ${tweetId}
用户: ${userName} (@${userScreenName})
发布时间: ${this.formatDate(createdAt)}
👁 查看数: ${viewCount}
🔁 转推: ${retweetCount}
❤️ 喜欢: ${favoriteCount}
💬 评论: ${replyCount}
🔗 引用: ${quoteCount}

📝 内容
${fullText || '无文本内容'}`,
            ...mediaList
          ]

          return e.reply(formattedContent, true)
        }
      }

      return e.reply('未找到推文信息', true)
    } catch (error) {
      if (error.status === 404) {
        return e.reply('推文不存在或已删除', true)
      }
      logger.error('请求失败:', error.message)
      return e.reply('获取推文信息失败，请检查ID是否正确', true)
    }
  }

  // 时间格式化
  formatDate (dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
