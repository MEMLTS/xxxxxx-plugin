/**
 * 获取当前日期并格式化为YYYYMMDD格式
 * @param {boolean} disconnect - 是否使用连字符分隔日期
 * @returns {string} 格式化后的日期字符串
 */
export async function formatCurrentDate (disconnect = false) {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 获取月份并确保是两位数
  const day = String(date.getDate()).padStart(2, '0') // 获取日期并确保是两位数

  if (disconnect) {
    return `${year}-${month}-${day}`
  }
  return `${year}${month}${day}`
}
