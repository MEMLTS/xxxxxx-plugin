import fetch from 'node-fetch'
import { randomUUID } from 'crypto'

/**
 * 异步函数，用于将文本从源语言翻译成目标语言。
 * @param {string} sourceText - 要翻译的文本。
 * @param {string} [sourceLang='en'] - 源语言代码，默认为 'en'（英语）。
 * @param {string} [targetLang='zh'] - 目标语言代码，默认为 'zh'（中文）。
 * @param {string} [modelCategory='normal'] - 翻译模型的类别，默认为 'normal'。
 * @param {string} [textDomain=''] - 文本所属的领域，默认为空字符串。
 * @param {string} [session=''] - 会话 ID，默认为空字符串。
 * @param {string} [user=''] - 用户信息，默认为空字符串。
 * @returns {Promise<Object|null>} - 返回一个 Promise，解析为翻译结果的 JSON 对象，如果出错则返回 null。
 */
export async function translateQQText (
  sourceText, // 翻译文本
  sourceLang = 'auto', // 源语言
  targetLang = 'zh', // 目标语言
  modelCategory = 'normal', // 模型类别
  textDomain = '', // 文本领域
  session = '', // 会话 ID
  user = '' // 用户信息
) {
  const uuid = randomUUID()
  const timestamp = Date.now()

  const url = 'https://transmart.qq.com/api/imt'
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      priority: 'u=1, i',
      'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      cookie: `TSMT_CLIENT_KEY=browser-chrome-133.0.0-Linux-${uuid}-${timestamp}`,
      Referer: 'https://transmart.qq.com/zh-CN/index',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    body: JSON.stringify({
      header: {
        fn: 'auto_translation',
        session,
        client_key: `browser-chrome-133.0.0-Linux-${uuid}-${timestamp}`,
        user
      },
      type: 'plain',
      model_category: modelCategory,
      text_domain: textDomain,
      source: {
        lang: sourceLang,
        text_list: [sourceText] // 源文本列表,支持多个文本同时翻译
      },
      target: {
        lang: targetLang
      }
    })
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    return null
  }
}
