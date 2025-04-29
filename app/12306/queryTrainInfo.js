import fs from 'fs/promises'
import path from 'path'
import { PluginPath, Render } from '#components'
import { Request } from '#utils'
import { formatCurrentDate } from './utils.js'

export class QueryTrainInfo extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]12306查询火车信息',
      dsc: '12306查询火车信息',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?(12306)?(查询|查看|查)?(火车|车次|列车)(信息)?\s*(\S+)$/i,
          fnc: 'queryTrainInfo'
        }
      ]
    })
  }

  async queryTrainInfo (e) {
    let trainNumber = e.msg
      .replace(/^#?(12306)?(查询|查看|查)?(火车|车次|列车)(信息)?\s*(\S+)$/i, '$5')
      .trim()

    if (!trainNumber) {
      return e.reply('请输入火车编号！', true)
    }

    e.reply('正在查询，请稍等...', true, { recallMsg: 7 })

    const filePath = path.join(PluginPath, 'config', 'trainInfo.json')
    let trainData

    try {
      const data = await fs.readFile(filePath, 'utf8')
      const trainInfo = JSON.parse(data)
      trainData = trainInfo.find(
        (train) => train.station_train_code.toLowerCase() === trainNumber.toLowerCase()
      )

      if (!trainData) {
        return e.reply(`未找到列车 ${trainNumber} 的相关信息。`, true)
      }
      const url = `https://kyfw.12306.cn/otn/queryTrainInfo/query?leftTicketDTO.train_no=${trainData.train_no}&leftTicketDTO.train_date=${await formatCurrentDate(true)}&rand_code=null`

      const response = await Request.request({
        url,
        cookie: global.xxxxxx.cookie.a12306_cookie,
        headers: {
          Referer: 'https://kyfw.12306.cn/otn/queryTrainInfo/init'
        }
      })
      const responseData = response.data
      logger.debug(responseData)
      const parsedData = JSON.parse(responseData)
      if (!parsedData.data || !Array.isArray(parsedData.data.data)) {
        return e.reply('获取列车站点信息失败，请稍后重试。')
      }
      const totalTime = parsedData.data.data[parsedData.data.data.length - 1].running_time
      const [hours, minutes] = totalTime.split(':').map(Number)
      const formattedTotalTime = `${hours}小时${minutes}分钟`

      // 获取当前时间
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      // 计算列车当前位置和停站时间
      let currentStation = null
      let stopDuration = null
      for (let i = 0; i < parsedData.data.data.length; i++) {
        const station = parsedData.data.data[i]
        const arriveTime = station.arrive_time === '----' ? null : station.arrive_time.split(':').map(Number)
        const startTime = station.start_time === '----' ? null : station.start_time.split(':').map(Number)

        if (arriveTime && currentTime >= arriveTime[0] * 60 + arriveTime[1] - 5) {
          if (startTime && currentTime <= startTime[0] * 60 + startTime[1] + 5) {
            currentStation = station.station_name
            stopDuration = (startTime[0] * 60 + startTime[1]) - (arriveTime[0] * 60 + arriveTime[1])
            break
          }
        }
      }
      let template
      switch (global.xxxxxx.a12306.QueryTrainType) {
        case 1:
          template = '12306/queryTrainInfo'
          break
        case 2:
          template = '12306/queryTrainInfo2'
          break
        default:
          template = '12306/queryTrainInfo'
      }

      let image = await Render.render(template, {
        trainInfo: trainData,
        stations: parsedData.data.data,
        totalTime: formattedTotalTime,
        totalDistance: formattedTotalTime,
        currentStation,
        stopDuration
      }, {
        e,
        retType: 'base64'
      })

      e.reply(image, true)
    } catch (err) {
      logger.error(err)
      e.reply('查询过程中出现了错误，请稍后重试。')
    }
  }
}
