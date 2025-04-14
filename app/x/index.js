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

    const url = `https://x.com/i/api/graphql/b9Yw90FMr_zUb8DvA8r2ug/TweetDetail?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`
    try {
      const data = await getReq(url)
      const jsonData = JSON.parse(data.data)

      const mainContent = this.extractMainContent(jsonData)

      e.reply(mainContent, true)
    } catch (error) {
      logger.error('请求失败:', error.message)
      e.reply('获取推特信息失败，请检查控制台输出', true)
    }
  }

  extractMainContent (data) {
    const mainContent = []

    // 遍历 entries 提取关键信息
    const entries = data.data.threaded_conversation_with_injections_v2.instructions[0].entries
    for (const entry of entries) {
      if (entry.content.entryType === 'TimelineTimelineItem' && entry.content.itemContent.itemType === 'TimelineTweet') {
        const tweet = entry.content.itemContent.tweet_results.result

        const tweetInfo = {
          tweetId: tweet.rest_id,
          userId: tweet.core.user_results.result.rest_id,
          userName: tweet.core.user_results.result.legacy.name,
          userScreenName: tweet.core.user_results.result.legacy.screen_name,
          createdAt: tweet.legacy.created_at,
          fullText: tweet.legacy.full_text,
          retweetCount: tweet.legacy.retweet_count,
          favoriteCount: tweet.legacy.favorite_count,
          replyCount: tweet.legacy.reply_count,
          quoteCount: tweet.legacy.quote_count,
          viewCount: tweet.views.count,
          media: tweet.legacy.extended_entities?.media?.map((media) => ({
            mediaUrl: media.media_url_https,
            mediaType: media.type
          }))
        }

        mainContent.push(tweetInfo)
      }
    }

    return mainContent
  }
}
