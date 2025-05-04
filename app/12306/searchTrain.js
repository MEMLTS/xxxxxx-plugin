import { formatCurrentDate } from './utils.js'
import { Request } from '#utils'

export class SearchTrainInfo extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]12306查询火车信息',
      dsc: '12306查询火车信息',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?(12306)?(搜索|search|搜)(火车|车次|列车)(编号|号)?(.+)?$/i,
          fnc: 'searchTrainInfo'
        }
      ]
    })
  }

  async searchTrainInfo (e) {
    let trainNumber = e.msg.replace(/#?(12306)?(搜索|search|搜)(火车|车次|列车)(编号|号)?/i, '')
    let url = `https://search.12306.cn/search/v1/train/search?keyword=${trainNumber}&date=${await formatCurrentDate()}`
    const response = await Request.request({
      url
    })
    logger.info(response)
    const trainData = JSON.parse(response.data).data
    logger.info(trainData)
    if (!Array.isArray(trainData)) {
      return e.reply('未查询到相关车次信息，请检查车次编号是否正确')
    }

    const common = { user_id: e.user_id || 451345424, nickname: e.nickname || '克鲁青山外' }
    const msg = trainData.map(train => ({
      message: `🚆 车次：${train.station_train_code}\n📍 出发站：${train.from_station} → 到达站：${train.to_station}\n📅 日期：${train.date.substring(4, 6)}月${train.date.substring(6)}日\n🆔 列车编号：${train.train_no}\n🎫 余票数量：${train.total_num}`
    })).map(item => ({ ...common, ...item }))

    return e.reply(await Bot.makeForwardMsg(msg))
  }
}
