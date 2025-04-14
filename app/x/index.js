import { getReq } from '../../model/x/index.js'

export class XUser extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]x-user',
      dsc: '推特解析相关接口',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?(x|推特|twitter)(解析)(推文|文章)(.+)?$/i,
          fnc: 'xUser'
        }
      ]
    })
  }

  async xUser (e) {
    const match = e.msg.match(/^#?(x|推特|twitter)(解析)(推文|文章)(.+)?$/i)
    if (!match || !match[4]) return e.reply('不能为空！！！', true)
    const id = match[4].trim()
    const variables = {
      focalTweetId: id,
      referrer: 'search',
      controller_data:
        'DAACDAAFDAABDAABDAABCgABAAAAAAACAAAAAAwAAgoAAQAAAAAAAAAACgAC4BsF21Eg96ILAAMAAAAM6LWk5r2u5ri45oiPCgAFCSKCzM%2Bw%2F2IIAAYAAAASCgAHwPQqsmK9tqEAAAAAAA%3D%3D',
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
      const parsedData = this.parseTweetData(data)

      if (!parsedData) return e.reply('未找到推文信息', true)

      const formattedContent = this.formatTweetResult(parsedData)
      e.reply(formattedContent, true)
    } catch (error) {
      if (error.status === 404) {
        return e.reply('推文不存在或已删除', true)
      }
      logger.error('请求失败:', error.message)
      e.reply('获取推文信息失败，请检查ID是否正确', true)
    }
  }

  // ID格式验证
  sanitizeId (idStr) {
    return idStr.replace(/[^0-9]/g, '')
  }

  // 媒体类型判断
  classifyMedia (media) {
    if (media.type === 'video') {
      const videoInfo = media.video_info
      const highestQuality = videoInfo.variants.reduce((prev, curr) => {
        return (curr.bitrate || 0) > (prev.bitrate || 0) ? curr : prev
      })
      return {
        type: 'video',
        url: highestQuality.url || videoInfo.variants[0].url,
        duration: videoInfo.duration_millis,
        resolution: `${videoInfo.aspect_ratio[0]}x${videoInfo.aspect_ratio[1]}`
      }
    } else {
      return {
        type: 'image',
        url: media.media_url_https,
        dimensions: media.sizes?.large || {}
      }
    }
  }

  parseTweetData (data) {
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

        return {
          tweetId: tweet?.rest_id || '未知',
          userId: tweet?.core?.user_results?.result?.rest_id || '未知',
          userName: tweet?.core?.user_results?.result?.legacy?.name || '未知',
          userScreenName: tweet?.core?.user_results?.result?.legacy?.screen_name || '未知',
          createdAt: legacy.created_at,
          fullText: legacy.full_text || legacy.text || '',
          retweetCount: legacy.retweet_count || 0,
          favoriteCount: legacy.favorite_count || 0,
          replyCount: legacy.reply_count || 0,
          quoteCount: legacy.quote_count || 0,
          viewCount: tweet?.views?.count || 'N/A',
          media: (legacy?.extended_entities?.media || []).map((m) =>
            this.classifyMedia(m)
          )
        }
      }
    }
    return null
  }

  formatTweetResult (data) {
    const mediaList = data.media.map((m) => {
      if (m.type === 'video') {
        return `• 视频: ${m.url} (${m.resolution}, ${Math.round(m.duration / 1000)}秒)`
      } else {
        return `• 图片: ${m.url} (${m.dimensions?.w}x${m.dimensions?.h})`
      }
    })

    return `🐦 推文解析结果：
ID: ${data.tweetId}
用户: ${data.userName} (@${data.userScreenName})
发布时间: ${this.formatDate(data.createdAt)}
👁 查看数: ${data.viewCount}
🔁 转推: ${data.retweetCount}
❤️ 喜欢: ${data.favoriteCount}
💬 评论: ${data.replyCount}
🔗 引用: ${data.quoteCount}

📝 内容:
${data.fullText || '无文本内容'}

📸 媒体:
${mediaList.length ? mediaList.join('\n') : '无媒体'}
`
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
