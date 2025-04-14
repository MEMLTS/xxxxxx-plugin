export function addTrailingSlash (url) {
  if (url.endsWith('/')) {
    return url // 如果已经有斜杠，则直接返回
  } else {
    return url + '/' // 如果没有斜杠，则添加斜杠
  }
}
