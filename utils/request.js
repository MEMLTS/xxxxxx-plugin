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

class Request {
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
