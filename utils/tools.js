/**
 * 为URL添加尾部斜杠
 * @param {string} url - 要处理的URL
 * @returns {string} 返回处理后的URL，如果已经有斜杠则直接返回，否则添加斜杠后返回
 */
export function addTrailingSlash (url) {
  if (url.endsWith('/')) {
    return url
  } else {
    return url + '/'
  }
}

/**
 * 解析Set-Cookie头中的指定cookie值
 * @param {Array} setCookie - 包含Set-Cookie头的数组
 * @param {string} cookieName - 要查找的cookie名称
 * @returns {string|null} 返回找到的cookie值，如果没有找到则返回null
 */
export function getCookieValue (setCookie = [], cookieName) {
  for (const cookieStr of setCookie) {
    const match = cookieStr.match(new RegExp(`${cookieName}=([^;]+)`))
    if (match) return match[1]
  }
  return null
}
