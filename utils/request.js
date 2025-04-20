import { URL } from 'url'
import https from 'https'
import http from 'http'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { Config } from '#components'

const config = Config.getDefOrConfig('config')

// 默认请求头
const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9'
}

/**
 * HTTP请求工具类，封装了常用的HTTP请求方法
 * 支持代理设置、超时控制、请求头自定义等功能
 */
class Request {
  /**
   * 根据代理URL创建对应的代理Agent
   * @param {string} proxy - 代理URL，支持http/https/socks协议
   * @returns {HttpsProxyAgent|SocksProxyAgent|null} 返回对应的代理Agent，无代理时返回null
   * @throws {Error} 当代理协议不支持时抛出异常
   */
  static createAgent (proxy) {
    if (!proxy || !config.proxy) return null

    const proxyUrl = new URL(proxy)
    switch (proxyUrl.protocol) {
      case 'http:':
      case 'https:':
        return new HttpsProxyAgent(proxy)
      case 'socks:':
      case 'socks5:':
      case 'socks4:':
      case 'socks4a:':
        return new SocksProxyAgent(proxy)
      default:
        throw new Error(`Unsupported proxy protocol: ${proxyUrl.protocol}`)
    }
  }

  /**
   * 发送HTTP请求
   * @param {Object} options - 请求配置
   * @param {string} options.url - 请求URL
   * @param {Object} [options.headers={}] - 自定义请求头
   * @param {Object} [options.data] - 请求体数据(POST/PUT/PATCH时使用)
   * @param {string} [options.cookie] - Cookie字符串
   * @param {string} [options.method='GET'] - HTTP方法(GET/POST/PUT等)
   * @param {number} [options.timeout=10000] - 超时时间(毫秒)
   * @param {string} [options.proxy=config.proxyUrl] - 代理URL
   * @param {Object} [rest] - 其他HTTP请求选项
   * @returns {Promise<Object>} 返回包含响应状态码、头部和数据的对象
   * @throws {Error} 当请求失败或超时时抛出异常
   */
  static async request ({
    url,
    headers = {},
    data,
    cookie,
    method = 'GET',
    timeout = 10000,
    proxy = config.proxyUrl,
    ...rest
  }) {
    const parsedUrl = new URL(url)
    const { protocol, hostname, port, pathname, search } = parsedUrl
    const path = pathname + search

    const mergedHeaders = { ...defaultHeaders, ...headers }

    if (cookie) {
      mergedHeaders.Cookie = cookie
    }

    // 如果没有指定method且有data，则默认为POST
    const httpMethod = method.toUpperCase() || (data ? 'POST' : 'GET')

    // 处理请求体
    let body
    if (data && ['POST', 'PUT', 'PATCH'].includes(httpMethod)) {
      body = JSON.stringify(data)
      mergedHeaders['Content-Type'] = mergedHeaders['Content-Type'] || 'application/json'
      mergedHeaders['Content-Length'] = Buffer.byteLength(body)
    }

    // 创建代理
    const agent = this.createAgent(proxy) || (protocol === 'https:' ? new https.Agent() : new http.Agent())

    // 请求配置
    const options = {
      hostname,
      port: port || (protocol === 'https:' ? 443 : 80),
      path,
      method: httpMethod,
      headers: mergedHeaders,
      agent,
      ...rest
    }

    // 发起请求
    return new Promise((resolve, reject) => {
      const reqModule = protocol === 'https:' ? https : http
      const req = reqModule.request(options, (res) => {
        let rawData = ''
        const response = {
          statusCode: res.statusCode,
          headers: res.headers,
          data: null
        }

        res.on('data', (chunk) => {
          rawData += chunk
        })

        res.on('end', () => {
          try {
            response.data = rawData
            resolve(response)
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`))
          }
        })
      })

      req.on('error', (e) => {
        reject(new Error(`Request failed: ${e.message}`))
      })

      req.setTimeout(timeout, () => {
        req.destroy()
        reject(new Error(`Request timed out after ${timeout}ms`))
      })

      if (body) {
        req.write(body)
      }

      req.end()
    })
  }
}

export default Request
